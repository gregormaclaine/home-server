const moment = require('moment');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile)
const deleteFile = util.promisify(fs.unlink);

class Logger {
  constructor(folder) {
    this.date = Logger.getDate();
    this.logs = '';
    this.folder = folder;

    this.version = 1;
    while (fs.existsSync(this.logFile)) this.version++;
  }

  get logFile() { return `./logs/${this.folder}/${this.date}${this.version !== 1 ?  ` (${this.version})` : ''}.log`; }

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

  static flattenLogs(folder) {
    if (folder) return this.flattenLogFolder(folder);

    fs.readdir('logs/', (err, folders) => {
      if (err) return console.error(err); 
      folders.forEach(folder => {
        Logger.flattenLogFolder(folder)
      });
    });
  }

  static async flattenLogFolder(folder) {
    fs.readdir('logs/' + folder, async (err, logs) => {
      if (err) return console.error(err);

      const days = logs.reduce((obj, log) => {
        const date = log.substr(0, 8);
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
          const ad = a.substr(0, 5);
          const bd = b.substr(0, 5);
          if (ad === bd) return 0;
          return moment(ad, 'HH:mm').isBefore(moment(bd, 'HH:mm')) ? -1 : 1;
        })
        
        await Promise.all(files.map(async file => await deleteFile(`logs/${folder}/${file}`)));
        await writeFile(`logs/${folder}/${day}.log`, sortedLines.join('\n'));
      }
    });
  }
}

const loggers = ['server', 'automated'];

module.exports = loggers.reduce((obj, name) => {
  const l = new Logger(name);
  return { ...obj, [name]: l.log.bind(l) };
}, {});

if (require.main === module) Logger.flattenLogs(process.argv[2]);
