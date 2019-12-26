const axios = require('axios');

const sendEmail = require('./emailer');
const log = require('../logger')('automated');

class Automated {
  constructor() {
    this.ip = null;
    this.interval = null;
  }

  start() {
    log('Starting automated IP Address checker...');
    this.run();
    this.interval = setInterval(this.run.bind(this), 1000 * 60 * 5);
  }

  async run() {
    console.log('');
    log('Beginning sequence...');
    const previousIP = this.ip;
    await this.updateIP();
    if (previousIP !== this.ip) this.sendUpdate(previousIP);
  }

  async updateIP() {
    log('Getting public IP...');
    const { data: { ip } } = await axios.get('https://api.ipify.org?format=json');
    log('Received public IP - ' + ip);
    this.ip = ip;
  }

  sendUpdate(previousIP) {
    log('Sending updated IP to email server...');
    sendEmail(
      `The server IP address has changed to '${this.ip}'`,
      `<h1>The IP address changed from <span style="font-weight:900;">${previousIP}</span> to <span style="font-weight:900;color: red;">${this.ip}</span></h1>`,
      () => log('Update sent.')
    );
  }
}

const runner = new Automated();
runner.start();
