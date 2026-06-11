const express = require('express');
const router = express.Router();
const { buildCalendar } = require('../services/economicCalendar');
const { addWhatsappSubscriber, normalisePhone } = require('../services/whatsappSubscriberStore');
const { sendWhatsappMessage, whatsappConfigured } = require('../services/whatsapp');

// GET /api/economic/calendar?daysBack=14&daysAhead=60
router.get('/calendar', async (req, res) => {
  try {
    const daysBack  = Math.min(30, parseInt(req.query.daysBack  || '14', 10));
    const daysAhead = Math.min(90, parseInt(req.query.daysAhead || '60', 10));
    const events = await buildCalendar(daysBack, daysAhead);
    res.json({ events });
  } catch (err) {
    console.error('[economic route] error:', err.message);
    res.status(500).json({ error: 'Failed to build economic calendar' });
  }
});

router.post('/whatsapp-subscriptions', (req, res) => {
  const subscriber = addWhatsappSubscriber(req.body?.phone);
  if (!subscriber) {
    return res.status(400).json({ error: 'Valid mobile number with country code required' });
  }
  res.status(201).json({
    success: true,
    phone: `+${subscriber.phone}`,
    configured: whatsappConfigured(),
    reason: whatsappConfigured() ? undefined : 'not_configured',
  });
});

router.post('/whatsapp-test', async (req, res) => {
  const phone = normalisePhone(req.body?.phone);
  if (!phone) {
    return res.status(400).json({ error: 'Valid mobile number with country code required' });
  }
  const result = await sendWhatsappMessage(phone, 'StockAZ test: WhatsApp bildirişləri işləyir.');
  if (result.configured && !result.ok) {
    return res.status(502).json({ error: 'WhatsApp send failed' });
  }
  res.json({
    success: true,
    configured: result.configured,
    reason: result.configured ? undefined : 'not_configured',
  });
});

module.exports = router;
