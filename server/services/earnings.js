const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
};

let _cookies = '';
let _crumb = '';
let _crumbTime = 0;
const CRUMB_TTL = 4 * 60 * 60 * 1000;

const earningsCache = new Map();
const CACHE_TTL = 12 * 60 * 60 * 1000;

async function ensureCrumb() {
  if (_crumb && Date.now() - _crumbTime < CRUMB_TTL) return true;
  try {
    const resp = await fetch('https://finance.yahoo.com/', {
      headers: { ...BROWSER_HEADERS, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      redirect: 'follow',
    });
    const setCookies = (resp.headers.getSetCookie?.() || []);
    _cookies = setCookies.map(c => c.split(';')[0]).join('; ');
    if (!_cookies) return false;

    const crumbResp = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { ...BROWSER_HEADERS, Cookie: _cookies },
    });
    const text = await crumbResp.text();
    if (text && !text.includes('"error"') && text.length < 50) {
      _crumb = text.trim();
      _crumbTime = Date.now();
      return true;
    }
  } catch { /* Railway may block finance.yahoo.com */ }
  return false;
}

async function getYFEarnings(symbol) {
  const ok = await ensureCrumb();
  if (!ok) return null;
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=calendarEvents,earningsTrend,earnings&formatted=false&crumb=${encodeURIComponent(_crumb)}`;
  const resp = await fetch(url, { headers: { ...BROWSER_HEADERS, Cookie: _cookies } });
  if (!resp.ok) return null;
  const data = await resp.json();
  const result = data?.quoteSummary?.result?.[0];
  if (!result) return null;

  const cal = result.calendarEvents?.earnings || {};
  const rawDates = cal.earningsDate || [];
  const nextTs = rawDates[0]?.raw ?? rawDates[0] ?? null;

  const quarterly = result.earnings?.earningsChart?.quarterly || [];
  const pastEarnings = quarterly.slice(-4).reverse().map(q => {
    const actual = typeof q.actual === 'object' ? q.actual?.raw : q.actual;
    const estimate = typeof q.estimate === 'object' ? q.estimate?.raw : q.estimate;
    return { quarter: q.date, actual: actual ?? null, estimate: estimate ?? null };
  });

  const trend = result.earningsTrend?.trend || [];
  const curr = trend.find(t => t.period === '0q') || trend[0] || {};
  const epsEst = curr.epsEstimate?.avg ?? null;
  const revEst = curr.revenueEstimate?.avg?.raw ?? curr.revenueEstimate?.avg ?? null;

  return {
    nextEarningsDate: nextTs ? new Date(nextTs * 1000).toISOString() : null,
    epsEstimate: epsEst,
    revenueEstimate: revEst,
    pastEarnings,
    source: 'yahoo',
  };
}

async function getNasdaqEarnings(symbol) {
  const url = `https://api.nasdaq.com/api/company/${symbol.toUpperCase()}/earnings-surprise`;
  let resp;
  try {
    resp = await fetch(url, { headers: BROWSER_HEADERS });
  } catch (e) {
    console.error(`[Earnings] Nasdaq fetch error for ${symbol}:`, e.message);
    return null;
  }
  if (!resp.ok) {
    console.error(`[Earnings] Nasdaq HTTP ${resp.status} for ${symbol}`);
    return null;
  }
  const data = await resp.json();
  const rows = data?.data?.earningsSurpriseTable?.rows || [];
  if (!rows.length) {
    console.log(`[Earnings] Nasdaq: no rows for ${symbol}, keys:`, Object.keys(data?.data || {}));
    return null;
  }

  const pastEarnings = rows.slice(0, 4).map(r => {
    const actual = parseFloat((r.eps || '').replace(/[$,]/g, '')) || null;
    const estimate = parseFloat((r.consensusForecast || '').replace(/[$,]/g, '')) || null;
    const surprise = parseFloat(r.percentageSurprise) || null;
    return { quarter: r.fiscalQtrEnd, dateReported: r.dateReported, actual, estimate, surprise };
  });

  // Estimate next earnings ~91 days after last report
  let nextEarningsDate = null;
  if (rows[0]?.dateReported) {
    const parts = rows[0].dateReported.split('/').map(Number);
    const last = new Date(parts[2], parts[0] - 1, parts[1]);
    const next = new Date(last.getTime() + 91 * 24 * 3600 * 1000);
    nextEarningsDate = next.toISOString().split('T')[0];
  }

  return { nextEarningsDate, epsEstimate: null, revenueEstimate: null, pastEarnings, source: 'nasdaq' };
}

async function getEarnings(symbol) {
  const key = symbol.toUpperCase();
  const cached = earningsCache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;

  let data = null;
  try { data = await getYFEarnings(symbol); } catch (e) {
    console.error(`[Earnings] YF error for ${symbol}:`, e.message);
  }

  if (!data?.pastEarnings?.length) {
    const nasdaqData = await getNasdaqEarnings(symbol).catch(e => {
      console.error(`[Earnings] Nasdaq error for ${symbol}:`, e.message);
      return null;
    });
    if (nasdaqData) {
      data = {
        nextEarningsDate: data?.nextEarningsDate || nasdaqData.nextEarningsDate,
        epsEstimate: data?.epsEstimate ?? null,
        revenueEstimate: data?.revenueEstimate ?? null,
        pastEarnings: nasdaqData.pastEarnings,
        source: data ? 'yahoo+nasdaq' : 'nasdaq',
      };
    }
  }

  if (data) {
    earningsCache.set(key, { data, time: Date.now() });
  }
  return data;
}

function getCachedSymbols() {
  return [...earningsCache.keys()];
}

module.exports = { getEarnings, getCachedSymbols };
