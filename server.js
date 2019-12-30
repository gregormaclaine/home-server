const express = require('express');
const app = express();

const { PASSWORD, PORT } = require('./config');

function checkAuth(req, res, next) {
  if (!req.authenticated) return res.status(206).json({ authenticated: false });
  next();
}

app.listen(PORT);
app.use(require('cors')());

const { log, logError } = require('./logger')('server')
app.use((req, res, next) => { res.log = log; res.logError = logError; next() });

app.use((req, res, next) => {
  req.authenticated = req.headers.password === PASSWORD;
  const mip = req.connection.remoteAddress;
  const ip = mip === '::1' ? 'localhost' : mip ? mip.slice(7) : 'Unknown';
  res.log(`${req.authenticated ? '✔️' : '❌'}  ${req.method}: '${req.url}' from '${ip}'`);
  next();
});

app.all('/', (req, res) => {
  res.status(200).send('My Server');
});

app.use('/logs', checkAuth, require('./routes/logs'));

module.exports = app;
