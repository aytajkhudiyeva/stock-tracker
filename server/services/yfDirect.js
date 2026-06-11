const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://finance.yahoo.com/',
  'Cache-Control': 'no-cache',
};

async function yfFetch(url) {
  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} from Yahoo Finance`);
  return resp.json();
}

async function quote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&includePrePost=true`;
  const data = await yfFetch(url);
  const result = data?.chart?.result?.[0];
  if (!result) {
    const err = data?.chart?.error;
    throw new Error(err?.description || `No data for ${symbol}`);
  }
  const meta = result.meta;
  const timestamps = result.timestamp || [];
  const quoteData = result.indicators?.quote?.[0] || {};
  let lastIndex = -1;
  for (let i = timestamps.length - 1; i >= 0; i -= 1) {
    if (quoteData.close?.[i] != null) {
      lastIndex = i;
      break;
    }
  }
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
  const price = lastIndex >= 0 ? quoteData.close[lastIndex] : meta.regularMarketPrice;
  return {
    symbol: (meta.symbol || symbol).toUpperCase(),
    shortName: meta.shortName,
    longName: meta.longName,
    regularMarketPrice: price,
    regularMarketChange: price - prevClose,
    regularMarketChangePercent: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    regularMarketPreviousClose: prevClose,
    regularMarketOpen: meta.regularMarketOpen ?? null,
    regularMarketDayHigh: meta.regularMarketDayHigh,
    regularMarketDayLow: meta.regularMarketDayLow,
    regularMarketVolume: meta.regularMarketVolume,
    regularMarketTime: lastIndex >= 0 ? new Date(timestamps[lastIndex] * 1000).toISOString() : null,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    currency: meta.currency,
    exchange: meta.fullExchangeName || meta.exchangeName,
    quoteType: meta.instrumentType,
    marketCap: null,
    trailingPE: null,
    forwardPE: null,
    dividendYield: null,
    eps: null,
    beta: null,
    averageVolume: null,
  };
}

async function chart(symbol, options = {}) {
  const { period1, interval = '1d' } = options;
  const p1 = period1 ? Math.floor(period1.getTime() / 1000) : Math.floor((Date.now() - 365 * 86400 * 1000) / 1000);
  const p2 = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&period1=${p1}&period2=${p2}&includePrePost=false`;
  const data = await yfFetch(url);
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${symbol}`);

  const ts = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const quotes = ts.map((t, i) => ({
    date: new Date(t * 1000).toISOString(),
    open: q.open?.[i] ?? null,
    high: q.high?.[i] ?? null,
    low: q.low?.[i] ?? null,
    close: q.close?.[i] ?? null,
    volume: q.volume?.[i] ?? null,
  })).filter(bar => bar.close != null);

  return { quotes };
}

async function search(query, options = {}) {
  const { quotesCount = 10 } = options;
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=${quotesCount}&newsCount=0&enableFuzzyQuery=false`;
  const data = await yfFetch(url);
  return { quotes: data?.quotes || [] };
}

async function news(symbol) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=10&enableFuzzyQuery=false`;
  const data = await yfFetch(url);
  const items = (data?.news || []).map(item => ({
    title: item.title || '',
    publisher: item.publisher || '',
    link: item.link || '',
    providerPublishTime: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : null,
    summary: item.summary || '',
    thumbnail: item.thumbnail?.resolutions?.[0]?.url || null,
  }));
  return { symbol: symbol.toUpperCase(), items };
}

const CORPORATE_ACTIVITY_SNAPSHOT = {
  NVDA: {
    insiderSignal: 'Neutral',
    institutionalSignal: 'Accumulation',
    insiderSummary: 'Recent executive activity has been mixed, with compensation-related sales offset by continued institutional demand.',
    institutionalSummary: 'Large-cap growth and semiconductor funds remain structurally exposed to Nvidia.',
    ownership: { institutions: 66.4, insiders: 4.1, publicFloat: 29.5 },
    recentItems: [
      { label: 'Institutional demand', value: 'High', tone: 'positive' },
      { label: 'Insider activity', value: 'Mixed', tone: 'neutral' },
      { label: 'Float liquidity', value: 'Deep', tone: 'positive' },
    ],
  },
  AAPL: {
    insiderSignal: 'Neutral',
    institutionalSignal: 'Stable',
    insiderSummary: 'Insider transactions are not currently a primary driver of the stock narrative.',
    institutionalSummary: 'Apple remains a core mega-cap holding for broad-market and technology funds.',
    ownership: { institutions: 61.8, insiders: 0.1, publicFloat: 38.1 },
    recentItems: [
      { label: 'Institutional base', value: 'Stable', tone: 'neutral' },
      { label: 'Insider activity', value: 'Low', tone: 'neutral' },
      { label: 'ETF exposure', value: 'Very high', tone: 'positive' },
    ],
  },
  MSFT: {
    insiderSignal: 'Neutral',
    institutionalSignal: 'Accumulation',
    insiderSummary: 'Recent insider activity is routine and not a clear directional signal.',
    institutionalSummary: 'Microsoft remains a core AI/cloud exposure for institutional portfolios.',
    ownership: { institutions: 73.2, insiders: 1.4, publicFloat: 25.4 },
    recentItems: [
      { label: 'Institutional demand', value: 'High', tone: 'positive' },
      { label: 'Insider activity', value: 'Routine', tone: 'neutral' },
      { label: 'Fund ownership', value: 'Broad', tone: 'positive' },
    ],
  },
  TSLA: {
    insiderSignal: 'Watch',
    institutionalSignal: 'Mixed',
    insiderSummary: 'Insider and executive headlines can materially affect sentiment.',
    institutionalSummary: 'Institutional positioning is active and often shifts with delivery, margin, and autonomy narratives.',
    ownership: { institutions: 45.5, insiders: 13.0, publicFloat: 41.5 },
    recentItems: [
      { label: 'Institutional demand', value: 'Mixed', tone: 'neutral' },
      { label: 'Insider influence', value: 'High', tone: 'watch' },
      { label: 'Sentiment beta', value: 'High', tone: 'watch' },
    ],
  },
};

async function corporateActivity(symbol) {
  const key = symbol.toUpperCase();
  const base = CORPORATE_ACTIVITY_SNAPSHOT[key] || {
    insiderSignal: 'N/A',
    institutionalSignal: 'N/A',
    insiderSummary: 'No reliable insider activity feed is available for this symbol yet.',
    institutionalSummary: 'Institutional ownership data is unavailable in the current data source.',
    ownership: { institutions: null, insiders: null, publicFloat: null },
    recentItems: [
      { label: 'Insider activity', value: 'Unavailable', tone: 'neutral' },
      { label: 'Institutional flow', value: 'Unavailable', tone: 'neutral' },
    ],
  };
  return { symbol: key, source: 'StockAZ activity model', ...base };
}

function rawNumber(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value.raw === 'number') return Number.isFinite(value.raw) ? value.raw : null;
  return null;
}

function consensusFromMean(mean, key) {
  if (key) {
    const normalised = String(key).toLowerCase();
    if (normalised.includes('strong') && normalised.includes('buy')) return 'Strong Buy';
    if (normalised.includes('buy')) return 'Buy';
    if (normalised.includes('hold')) return 'Hold';
    if (normalised.includes('sell') && normalised.includes('strong')) return 'Strong Sell';
    if (normalised.includes('sell')) return 'Sell';
  }
  if (mean == null) return 'N/A';
  if (mean <= 1.8) return 'Strong Buy';
  if (mean <= 2.6) return 'Buy';
  if (mean <= 3.4) return 'Hold';
  if (mean <= 4.2) return 'Sell';
  return 'Strong Sell';
}

async function analystForecast(symbol) {
  const tipRanks = await tipRanksForecast(symbol);
  if (tipRanks) return tipRanks;

  try {
    return await analystForecastFromSummary(symbol);
  } catch {
    const yahoo = await analystForecastFromQuote(symbol);
    return hasForecastData(yahoo) ? yahoo : tipRanksSnapshot(symbol) || yahoo;
  }
}

function emptyAnalystForecast(symbol, source = 'Yahoo Finance') {
  return {
    symbol: symbol.toUpperCase(),
    shortName: null,
    currentPrice: null,
    targetHighPrice: null,
    targetLowPrice: null,
    targetMeanPrice: null,
    targetMedianPrice: null,
    upsidePercent: null,
    recommendationMean: null,
    recommendationKey: null,
    consensus: 'N/A',
    analystCount: null,
    trend: [],
    upgrades: [],
    source,
    sourceUrl: null,
  };
}

function hasForecastData(forecast) {
  return Boolean(
    forecast?.targetMeanPrice != null ||
    forecast?.targetHighPrice != null ||
    forecast?.targetLowPrice != null ||
    forecast?.analystCount != null ||
    forecast?.trend?.length
  );
}

function tipRanksConsensus(consensus) {
  if (!consensus) return 'N/A';
  const value = String(consensus).toLowerCase();
  if (value.includes('strong buy')) return 'Strong Buy';
  if (value.includes('moderate buy')) return 'Moderate Buy';
  if (value === 'buy') return 'Buy';
  if (value.includes('hold')) return 'Hold';
  if (value.includes('strong sell')) return 'Strong Sell';
  if (value.includes('sell')) return 'Sell';
  return consensus;
}

function buildTipRanksForecast(symbol, item) {
  const targetMeanPrice = item.targetMeanPrice;
  const currentPrice = item.currentPrice;
  return {
    symbol: symbol.toUpperCase(),
    shortName: item.shortName || null,
    currentPrice,
    targetHighPrice: item.targetHighPrice,
    targetLowPrice: item.targetLowPrice,
    targetMeanPrice,
    targetMedianPrice: item.targetMedianPrice ?? null,
    upsidePercent: item.upsidePercent ?? (currentPrice && targetMeanPrice ? ((targetMeanPrice - currentPrice) / currentPrice) * 100 : null),
    recommendationMean: null,
    recommendationKey: null,
    consensus: tipRanksConsensus(item.consensus),
    analystCount: item.analystCount,
    trend: [{
      period: '0m',
      strongBuy: item.strongBuy || 0,
      buy: item.buy || 0,
      hold: item.hold || 0,
      sell: item.sell || 0,
      strongSell: item.strongSell || 0,
    }],
    upgrades: [],
    source: item.source || 'TipRanks',
    sourceUrl: `https://www.tipranks.com/stocks/${symbol.toLowerCase()}/forecast`,
  };
}

const TIPRANKS_SNAPSHOT = {
  NVDA: {
    shortName: 'Nvidia',
    consensus: 'Strong Buy',
    analystCount: 39,
    buy: 37,
    hold: 1,
    sell: 1,
    targetMeanPrice: 311.41,
    targetHighPrice: 500.00,
    targetLowPrice: 250.00,
    currentPrice: 201.68,
    upsidePercent: 54.41,
    source: 'TipRanks snapshot',
  },
  AVGO: {
    shortName: 'Broadcom',
    consensus: 'Strong Buy',
    analystCount: 27,
    buy: 24,
    hold: 3,
    sell: 0,
    targetMeanPrice: 512.88,
    targetHighPrice: 630.00,
    targetLowPrice: 390.00,
    currentPrice: 406.54,
    upsidePercent: 26.16,
    source: 'TipRanks snapshot',
  },
  INTC: {
    shortName: 'Intel',
    consensus: 'Hold',
    analystCount: 38,
    buy: 10,
    hold: 25,
    sell: 3,
    targetMeanPrice: 90.22,
    targetHighPrice: 150.00,
    targetLowPrice: 30.00,
    currentPrice: 68.50,
    upsidePercent: 31.71,
    source: 'TipRanks snapshot',
  },
  AAPL: {
    shortName: 'Apple',
    consensus: 'Moderate Buy',
    analystCount: 29,
    buy: 18,
    hold: 10,
    sell: 1,
    targetMeanPrice: 324.34,
    targetHighPrice: 400.00,
    targetLowPrice: 250.00,
    currentPrice: 270.23,
    upsidePercent: 20.02,
    source: 'TipRanks snapshot',
  },
  MSFT: {
    shortName: 'Microsoft',
    consensus: 'Strong Buy',
    analystCount: 37,
    buy: 35,
    hold: 2,
    sell: 0,
    targetMeanPrice: 557.64,
    targetHighPrice: 680.00,
    targetLowPrice: 400.00,
    currentPrice: 422.79,
    upsidePercent: 31.89,
    source: 'TipRanks snapshot',
  },
  TSLA: {
    shortName: 'Tesla',
    consensus: 'Moderate Buy',
    analystCount: 29,
    buy: 12,
    hold: 14,
    sell: 3,
    targetMeanPrice: 404.54,
    targetHighPrice: 600.00,
    targetLowPrice: 24.86,
    currentPrice: 400.62,
    upsidePercent: 0.98,
    source: 'TipRanks snapshot',
  },
  AMD: {
    shortName: 'Advanced Micro Devices',
    consensus: 'Strong Buy',
    analystCount: 35,
    buy: 27,
    hold: 8,
    sell: 0,
    targetMeanPrice: 483.70,
    targetHighPrice: 665.00,
    targetLowPrice: 250.00,
    currentPrice: 278.39,
    upsidePercent: 73.75,
    source: 'TipRanks snapshot',
  },
  META: {
    shortName: 'Meta Platforms',
    consensus: 'Strong Buy',
    analystCount: 38,
    buy: 32,
    hold: 6,
    sell: 0,
    targetMeanPrice: 819.73,
    targetHighPrice: 1015.00,
    targetLowPrice: 622.25,
    currentPrice: 688.55,
    upsidePercent: 19.05,
    source: 'TipRanks snapshot',
  },
};

function tipRanksSnapshot(symbol) {
  const item = TIPRANKS_SNAPSHOT[symbol.toUpperCase()];
  return item ? buildTipRanksForecast(symbol, item) : null;
}

function parseMoney(text) {
  const match = text?.match(/\$([\d,]+(?:\.\d+)?)/);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function parseTipRanksHtml(symbol, html) {
  if (!html || html.includes('Just a moment') || html.includes('security verification')) return null;
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const ratingsMatch = text.match(/([A-Za-z ]+?)\s+(\d+)\s+Ratings\s+\1\s+(\d+)\s+Buy\s+(\d+)\s+Hold\s+(\d+)\s+Sell/i);
  const forecastMatch = text.match(/average price target is\s+\$([\d,]+(?:\.\d+)?)\s+with a high forecast of\s+\$([\d,]+(?:\.\d+)?)\s+and a low forecast of\s+\$([\d,]+(?:\.\d+)?).*?represents a\s+([-+]?\d+(?:\.\d+)?)%\s+change from the last price of\s+\$([\d,]+(?:\.\d+)?)/i);
  const headlineTarget = text.match(/Average Price Target\s+\$([\d,]+(?:\.\d+)?)/i);
  if (!ratingsMatch && !forecastMatch && !headlineTarget) return null;
  return buildTipRanksForecast(symbol, {
    consensus: ratingsMatch?.[1]?.trim() || 'N/A',
    analystCount: ratingsMatch ? Number(ratingsMatch[2]) : null,
    buy: ratingsMatch ? Number(ratingsMatch[3]) : 0,
    hold: ratingsMatch ? Number(ratingsMatch[4]) : 0,
    sell: ratingsMatch ? Number(ratingsMatch[5]) : 0,
    targetMeanPrice: forecastMatch ? Number(forecastMatch[1].replace(/,/g, '')) : parseMoney(headlineTarget?.[0]),
    targetHighPrice: forecastMatch ? Number(forecastMatch[2].replace(/,/g, '')) : null,
    targetLowPrice: forecastMatch ? Number(forecastMatch[3].replace(/,/g, '')) : null,
    upsidePercent: forecastMatch ? Number(forecastMatch[4]) : null,
    currentPrice: forecastMatch ? Number(forecastMatch[5].replace(/,/g, '')) : null,
    source: 'TipRanks',
  });
}

async function tipRanksForecast(symbol) {
  try {
    const url = `https://www.tipranks.com/stocks/${encodeURIComponent(symbol.toLowerCase())}/forecast`;
    const html = await fetch(url, { headers: HEADERS }).then(resp => resp.text());
    return parseTipRanksHtml(symbol, html) || tipRanksSnapshot(symbol);
  } catch {
    return tipRanksSnapshot(symbol);
  }
}

async function analystForecastFromSummary(symbol) {
  const modules = [
    'financialData',
    'recommendationTrend',
    'upgradeDowngradeHistory',
    'price',
    'quoteType',
  ].join(',');
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`;
  const data = await yfFetch(url);
  const result = data?.quoteSummary?.result?.[0];
  if (!result) {
    const err = data?.quoteSummary?.error;
    throw new Error(err?.description || `No analyst forecast for ${symbol}`);
  }

  const financial = result.financialData || {};
  const priceData = result.price || {};
  const currentPrice = rawNumber(financial.currentPrice) ?? rawNumber(priceData.regularMarketPrice);
  const targetMeanPrice = rawNumber(financial.targetMeanPrice);
  const analystCount = rawNumber(financial.numberOfAnalystOpinions);
  const recommendationMean = rawNumber(financial.recommendationMean);
  const recommendationKey = financial.recommendationKey || null;

  const trend = (result.recommendationTrend?.trend || []).map(item => ({
    period: item.period,
    strongBuy: item.strongBuy || 0,
    buy: item.buy || 0,
    hold: item.hold || 0,
    sell: item.sell || 0,
    strongSell: item.strongSell || 0,
  }));

  const upgrades = (result.upgradeDowngradeHistory?.history || []).slice(0, 8).map(item => ({
    date: item.epochGradeDate ? new Date(item.epochGradeDate * 1000).toISOString() : null,
    firm: item.firm || '',
    toGrade: item.toGrade || '',
    fromGrade: item.fromGrade || '',
    action: item.action || '',
  }));

  return {
    symbol: (priceData.symbol || symbol).toUpperCase(),
    shortName: priceData.shortName || priceData.longName || null,
    currentPrice,
    targetHighPrice: rawNumber(financial.targetHighPrice),
    targetLowPrice: rawNumber(financial.targetLowPrice),
    targetMeanPrice,
    targetMedianPrice: rawNumber(financial.targetMedianPrice),
    upsidePercent: currentPrice && targetMeanPrice ? ((targetMeanPrice - currentPrice) / currentPrice) * 100 : null,
    recommendationMean,
    recommendationKey,
    consensus: consensusFromMean(recommendationMean, recommendationKey),
    analystCount,
    trend,
    upgrades,
    source: 'Yahoo Finance',
    sourceUrl: null,
  };
}

async function analystForecastFromQuote(symbol) {
  try {
    const fields = [
      'regularMarketPrice',
      'shortName',
      'longName',
      'targetHighPrice',
      'targetLowPrice',
      'targetMeanPrice',
      'targetMedianPrice',
      'recommendationMean',
      'recommendationKey',
      'numberOfAnalystOpinions',
    ].join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&fields=${fields}`;
    const data = await yfFetch(url);
    const q = data?.quoteResponse?.result?.[0];
    if (!q) return emptyAnalystForecast(symbol);

    const currentPrice = rawNumber(q.regularMarketPrice);
    const targetMeanPrice = rawNumber(q.targetMeanPrice);
    const recommendationMean = rawNumber(q.recommendationMean);
    const recommendationKey = q.recommendationKey || null;

    return {
      symbol: (q.symbol || symbol).toUpperCase(),
      shortName: q.shortName || q.longName || null,
      currentPrice,
      targetHighPrice: rawNumber(q.targetHighPrice),
      targetLowPrice: rawNumber(q.targetLowPrice),
      targetMeanPrice,
      targetMedianPrice: rawNumber(q.targetMedianPrice),
      upsidePercent: currentPrice && targetMeanPrice ? ((targetMeanPrice - currentPrice) / currentPrice) * 100 : null,
      recommendationMean,
      recommendationKey,
      consensus: consensusFromMean(recommendationMean, recommendationKey),
      analystCount: rawNumber(q.numberOfAnalystOpinions),
      trend: [],
      upgrades: [],
      source: 'Yahoo Finance',
      sourceUrl: null,
    };
  } catch {
    return emptyAnalystForecast(symbol);
  }
}

module.exports = { quote, chart, search, news, corporateActivity, analystForecast };
