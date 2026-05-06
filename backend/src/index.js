require('dotenv').config({ path: '../.env' });

const { createApp } = require('./app');
const { port } = require('./config');

const app = createApp();

app.listen(port, () => {
  console.log(`VentureScope backend listening on port ${port}`);
});