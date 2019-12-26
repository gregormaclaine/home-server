const moment = require('moment');
const fs = require('fs');

class Logger {
  constructor() {
    this.date = moment().format('dddd Do MMM YYYY');
    this.logs = '';
  }

  get logFile() {
    return `./logs/${this.date}.log`;
  }

  log(message) {
    console.log(message);
    this.logs += `${moment().format('HH:mm')}: ${message}\n`;
    this.updateFilename()
    this.record();
  }

  updateFilename() {
    const currentDay = moment().format('dddd Do MMM YYYY')
    if (this.date === currentDay) return;
    this.date = currentDay;
    this.logs = '';
  }

  record() {
    fs.writeFileSync(this.logFile, this.logs);
  }
}

const logger = new Logger();

module.exports = logger.log.bind(logger);
