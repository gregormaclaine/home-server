const express = require('express');
const router = express.Router();
const fs = require('fs');
const { promisify } = require('util');
const { spawn } = require('child_process');

const readFile = promisify(fs.readFile);
const readFolder = promisify(fs.readdir);

router.get('/', async (req, res) => {
  const folders = await readFolder('logs/').catch(res.logError);
  if (!folders) return res.status(500).json({ message: 'Could not read log folder' });
  const logFiles = {};
  await Promise.all(folders.map(async folder => {
    const files = await readFolder('logs/' + folder).catch(res.logError);
    if (files) logFiles[folder] = files;
  }));
  res.status(200).json(logFiles);
});

// router.post('/flatten/:folder?', async (req, res) => {
//   return res.status(200);
//   const folder = req.params.folder;
//   console.log(folder);
//   res.log(`Flattening logs${(folder ? ` in folder: '${folder}'` : '')}...`);
//   const cp = spawn('node', !req.params.folder ? ['./logger.js'] : ['./logger.js', req.params.folder]);
//   cp.stdout.on('data', data => console.log(data.toString()));
//   cp.stderr.on('data', data => console.error(data.toString()));
//   cp.on('close', code => {
//     if (code === 0) {
//       res.log('Logs flattened - Process exited with code ' + code);
//       res.status(200).send('Logs have been flattened');
//     } else {
//       const message = 'Log Flattener process has ended with an error - Check the logs';
//       res.logError(new Error(message));
//       res.status(500).json({ message });
//     }
//   });
// });

router.get('/:folder/:file', async (req, res) => {
  const path = `logs/${req.params.folder}/${req.params.file}`;
  const logs = await readFile(path).catch(res.logError);
  res.status(logs ? 200 : 500).json(logs ? { data: String(logs) } : { message: `Could not read log file '${path}'` });
});

module.exports = router;