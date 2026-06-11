function ema(values, period) {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const initial = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const result = new Array(period - 1).fill(null);
  result.push(initial);
  for (let i = period; i < values.length; i++) {
    result.push(values[i] * k + result[result.length - 1] * (1 - k));
  }
  return result;
}

function computeRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss += -diff;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function computeMACD(closes) {
  const e12 = ema(closes, 12);
  const e26 = ema(closes, 26);
  const macdLine = closes.map((_, i) => (e12[i] != null && e26[i] != null) ? e12[i] - e26[i] : null);
  const macdValues = macdLine.filter(v => v != null);
  if (macdValues.length < 9) return null;
  const signalLine = ema(macdValues, 9);
  const curr = macdValues[macdValues.length - 1];
  const prev = macdValues[macdValues.length - 2];
  const currSig = signalLine[signalLine.length - 1];
  const prevSig = signalLine[signalLine.length - 2];
  return {
    macd: curr,
    signal: currSig,
    histogram: curr - currSig,
    trend: curr > currSig ? 'bullish' : 'bearish',
    crossover: prev < prevSig && curr > currSig ? 'bullish'
             : prev > prevSig && curr < currSig ? 'bearish'
             : null,
  };
}

function computeBollingerBands(closes, period = 20, mult = 2) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
  const upper = mean + mult * std;
  const lower = mean - mult * std;
  const price = closes[closes.length - 1];
  const range = upper - lower;
  const percentB = range > 0 ? (price - lower) / range : 0.5;
  return {
    upper, middle: mean, lower,
    percentB,
    bandwidth: range / mean,
    signal: percentB > 0.8 ? 'near_upper' : percentB < 0.2 ? 'near_lower' : 'neutral',
  };
}

function computeMovingAverages(closes) {
  const n = closes.length;
  const price = closes[n - 1];
  const sma = (arr, len) => arr.length >= len
    ? arr.slice(-len).reduce((a, b) => a + b, 0) / len
    : null;

  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const prevSma50 = n >= 51 ? sma(closes.slice(0, -1), 50) : null;
  const prevSma200 = n >= 201 ? sma(closes.slice(0, -1), 200) : null;

  let cross = null;
  if (sma50 != null && sma200 != null && prevSma50 != null && prevSma200 != null) {
    if (prevSma50 <= prevSma200 && sma50 > sma200) cross = 'golden';
    else if (prevSma50 >= prevSma200 && sma50 < sma200) cross = 'death';
  }

  return {
    sma50, sma200,
    priceVsSma50: sma50 != null ? (price > sma50 ? 'above' : 'below') : null,
    priceVsSma200: sma200 != null ? (price > sma200 ? 'above' : 'below') : null,
    sma50VsSma200: (sma50 != null && sma200 != null) ? (sma50 > sma200 ? 'above' : 'below') : null,
    cross,
  };
}

function findSupportResistance(highs, lows, closes, lookback = 60) {
  const rH = highs.slice(-lookback);
  const rL = lows.slice(-lookback);
  const price = closes[closes.length - 1];
  const win = 5;
  const swingHighs = [], swingLows = [];

  for (let i = win; i < rH.length - win; i++) {
    if (rH.slice(i - win, i).every(v => v <= rH[i]) && rH.slice(i + 1, i + win + 1).every(v => v <= rH[i]))
      swingHighs.push(rH[i]);
    if (rL.slice(i - win, i).every(v => v >= rL[i]) && rL.slice(i + 1, i + win + 1).every(v => v >= rL[i]))
      swingLows.push(rL[i]);
  }

  function dedupe(levels) {
    levels.sort((a, b) => a - b);
    const out = [];
    for (const lvl of levels) {
      if (!out.length || Math.abs(lvl - out[out.length - 1]) / out[out.length - 1] > 0.015)
        out.push(lvl);
    }
    return out;
  }

  const supports = dedupe(swingLows).filter(l => l < price * 0.999).slice(-3).reverse();
  const resistances = dedupe(swingHighs).filter(h => h > price * 1.001).slice(0, 3);
  return { supports, resistances };
}

function computeTrend(closes, sma50, sma200) {
  const price = closes[closes.length - 1];
  if (sma50 != null && sma200 != null) {
    if (price > sma50 && sma50 > sma200) return 'strong_uptrend';
    if (price < sma50 && sma50 < sma200) return 'strong_downtrend';
  }
  if (sma50 != null) return price > sma50 ? 'uptrend' : 'downtrend';
  return 'neutral';
}

function buildSignals(rsi, macd, bb, ma) {
  const signals = [];

  if (rsi != null) {
    const sig = rsi < 30 ? 'buy' : rsi > 70 ? 'sell' : 'neutral';
    const val = rsi < 30 ? `${rsi.toFixed(1)} — Oversold` : rsi > 70 ? `${rsi.toFixed(1)} — Overbought` : rsi.toFixed(1);
    signals.push({ name: 'RSI (14)', signal: sig, value: val });
  }

  if (macd) {
    const val = macd.crossover
      ? (macd.crossover === 'bullish' ? 'Bullish Crossover' : 'Bearish Crossover')
      : `Histogram ${macd.histogram >= 0 ? '+' : ''}${macd.histogram.toFixed(3)}`;
    signals.push({ name: 'MACD (12,26,9)', signal: macd.trend === 'bullish' ? 'buy' : 'sell', value: val });
  }

  if (bb) {
    const sig = bb.signal === 'near_lower' ? 'buy' : bb.signal === 'near_upper' ? 'sell' : 'neutral';
    const val = bb.signal === 'near_lower' ? 'Near Lower Band' : bb.signal === 'near_upper' ? 'Near Upper Band' : `%B: ${(bb.percentB * 100).toFixed(0)}%`;
    signals.push({ name: 'Bollinger Bands', signal: sig, value: val });
  }

  if (ma.sma50 != null) {
    signals.push({
      name: 'Price vs SMA 50',
      signal: ma.priceVsSma50 === 'above' ? 'buy' : 'sell',
      value: `${ma.priceVsSma50 === 'above' ? 'Above' : 'Below'} $${ma.sma50.toFixed(2)}`,
    });
  }

  if (ma.sma200 != null) {
    signals.push({
      name: 'Price vs SMA 200',
      signal: ma.priceVsSma200 === 'above' ? 'buy' : 'sell',
      value: `${ma.priceVsSma200 === 'above' ? 'Above' : 'Below'} $${ma.sma200.toFixed(2)}`,
    });
  }

  if (ma.sma50 != null && ma.sma200 != null) {
    const isBull = ma.sma50VsSma200 === 'above';
    const label = ma.cross === 'golden' ? 'Golden Cross'
                : ma.cross === 'death' ? 'Death Cross'
                : isBull ? 'Bullish Alignment' : 'Bearish Alignment';
    signals.push({ name: 'SMA 50 / 200', signal: isBull ? 'buy' : 'sell', value: label });
  }

  const buyCount = signals.filter(s => s.signal === 'buy').length;
  const sellCount = signals.filter(s => s.signal === 'sell').length;
  const neutralCount = signals.filter(s => s.signal === 'neutral').length;
  const directional = buyCount + sellCount;
  const ratio = directional > 0 ? (buyCount - sellCount) / directional : 0;

  const overallSignal =
    ratio >= 0.8 ? 'Strong Buy' :
    ratio >= 0.4 ? 'Buy' :
    ratio <= -0.8 ? 'Strong Sell' :
    ratio <= -0.4 ? 'Sell' : 'Neutral';

  return { signals, summary: { signal: overallSignal, score: buyCount - sellCount, buyCount, neutralCount, sellCount } };
}

// ── ATR ───────────────────────────────────────────────────────────────────────

function computeATR(highs, lows, closes, period = 14) {
  if (highs.length < period + 1) return null;
  const trs = [];
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i]  - closes[i - 1])
    ));
  }
  if (trs.length < period) return null;
  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period; // Wilder's smoothing
  }
  return atr;
}

// ── TP/SL ─────────────────────────────────────────────────────────────────────
// For each ATR baseline target, snap to the nearest pivot/SR level within 1.5%.
// Entry = current market price.  Bearish direction (short) not modelled:
// TP levels are always above price, SL levels always below.

function computeTPSL(price, atr, pivots, resistances = [], supports = []) {
  if (!atr || !price || atr <= 0) return null;

  // ATR baselines
  const atrTP = [price + atr, price + 2 * atr, price + 3 * atr];
  const atrSL = [price - 0.75 * atr, price - 1.5 * atr];

  // Technical candidates above current price
  const tpCandidates = [];
  if (pivots) {
    if (pivots.r1 > price) tpCandidates.push({ price: pivots.r1, source: 'pivot', pivotLabel: 'R1' });
    if (pivots.r2 > price) tpCandidates.push({ price: pivots.r2, source: 'pivot', pivotLabel: 'R2' });
    if (pivots.r3 > price) tpCandidates.push({ price: pivots.r3, source: 'pivot', pivotLabel: 'R3' });
  }
  for (const r of resistances) {
    if (r > price * 1.002) tpCandidates.push({ price: r, source: 'sr', pivotLabel: null });
  }

  // Technical candidates below current price
  const slCandidates = [];
  if (pivots) {
    if (pivots.pp < price) slCandidates.push({ price: pivots.pp, source: 'pivot', pivotLabel: 'PP' });
    if (pivots.s1 < price) slCandidates.push({ price: pivots.s1, source: 'pivot', pivotLabel: 'S1' });
    if (pivots.s2 < price) slCandidates.push({ price: pivots.s2, source: 'pivot', pivotLabel: 'S2' });
    if (pivots.s3 < price) slCandidates.push({ price: pivots.s3, source: 'pivot', pivotLabel: 'S3' });
  }
  for (const s of supports) {
    if (s < price * 0.998) slCandidates.push({ price: s, source: 'sr', pivotLabel: null });
  }

  // Snap baseline to nearest candidate within 1.5%
  function snap(baseline, candidates) {
    let best = null, bestDist = Infinity;
    for (const c of candidates) {
      const dist = Math.abs(c.price - baseline) / baseline;
      if (dist < 0.015 && dist < bestDist) { best = c; bestDist = dist; }
    }
    return best;
  }

  function build(baseline, candidates) {
    const snapped = snap(baseline, candidates);
    return snapped
      ? { price: snapped.price, source: snapped.source, pivotLabel: snapped.pivotLabel }
      : { price: baseline, source: 'atr', pivotLabel: null };
  }

  const tpArr = [build(atrTP[0], tpCandidates), build(atrTP[1], tpCandidates), build(atrTP[2], tpCandidates)];
  const slArr = [build(atrSL[0], slCandidates), build(atrSL[1], slCandidates)];

  // Enforce strict ordering (prevent duplicate prices from snapping)
  tpArr.sort((a, b) => a.price - b.price);
  if (tpArr[1].price <= tpArr[0].price) tpArr[1].price = tpArr[0].price + atr * 0.5;
  if (tpArr[2].price <= tpArr[1].price) tpArr[2].price = tpArr[1].price + atr * 0.5;

  slArr.sort((a, b) => b.price - a.price); // descending — tightest SL first
  if (slArr[1].price >= slArr[0].price) slArr[1].price = slArr[0].price - atr * 0.5;

  const risk = price - slArr[0].price;
  const pct = p => +((p - price) / price * 100).toFixed(2);
  const rr  = p => risk > 0.0001 ? +((p - price) / risk).toFixed(2) : null;
  const fmt = p => +p.toFixed(2);

  return {
    atr: +atr.toFixed(4),
    tp1: { price: fmt(tpArr[0].price), pct: pct(tpArr[0].price), rr: rr(tpArr[0].price), source: tpArr[0].source, pivotLabel: tpArr[0].pivotLabel },
    tp2: { price: fmt(tpArr[1].price), pct: pct(tpArr[1].price), rr: rr(tpArr[1].price), source: tpArr[1].source, pivotLabel: tpArr[1].pivotLabel },
    tp3: { price: fmt(tpArr[2].price), pct: pct(tpArr[2].price), rr: rr(tpArr[2].price), source: tpArr[2].source, pivotLabel: tpArr[2].pivotLabel },
    sl1: { price: fmt(slArr[0].price), pct: pct(slArr[0].price), source: slArr[0].source, pivotLabel: slArr[0].pivotLabel },
    sl2: { price: fmt(slArr[1].price), pct: pct(slArr[1].price), source: slArr[1].source, pivotLabel: slArr[1].pivotLabel },
  };
}

module.exports = { computeRSI, computeMACD, computeBollingerBands, computeMovingAverages, findSupportResistance, computeTrend, buildSignals, computeATR, computeTPSL };
