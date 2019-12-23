require('dotenv').config()
const express = require('express');
const app = express();

app.listen(80);

app.use((req, res, next) => {
  req.authenticated = req.query.password === process.env.PASSWORD;
  console.log(`${req.authenticated ? '✔️' : '❌'}  ${req.method}: '${req.url}'`);
  next();
});

app.all('/', (req, res) => {
  res.status(200).send(req.authenticated ? 'My Server' : 'Error: Not authenticated');
});

console.log('Server is Running...\n');
