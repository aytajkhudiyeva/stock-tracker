const express = require('express');
const router = express.Router();
const yahooFinance = require('../services/yfDirect');
const { getEarnings } = require('../services/earnings');
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

router.get('/forecast/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const forecast = await yahooFinance.analystForecast(symbol.toUpperCase());
    res.json(forecast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await yahooFinance.news(symbol.toUpperCase());
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/activity/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await yahooFinance.corporateActivity(symbol.toUpperCase());
    res.json(data);
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

router.get('/intraday/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    const [intradayResult, dailyResult] = await Promise.all([
      yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        interval: '5m',
      }),
      yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        interval: '1d',
      }),
    ]);

    const allIntraday = (intradayResult.quotes || []).filter(q => q.close != null);
    const allDaily    = (dailyResult.quotes   || []).filter(q => q.close != null);

    // Group 5-min candles by UTC date prefix (valid for regular session: 9:30–16:00 ET)
    const byDate = {};
    for (const q of allIntraday) {
      const day = q.date.split('T')[0];
      if (!byDate[day]) byDate[day] = [];
      byDate[day].push(q);
    }

    const tradingDays = Object.keys(byDate).sort();
    if (!tradingDays.length) {
      return res.json({ candles: [], pivots: null, todayOpen: null, todayHigh: null, todayLow: null, tradingDate: null });
    }

    const tradingDate = tradingDays[tradingDays.length - 1];
    const todayCandles = byDate[tradingDate];

    // Pivot base: last complete daily bar before the intraday date
    const prevBars = allDaily.filter(q => q.date.split('T')[0] < tradingDate);
    const prev = prevBars[prevBars.length - 1];

    let pivots = null;
    if (prev && prev.high && prev.low && prev.close) {
      const H = prev.high, L = prev.low, C = prev.close;
      const PP = (H + L + C) / 3;
      pivots = {
        pp: PP,
        r1: 2 * PP - L,
        r2: PP + (H - L),
        r3: H + 2 * (PP - L),
        s1: 2 * PP - H,
        s2: PP - (H - L),
        s3: L - 2 * (H - PP),
        prevHigh: H, prevLow: L, prevClose: C,
        prevDate: prev.date.split('T')[0],
      };
    }

    // VWAP: cumulative (TP × Volume) / cumulative Volume
    let cumTPV = 0, cumVol = 0;
    const candles = todayCandles.map(q => {
      if (q.high != null && q.low != null && q.close != null) {
        const tp = (q.high + q.low + q.close) / 3;
        const vol = q.volume || 0;
        cumTPV += tp * vol;
        cumVol += vol;
      }
      return {
        date: q.date,
        open: q.open, high: q.high, low: q.low, close: q.close,
        volume: q.volume || 0,
        vwap: cumVol > 0 ? cumTPV / cumVol : null,
      };
    });

    const todayOpen = candles[0]?.open ?? null;
    const todayHigh = candles.reduce((m, c) => Math.max(m, c.high ?? -Infinity), -Infinity);
    const todayLow  = candles.reduce((m, c) => Math.min(m, c.low  ??  Infinity),  Infinity);

    res.json({
      candles, pivots,
      todayOpen,
      todayHigh: isFinite(todayHigh) ? todayHigh : null,
      todayLow:  isFinite(todayLow)  ? todayLow  : null,
      tradingDate,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/earnings/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getEarnings(symbol.toUpperCase());
    if (!data) return res.status(404).json({ error: 'Earnings data unavailable' });

    const now = Date.now();
    const daysUntil = data.nextEarningsDate
      ? Math.round((new Date(data.nextEarningsDate).getTime() - now) / (24 * 60 * 60 * 1000))
      : null;

    res.json({ ...data, symbol: symbol.toUpperCase(), daysUntilEarnings: daysUntil });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
