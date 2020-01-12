const { spawn: spawnSync } = require('child_process');

const { log, logError } = require('../../logger')('cicd');

function spawn(...args) {
  return new Promise((resolve, reject) => {
    const instance = spawnSync(args[0], args.slice(1));
    let output = '';
    let errorOut = '';
    instance.stdout.on('data', data => output += data);
    instance.stderr.on('data', data => errorOut += data);
    instance.on('close', code => code === 0 ? resolve(output) : reject(new Error(errorOut.split('\n')[0])));
  });
}

class CICD {
  constructor() {
    this.log = log;
    log('Starting up CICD...');
    this.running = false;
    this.runAttempts = 0;
  }

  async run() {
    log('Running automated cicd check...');
    const gitStatus = await this.getStatus();
    console.table(gitStatus);
    const outOfDate = gitStatus.filter(s => !s.upToDate);
    if (outOfDate.length === 0) return log('All folders are up to date');
    log(`The following folders are out of date: ${outOfDate.map(s => s.folder).join(', ')}`);
    for (const { folder, newCommitCount, overview } of outOfDate) {
      log(`Folder: '${folder}' is ${newCommitCount} commits out of date - new commits span ${overview}`);
      await this.pullFolder(folder);
      await this.npmInstallFolder(folder);
    }
    log('Automated cicd check finished');
  }

  async npmInstallFolder(folder) {
    log(`Installing node-modules for folder: '${folder}'...`);
    await spawn('C:\\Projects\\GServer\\home-server\\automated\\scripts\\npm-install.bat', folder).catch(e => logError(e));
    log(`Folder: '${folder}' now has updated node-modules`);
  }

  async pullFolder(folder) {
    log(`Pulling folder: '${folder}'...`);
    const output = await spawn('C:\\Projects\\GServer\\home-server\\automated\\scripts\\git-pull.bat', folder).catch(e => logError(e));
    if (!output) return;
    const lines = output.split('\n').filter(l => l);
    lines.forEach((line, i) => setTimeout(() => log('(GIT) -> ' + line), i));
    await new Promise(resolve => setTimeout(resolve, lines.length + 1));
    log(`Folder: '${folder}' is now up to date`);
  }

  async getStatus() {
    const result = [];
    
    await Promise.all(['home-server', 'home-client'].map(async folder => {

      log(`Getting status of folder: '${folder}'...`);
      const output = await spawn('C:\\Projects\\GServer\\home-server\\automated\\scripts\\git-fetch.bat', folder).catch(e => logError(e));
      if (!output && output !== '') return;
      const lines = output.split('\n').filter(l => l);
      result.push(lines.length === 0 ? { folder, upToDate: true } : {
        folder,
        upToDate: false,
        newCommitCount: lines.length,
        overview: lines.length === 1 ? lines[0].substr(0, 7) : `${lines[lines.length - 1].substr(0, 7)}...${lines[0].substr(0, 7)}`,
        // lines,
        // commits: lines.map(l => l.substr(0, 7))
      });

    }));
    return result;
  }
}

module.exports = { task: new CICD(), timeout: 5 * 60 * 1000 };
