const axios = require('axios');
const nodemailer = require('nodemailer');

const { log } = require('../../logger')('public-ip');
const { EMAIL, EMAIL_PASSWORD } = require('../../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD
  }
});

const sendEmail = (subject, text, callback) => {
  transporter.sendMail({
    from: EMAIL,
    to: EMAIL,
    subject,
    html: text
  }, err => {
    if (err) return console.error(err);
    callback();
  });
}

class PublicIP {
  constructor() {
    this.ip = null;
    this.log = log;

    log('Starting automated IP Address checker...');
  }

  async run() {
    console.log('');
    log('Beginning Public-IP sequence...');
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

module.exports = { task: new PublicIP(), timeout: 5 * 60 * 1000 };
