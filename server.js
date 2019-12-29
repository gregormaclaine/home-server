const express = require('express');
const app = express();

const { PASSWORD, PORT } = require('./config');
const log = require('./logger')('server');

function checkAuth(req, res, next) {
  if (!req.authenticated) return res.status(403).json({ message: 'Error: Not authenticated' });
  next();
}

app.listen(PORT);
app.use(require('cors')());

app.use((req, res, next) => {
  req.authenticated = req.headers.password === PASSWORD;
  const ip = req.connection.remoteAddress;
  log(`${req.authenticated ? '✔️' : '❌'}  ${req.method}: '${req._parsedUrl.pathname}' from '${ip ? ip.slice(7) : 'Unknown'}'`);
  next();
});

app.all('/', (req, res) => {
  res.status(200).send('My Server');
});

app.use('/logs', checkAuth, require('./routes/logs'));

module.exports = app;
