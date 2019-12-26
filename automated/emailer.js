const nodemailer = require('nodemailer');

const { EMAIL, EMAIL_PASSWORD } = require('../config');

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

module.exports = sendEmail;
