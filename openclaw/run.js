const pipeline = require('./skills/pipeline');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'heartbeat.log');

function formatLogMsg(args) {
  return args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
}

// Map emojis/keywords to log levels
function determineLevel(msg) {
  if (msg.includes('✅') || msg.includes('DONE')) return 'DONE';
  if (msg.includes('🚀') || msg.includes('SCAN') || msg.includes('Querying')) return 'SCAN';
  if (msg.includes('📊') || msg.includes('RESULT')) return 'RESULT';
  if (msg.includes('upsert') || msg.includes('Upserted') || msg.includes('DB')) return 'DB';
  if (msg.includes('❌') || msg.includes('Failed') || msg.includes('error')) return 'ERROR';
  return 'INFO';
}

const originalLog = console.log;
console.log = function(...args) {
  const msg = formatLogMsg(args);
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const level = determineLevel(msg);
  const logEntry = JSON.stringify({ time, level, msg }) + '\n';
  fs.appendFileSync(logFile, logEntry);
  originalLog.apply(console, args);
}

const originalError = console.error;
console.error = function(...args) {
  const msg = formatLogMsg(args);
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const logEntry = JSON.stringify({ time, level: 'ERROR', msg }) + '\n';
  fs.appendFileSync(logFile, logEntry);
  originalError.apply(console, args);
}

async function run() {
  console.log("HEARTBEAT TRIGGERED");

  await pipeline({});

  console.log("DONE");
}

// Run every 60 seconds autonomously
setInterval(run, 60000);

// Also run immediately on boot
run();