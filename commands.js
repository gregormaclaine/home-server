const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readFolder = promisify(fs.readdir);

async function list_logs() {
  const folders = await readFolder('logs/').catch(() => { throw new Error('Could not find log folders') });
  const logFiles = await Promise.all(folders.map(async folder => {
    const files = await readFolder('logs/' + folder).catch(() => { throw new Error(`Could not find log files in folder '${folder}'`) });
    return [folder, files];
  }));
  return logFiles.map(([ folder, files ]) => {
    return `${folder}<br />+---${files.join('<br />+---')}`;
  }).join('<br /><br />');
}

async function read_log(log, folder, file) {
  if (file === 'recent') {
    const files = await readFolder('logs/' + folder).catch(() => { throw new Error(`Could read log folder '${folder}'`) });
    const recentDate = moment(files.map(f => moment(f.substr(0, 8), 'DD-MM-YY')).reduce((r, f) => moment(r).isAfter(f) ? r : f)).format('DD-MM-YY');
    file = recentDate + '.log'
    let version = 1;
    while (fs.existsSync(`logs/${folder}/${file}`)) {
      file = `${recentDate} (${++version}).log`;
    }
    file = `${recentDate} (${--version}).log`;
    log(`Reading file '${file}'`);
  }

  const path = `logs/${folder}/${file}`;
  const logs = await readFile(path).catch(() => { throw new Error(`Could not read log file '${path}'`) });
  return String(logs).replace(/\n/g, '<br />'); 
}

const commands = {
  list_logs,
  read_log
}

function help(log) {
  return `Callable commands<br />+---help<br />+---${Object.keys(commands).join('<br />+---')}`
}

module.exports = { ...commands, help }