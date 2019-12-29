const express = require('express');
const router = express.Router();
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readFolder = promisify(fs.readdir);

router.get('/', async (req, res) => {
  const folders = await readFolder('logs/').catch(() => { throw new Error('Could not find log folders') });
  const logFiles = {};
  await Promise.all(folders.map(async folder => {
    const files = await readFolder('logs/' + folder).catch(() => { throw new Error(`Could not find log files in folder '${folder}'`) });
    logFiles[folder] = files;
  }));
  res.status(200).json(logFiles);
});

router.get('/:folder/:file', async (req, res) => {
  const path = `logs/${req.params.folder}/${req.params.file}`;
  const logs = await readFile(path).catch(() => { throw new Error(`Could not read log file '${path}'`) });
  res.status(200).send(String(logs));
});

module.exports = router;