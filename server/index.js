require('dotenv').config();
console.log(`[startup] node ${process.version}, PORT=${process.env.PORT}, cwd=${process.cwd()}`);
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const stockRoutes = require('./routes/stocks');
const alertRoutes = require('./routes/alerts');
const { checkAlerts } = require('./services/alertChecker');
const { checkEarningsNotifications } = require('./services/earningsChecker');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/stocks', stockRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => {
  console.log(`[health] ${new Date().toISOString()} from ${req.ip}`);
  res.json({ status: 'ok' });
});

cron.schedule('* * * * *', async () => {
  try {
    await checkAlerts();
  } catch (err) {
    console.error('Alert check error:', err.message);
  }
});

// Check earnings notifications daily at 09:00 UTC
cron.schedule('0 9 * * *', async () => {
  try {
    await checkEarningsNotifications();
  } catch (err) {
    console.error('Earnings check error:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Stock tracker server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
