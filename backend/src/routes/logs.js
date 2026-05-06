const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// The log file is in openclaw/heartbeat.log relative to the project root
const logFilePath = path.resolve(__dirname, '../../../openclaw/heartbeat.log');

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let lastSize = 0;

  // Send the last 50 lines immediately if file exists
  if (fs.existsSync(logFilePath)) {
    try {
      const fileContent = fs.readFileSync(logFilePath, 'utf8');
      const lines = fileContent.split('\n').filter(Boolean).slice(-50);
      for (const line of lines) {
        res.write(`data: ${line}\n\n`);
      }
      lastSize = fs.statSync(logFilePath).size;
    } catch (err) {
      console.error("Error reading log file:", err);
    }
  }

  // Poll the file for new changes
  const intervalId = setInterval(() => {
    if (!fs.existsSync(logFilePath)) return;
    
    try {
      const currentSize = fs.statSync(logFilePath).size;
      
      if (currentSize > lastSize) {
        const stream = fs.createReadStream(logFilePath, { start: lastSize, end: currentSize - 1 });
        let newLogs = '';
        stream.on('data', chunk => { newLogs += chunk.toString(); });
        stream.on('end', () => {
          if (newLogs) {
            const lines = newLogs.split('\n').filter(Boolean);
            for (const line of lines) {
              res.write(`data: ${line}\n\n`);
            }
          }
        });
        lastSize = currentSize;
      } else if (currentSize < lastSize) {
        // file was truncated/cleared
        lastSize = currentSize;
      }
    } catch (err) {
      // Ignore polling errors
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

module.exports = router;
