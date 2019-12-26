require('dotenv').config();

module.exports = {
  PASSWORD: process.env.PASSWORD,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 80,
  EMAIL: process.env.EMAIL,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
}
