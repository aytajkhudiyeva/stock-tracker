require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const stockRoutes = require('./routes/stocks');
const alertRoutes = require('./routes/alerts');
const { checkAlerts } = require('./services/alertChecker');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/stocks', stockRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Check price alerts every minute
cron.schedule('* * * * *', async () => {
  try {
    await checkAlerts();
  } catch (err) {
    console.error('Alert check error:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Stock tracker server running on port ${PORT}`);
});
