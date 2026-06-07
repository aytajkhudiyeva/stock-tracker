const express = require('express');
const router = express.Router();
const yahooFinance = require('../services/yfDirect');
const {
  computeRSI, computeMACD, computeBollingerBands,
  computeMovingAverages, findSupportResistance, computeTrend, buildSignals,
} = require('../services/technicalIndicators');

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

router.get('/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      interval: '1d',
    });
    const quotes = (result.quotes || []).filter(q => q.close != null);
    if (quotes.length < 20) return res.status(400).json({ error: 'Insufficient data' });

    const closes = quotes.map(q => q.close);
    const highs = quotes.map(q => q.high);
    const lows = quotes.map(q => q.low);

    const rsiValue = computeRSI(closes);
    const macd = computeMACD(closes);
    const bb = computeBollingerBands(closes);
    const ma = computeMovingAverages(closes);
    const sr = findSupportResistance(highs, lows, closes);
    const trend = computeTrend(closes, ma.sma50, ma.sma200);
    const { signals, summary } = buildSignals(rsiValue, macd, bb, ma);

    res.json({
      symbol,
      price: closes[closes.length - 1],
      rsi: rsiValue != null ? {
        value: rsiValue,
        signal: rsiValue < 30 ? 'oversold' : rsiValue > 70 ? 'overbought' : 'neutral',
      } : null,
      macd,
      bollingerBands: bb,
      movingAverages: ma,
      supportResistance: sr,
      trend,
      signals,
      summary,
    });
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
