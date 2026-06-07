const express = require('express');
const router = express.Router();
const { getAlerts, saveAlert, deleteAlert, updateAlert } = require('../services/alertStore');

router.get('/', (req, res) => {
  res.json(getAlerts());
});

router.post('/', (req, res) => {
  const { symbol, targetPrice, condition, chatId } = req.body;
  if (!symbol || !targetPrice || !condition) {
    return res.status(400).json({ error: 'symbol, targetPrice, and condition required' });
  }
  const alert = saveAlert({ symbol: symbol.toUpperCase(), targetPrice: parseFloat(targetPrice), condition, chatId, triggered: false });
  res.status(201).json(alert);
});

router.delete('/:id', (req, res) => {
  const deleted = deleteAlert(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Alert not found' });
  res.json({ success: true });
});

router.patch('/:id', (req, res) => {
  const updated = updateAlert(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Alert not found' });
  res.json(updated);
});

module.exports = router;
