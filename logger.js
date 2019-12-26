const moment = require('moment');
const fs = require('fs');

class Logger {
  constructor(folder) {
    this.date = Logger.getDate();
    this.logs = '';
    this.folder = folder;
  }

  get logFile() { return `./logs/${this.folder}/${this.date}.log`; }

  static getDate() { return moment().format('DD-MM-YY'); }

  log(message) {
    console.log(message);
    this.logs += `${moment().format('HH:mm')}: ${message}\n`;
    this.updateFilename()
    this.record();
  }

  updateFilename() {
    const currentDay = Logger.getDate();
    if (this.date === currentDay) return;
    this.date = currentDay;
    this.logs = '';
  }

  record() { fs.writeFileSync(this.logFile, this.logs); }
}

const loggers = ['server', 'automated'];

module.exports = loggers.reduce((obj, name) => {
  const l = new Logger(name);
  return { ...obj, [name]: l.log.bind(l) };
}, {});
