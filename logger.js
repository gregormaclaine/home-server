const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile)
const deleteFile = promisify(fs.unlink);
const readFolder = promisify(fs.readdir);

const dateFormat = 'DD-MM-YY';
const timeFormat = 'HH:mm:ss:SSS';

class Logger {
  constructor(folder) {
    this.folder = folder;
    if (!fs.existsSync(`./logs/${this.folder}/`)) fs.mkdirSync(`./logs/${this.folder}/`);

    this.updateFilename();
  }

  get logFile() { return `./logs/${this.folder}/${this.date}${this.version !== 1 ?  ` (${this.version})` : ''}.log`; }

  log(message) {
    console.log(message);
    this.logs += `[${moment().format(timeFormat)}] - ${message.includes('Error') ? '⚠️  ' : ''}${message}\n`;
    this.updateFilename()
    this.record();
  }

  updateFilename() {
    const currentDay = moment().format(dateFormat);
    if (this.date === currentDay) return;
    this.date = currentDay;
    this.logs = '';
    this.version = 1;
    while (fs.existsSync(this.logFile)) this.version++;
  }

  record() { writeFile(this.logFile, this.logs); }

  static async flattenLogs(folder) {
    if (folder) return this.flattenLogFolder(folder);
    
    const folders = await readFolder('logs/').catch(e => console.error(e));
    (folders || []).forEach(folder => {
      Logger.flattenLogFolder(folder)
    });
  }

  static async flattenLogFolder(folder) {
    const logs = await readFolder('logs/' + folder).catch(e => console.error(e));
    if (!logs) return;

    const days = logs.reduce((obj, log) => {
      const date = log.substr(0, dateFormat.length);
      return obj[date] ? { ...obj, [date]: obj[date].concat([ log ]) } : { ...obj, [date]: [ log ] }
    }, {});

    for (const day in days) {
      const files = days[day];

      const lines = [];
      await Promise.all(files.map(async file => {
        const text = String(await readFile(`logs/${folder}/${file}`).catch(e => console.error(e)));
        if (text) lines.push(...text.split('\n').filter(l => l));
      }, []));

      const sortedLines = lines.sort((a, b) => {
        const ad = a.substr(1, timeFormat.length);
        const bd = b.substr(1, timeFormat.length);
        if (ad === bd) return 0;
        return moment(ad, timeFormat).isBefore(moment(bd, timeFormat)) ? -1 : 1;
      })
      
      await Promise.all(files.map(async file => await deleteFile(`logs/${folder}/${file}`)));
      await writeFile(`logs/${folder}/${day}.log`, sortedLines.join('\n'));
    }
  }
}

const loggers = [];
function createLogger(folder) {
  const l = new Logger(folder);
  loggers.push(l);
  return l.log.bind(l);
}
module.exports = createLogger;

if (require.main === module) Logger.flattenLogs(process.argv[2]);
