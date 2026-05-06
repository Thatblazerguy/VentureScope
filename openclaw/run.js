const pipeline = require('./skills/pipeline');

async function run() {
  console.log("HEARTBEAT TRIGGERED");

  await pipeline({});

  console.log("DONE");
}

// Run every 60 seconds autonomously
setInterval(run, 60000);

// Also run immediately on boot
run();