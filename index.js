const ColorScheme = require('color-scheme');
const express = require('express');
const http = require('http');
const { LogFactory } = require('@suitespot/cloud-logger');
const { AvatarGenerator } = require('initials-avatar-generator');

const log = LogFactory.getLogger('AvatarService');

const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;

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

const loggerMiddleware = (req, res, next) => {
  const startHrTime = process.hrtime();
  res.on('close', () => {
    const endHrTime = process.hrtime(startHrTime);
    const durationMillis = (endHrTime[0] * 1000) + (endHrTime[1] / 1000000);
    const statusCode = res.statusCode;
    const loggingDetails = {
      query: req.query,
      path: req.path,
      route: req.route?.path,
      method: req.method,
      statusCode,
      responseMs: durationMillis,
    };
    log.info(`Request: ${req.method} ${req.url} - ${res.statusCode} ${durationMillis.toFixed(2)}ms`, logginDetails);
  });
  next();
};
app.use(loggerMiddleware);

app.get('/_health', (req, res) => {
  res.send('ok');
});

app.get('/avatar/:base64Options.png', (req, res) => {
  const encodedParams = req.params['base64Options'];
  const decodedParams = encodedParams ? Buffer.from(encodedParams, 'base64').toString('utf-8') : null;
  const options = decodedParams ? JSON.parse(decodedParams) : (req.query || {});
  const [reg, dark, light, medium] = generatorColors(options);
  const colorTypes = { reg, dark, light, medium };
  const option = {
    text: 'WF',
    color: '#' + colorTypes[req.colorType || 'dark'],
    fontColor: '#' + light,
    shape: 'square', //'circle',
    ...options,
    width: parseInt(options.width, 10) || 200,
  };

  const avatarGenerator = new AvatarGenerator();
  avatarGenerator.generate(option, image => {
    image
      .stream('png')
      .pipe(res.contentType('image/png').status(200));
  });
});

app.get('/avatar/generate', (req, res) => {
  const [reg, dark, light, medium] = generatorColors(req.query);
  const colorTypes = { reg, dark, light, medium };
  const option = {
    text: 'WF',
    color: '#' + colorTypes[req.colorType || 'dark'],
    fontColor: '#' + light,
    shape: 'square', //'circle',
    ...req.query,
    width: parseInt(req.query.width, 10) || 200,
  };

  const avatarGenerator = new AvatarGenerator();
  avatarGenerator.generate(option, image => {
    image
      .stream('png')
      .on('error', error => {
        log.error(`Error generating avatar png`, error);
        res.status(500).send(error);
      })
      .pipe(res.contentType('image/png').status(200));
  });
});

function generatorColors(options, schemeType = 'mono') {
  const scheme = new ColorScheme();
  const [variation] = Array.isArray(options.variation) ? options.variation : [options.variation || 'hard'];
  const [hue] = Array.isArray(options.hue) ? options.hue : [options.hue];
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
  const [reg, dark, light, med] = generatorColors(req.query, req.params['scheme']);
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
  const colors = generatorColors(req, req.params['scheme']);

  res.status(200)
    .contentType('application/json')
    .send(colors);
});

const errorHandler = (error, req, res, next) => {
  log.error(`Error handler middleware.`, error);
  const result = {
    error: error.message,
    statusCode: 500,
  };
  res.status(500).send(JSON.stringify(result));
};
app.use(errorHandler);


const server = http.createServer(app);
server.keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT_MS, 10) || 240000;
log.info('KeepAliveTimeout: ' + server.keepAliveTimeout + 'ms');
server.listen(port, () => {
  log.info(`Listening on port ${port}`);
});
