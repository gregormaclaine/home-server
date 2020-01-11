const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');

const appendFile = promisify(fs.appendFile);

const dateFormat = 'DD-MM-YY';
const timeFormat = 'HH:mm:ss:SSS';

class Logger {
  constructor(folder) {
    this.folder = folder;
    if (!fs.existsSync(`./logs/`)) fs.mkdirSync(`./logs/`);
    if (!fs.existsSync(`./logs/${this.folder}/`)) fs.mkdirSync(`./logs/${this.folder}/`);
  }

  logFile() { return `./logs/${this.folder}/${moment().format(dateFormat)}.log`; }

  log(message) {
    console.log(message);
    this.record(`[${moment().format(timeFormat)}] - ${message}\n`);
  }

  error(e) {
    console.error(e);
    this.record(`[${moment().format(timeFormat)}] - ⚠️  ${e.name}: ${e.message}\n`);
  }

  async record(message) {
    await appendFile(this.logFile(), message);
  }

  // static async flattenLogs(folder) {
  //   const output = createLogger('flattener');
  //   if (folder) return Logger.flattenLogFolder(folder, output);
    
  //   const folders = await readFolder('logs/').catch(output.logError);
  //   await Promise.all((folders || []).map(async folder => {
  //     await Logger.flattenLogFolder(folder, output);
  //   }));
  // }

  // static async flattenLogFolder(folder, output) {
  //   output.log(`Flattening log folder: '${folder}'`);
  //   const logs = await readFolder('logs/' + folder).catch(output.logError);
  //   if (!logs) return;

  //   // console.log(logs);
  //   // const currentFile = Logger.getRecentLog(logs);
  //   // if (currentFile) logs.splice(logs.indexOf(currentFile), 1);
  //   // console.log(logs)

  //   const days = logs.reduce((obj, log) => {
  //     const date = log.substr(0, dateFormat.length);
  //     return obj[date] ? { ...obj, [date]: obj[date].concat([ log ]) } : { ...obj, [date]: [ log ] }
  //   }, {});

  //   for (const day in days) {
  //     const files = days[day];

  //     const lines = [];
  //     await Promise.all(files.map(async file => {
  //       const text = String(await readFile(`logs/${folder}/${file}`).catch(output.logError));
  //       if (text) lines.push(...text.split('\n').filter(l => l));
  //     }, []));

  //     const sortedLines = lines.sort((a, b) => {
  //       const ad = a.substr(1, timeFormat.length);
  //       const bd = b.substr(1, timeFormat.length);
  //       if (ad === bd) return 0;
  //       return moment(ad, timeFormat).isBefore(moment(bd, timeFormat)) ? -1 : 1;
  //     });
      
  //     await Promise.all(files.map(async file => await deleteFile(`logs/${folder}/${file}`).catch(output.logError)));
  //     await writeFile(`logs/${folder}/${day}.log`, sortedLines.join('\n')).catch(output.logError);
  //   }

  //   // await renameFile(`logs/${folder}/${currentFile}`, `logs/${folder}/${currentFile.substr(0, dateFormat.length)} (2).log`).catch(output.logError);
  // }

  // static getRecentLog(files) {
  //   if (files.length === 0) return null;
  //   const recentDate = moment(files.map(f => moment(f.substr(0, 8), 'DD-MM-YY')).reduce((r, f) => moment(r).isAfter(f) ? r : f)).format('DD-MM-YY');

  //   const todaysFiles = files.filter(f => f.substr(0, 8) === recentDate);
  //   const file = todaysFiles.reduce((max, file) => {
  //     const maxNum = max.match(/\((\d+)\)/);
  //     const fileNum = file.match(/\((\d+)\)/);
  //     return parseInt(maxNum ? maxNum[1] : '1') > parseInt(fileNum ? fileNum[1] : '1') ? max : file;
  //   });

  //   return file;
  // }
}

const loggers = [];
function createLogger(folder) {
  const l = new Logger(folder);
  loggers.push(l);
  return { log: l.log.bind(l), logError: l.error.bind(l) };
}
module.exports = createLogger;

// if (require.main === module) Logger.flattenLogs(process.argv[2]);
