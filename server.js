const os = require('os');
const axios = require('axios');
const express = require('express');
const app = express();

const { PASSWORD, PORT } = require('./config');
const log = require('./logger')('server');

function getLocalIPAddress() {
  return os.networkInterfaces().WiFi.find(c => c.family === 'IPv4').address;
}

async function getPublicIPAddress() {
  const { data: { ip } } = await axios.get('https://api.ipify.org?format=json');
  return ip;
}

app.listen(PORT);

app.use((req, res, next) => {
  req.authenticated = req.query.password === PASSWORD;
  log(`${req.authenticated ? '✔️' : '❌'}  ${req.method}: '${req._parsedUrl.pathname}'`);
  next();
});

app.all('/', (req, res) => {
  res.status(req.authenticated ? 200 : 403).send(req.authenticated ? 'My Server' : 'Error: Not authenticated');
});

const start = async () => {
  const borders = Array(30).fill('=').join('');
  console.log(`${borders}\nServer is running on:\n   Local:    ${getLocalIPAddress()}:${PORT}\n   Public:   ${await getPublicIPAddress()}:${PORT}\nAwaiting messages...\n${borders}`);
}
start();
