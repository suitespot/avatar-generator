const ColorScheme = require('color-scheme');
const express = require('express');
const { AvatarGenerator } = require('initials-avatar-generator');

const app = express();
const port = process.env.PORT || 3000;

app.get('/_health', (req, res) => {
  res.send('ok');
});

app.get('/avatar/generate', (req, res) => {
  const [reg, dark, light, med] = generatorColorsFromRequest(req);
  const colorIndex = Math.floor(Math.random() * 3);
  const option = {
    width: 200,
    text: 'WF',
    color: '#' + [reg, dark, med][colorIndex],
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
  const [hue] = Array.isArray(req.query.hue) ? req.query.hue : [req.query.hue || 'random'];

  scheme.from_hue(hue === 'random' ? Math.random() * 360 : parseInt(hue, 10))
    .scheme(schemeType)
    .variation(variation);

  return scheme.colors();
}

app.get('/colors/scheme/:scheme.html', (req, res) => {
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
  const colors = generatorColorsFromRequest(req);

  res.status(200)
    .contentType('application/json')
    .send(colors);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
