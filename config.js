require('dotenv').config();

const PASSWORD = process.env.PASSWORD || 'password';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 80;

module.exports = {
  PASSWORD,
  PORT
}
