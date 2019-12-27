const express = require('express');
const app = express();

const { PASSWORD, PORT } = require('./config');
const log = require('./logger')('server');
const commands = require('./commands');

function checkAuth(req, res, next) {
  if (req.authenticated) {
    next();
  } else {
    res.status(403).send('Error: Not authenticated');
  }
}

app.listen(PORT);

app.use((req, res, next) => {
  req.authenticated = req.query.password === PASSWORD;
  log(`${req.authenticated ? '✔️' : '❌'}  ${req.method}: '${req._parsedUrl.pathname}'`);
  next();
});

app.all('/', (req, res) => {
  res.status(200).send('My Server');
});

app.all('/call/:command/:args*?', checkAuth, async (req, res) => {
  const command = req.params.command;
  const args = (req.params.args || '').split(',')
  if (!commands[command]) {
    log(`Handled Error: Could not find command '${command}'`);
    return res.status(404).send(`Error: Could not find command '${command}'`)
  };

  log(`Running command '${command}' with args [${args}]`);

  try {
    const result = commands[command].constructor.name === "AsyncFunction" ? await commands[command](log, ...args) : commands[command](log, ...args);
    if (!result) throw new Error('No result was returned...')
    res.status(200).send(result);
    log('Result sent');
  } catch (e) {
    log(`Caught ${e.name}: ${e.message}`);
    console.error(e);
    res.status(500).send('Error: Something went wrong...<br />Please check the logs');
  }
});

module.exports = app;
