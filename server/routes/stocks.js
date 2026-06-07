const express = require('express');
const router = express.Router();
const yahooFinance = require('../services/yf');

router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);
    res.json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) return res.status(400).json({ error: 'symbols query param required' });
    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    const quotes = await Promise.all(
      symbolList.map(sym => yahooFinance.quote(sym).catch(() => null))
    );
    const result = {};
    symbolList.forEach((sym, i) => { if (quotes[i]) result[sym] = quotes[i]; });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1mo', interval = '1d' } = req.query;

    const periodMap = {
      '1d': { period1: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      '5d': { period1: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      '1mo': { period1: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) },
      '3mo': { period1: new Date(Date.now() - 92 * 24 * 60 * 60 * 1000) },
      '6mo': { period1: new Date(Date.now() - 183 * 24 * 60 * 60 * 1000) },
      '1y': { period1: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000) },
      '2y': { period1: new Date(Date.now() - 732 * 24 * 60 * 60 * 1000) },
    };

    const range = periodMap[period] || periodMap['1mo'];
    const result = await yahooFinance.chart(symbol, {
      period1: range.period1,
      interval: interval,
    });

    const quotes = result.quotes || [];
    const formatted = quotes.map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const results = await yahooFinance.search(query, { quotesCount: 10 });
    const stocks = (results.quotes || []).filter(q => q.quoteType === 'EQUITY');
    res.json(stocks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
