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
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d&includePrePost=false`;
  const data = await yfFetch(url);
  const result = data?.chart?.result?.[0];
  if (!result) {
    const err = data?.chart?.error;
    throw new Error(err?.description || `No data for ${symbol}`);
  }
  const meta = result.meta;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
  const price = meta.regularMarketPrice;
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

module.exports = { quote, chart, search };
