const os = require('os');
const axios = require('axios');

const { PORT } = require('./config');

function getLocalIPAddress() {
  return os.networkInterfaces().WiFi.find(c => c.family === 'IPv4').address;
}

async function getPublicIPAddress() {
  const { data: { ip } } = await axios.get('https://api.ipify.org?format=json');
  return ip;
}

const app = require('./server');

const start = async () => {
  const borders = Array(30).fill('=').join('');
  console.log(`${borders}\nServer is running on:\n   Local:    ${getLocalIPAddress()}:${PORT}\n   Public:   ${await getPublicIPAddress()}:${PORT}\nAwaiting messages...\n${borders}`);
}
start();
