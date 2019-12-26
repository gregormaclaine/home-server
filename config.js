require('dotenv').config();

const PASSWORD = process.env.PASSWORD || 'password';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 80;

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

module.exports = {
  PASSWORD,
  PORT,
  EMAIL,
  EMAIL_PASSWORD
}
