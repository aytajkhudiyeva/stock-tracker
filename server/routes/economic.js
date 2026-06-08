const express = require('express');
const router = express.Router();
const { buildCalendar } = require('../services/economicCalendar');

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

module.exports = router;
