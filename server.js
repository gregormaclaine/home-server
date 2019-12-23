const express = require('express');
const app = express();

app.listen(80);

app.use((req, res, next) => {
  console.log(`${req.method}: '${req.url}'`);
  next();
});

app.get('/', (req, res, next) => {
  res.status(200).send('My Server');
});

console.log('Server is Running...\n');