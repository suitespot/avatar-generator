const ColorScheme = require('color-scheme');
const express = require('express');
const { AvatarGenerator } = require('initials-avatar-generator');

const app = express();
const port = process.env.PORT || 3000;

function hashMod(buckets) {
  buckets = buckets || 100;
  return value => integerHash(value) % buckets;
}

function integerHash(value) {
  return (value + '')
    .split('')
    .reduce(
      (memo, item) => (memo * 31 * item.charCodeAt(0)) % 982451653,
      7,
    );
}

function hashInt(x) {
  const A = (typeof Uint32Array === undefined) ? [0] : new Uint32Array(1);
  A[0] = x | 0;
  A[0] -= (A[0] << 6);
  A[0] ^= (A[0] >>> 17);
  A[0] -= (A[0] << 9);
  A[0] ^= (A[0] << 4);
  A[0] -= (A[0] << 3);
  A[0] ^= (A[0] << 10);
  A[0] ^= (A[0] >>> 15);
  return A[0];
}

app.get('/_health', (req, res) => {
  console.log('/_health');
  res.send('ok');
});

app.get('/avatar/generate', (req, res) => {
  console.log('/avatar/generate');
  const [reg, dark, light, medium] = generatorColorsFromRequest(req);
  const colorTypes = { reg, dark, light, medium };
  const option = {
    width: 200,
    text: 'WF',
    color: '#' + colorTypes[req.colorType || 'dark'],
    fontColor: '#' + light,
    shape: 'square', //'circle',
    ...req.query,
  };

  const avatarGenerator = new AvatarGenerator();
  avatarGenerator.generate(option, image => {
    image
      .stream('png')
      .pipe(res.contentType('image/png').status(200));
  });
});

function generatorColorsFromRequest(req = { params: {}, query: {} }) {
  const scheme = new ColorScheme();
  const schemeType = req.params['scheme'] || 'mono';
  const [variation] = Array.isArray(req.query.variation) ? req.query.variation : [req.query.variation || 'hard'];
  const [hue] = Array.isArray(req.query.hue) ? req.query.hue : [req.query.hue];
  let hueDegrees = hue ? parseInt(hue, 10) : 21;
  if (hue === 'random') {
    hueDegrees = Math.random() * 360;
  } else if (isNaN(hueDegrees)) {
    hueDegrees = hashMod(360)(hue);
  }
  scheme.from_hue(hueDegrees)
    .scheme(schemeType)
    .variation(variation);

  return scheme.colors();
}

app.get('/colors/scheme/:scheme.html', (req, res) => {
  console.log('/colors/scheme/:scheme.html');
  const [reg, dark, light, med] = generatorColorsFromRequest(req);
  res.status(200)
    .contentType('text/html')
    .send(`
      <div style="background-color: ${reg}; width: 100px; height: 100px; padding: 10px;"></div>
      <div style="background-color: ${dark}; width: 100px; height: 100px; padding: 10px;"></div>
      <div style="background-color: ${light}; width: 100px; height: 100px; padding: 10px;"></div>
      <div style="background-color: ${med}; width: 100px; height: 100px; padding: 10px;"></div>
    `);
});

app.get('/colors/scheme/:scheme', (req, res) => {
  console.log('/colors/scheme/:scheme');
  const colors = generatorColorsFromRequest(req);

  res.status(200)
    .contentType('application/json')
    .send(colors);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
