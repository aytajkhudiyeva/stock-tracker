// Economic Calendar:
//  • BLS public API (no key) → CPI/NFP/Unemployment/PPI actual + previous values
//  • Nasdaq calendar API (no key, date param) → consensus estimates per event date

const BLS_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const NASDAQ_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nasdaq.com/',
  'Origin': 'https://www.nasdaq.com',
};

const BLS_SERIES = {
  cpi:          'CUUR0000SA0',
  unemployment: 'LNS14000000',
  nfp:          'CES0000000001',
  ppi:          'WPU00000000',
};

// ── Caches ────────────────────────────────────────────────────────────────────
let _blsData = null;
let _blsTime = 0;
const BLS_TTL = 4 * 60 * 60 * 1000;

// Per-date Nasdaq cache: Map<dateStr, { rows, time }>
const _nasdaqCache = new Map();
const NASDAQ_TTL = 4 * 60 * 60 * 1000;

// ── Static schedules ──────────────────────────────────────────────────────────
// FOMC 2026 + early 2027 decision dates at 14:00 ET
const FOMC_DATES = [
  '2026-01-29', '2026-03-19', '2026-05-07', '2026-06-18',
  '2026-07-30', '2026-09-17', '2026-10-29', '2026-12-10',
  '2027-01-28', '2027-03-18', '2027-04-29', '2027-06-17',
];

const GDP_RELEASES = [
  { label: 'Q4 2025', date: '2026-01-29' },
  { label: 'Q1 2026', date: '2026-04-30' },
  { label: 'Q2 2026', date: '2026-07-30' },
  { label: 'Q3 2026', date: '2026-10-29' },
  { label: 'Q4 2026', date: '2027-01-28' },
];

// ── Date helpers ──────────────────────────────────────────────────────────────
function toDateStr(d) { return d.toISOString().split('T')[0]; }

function firstWeekdayUTC(year, month, wd) {
  const d = new Date(Date.UTC(year, month, 1));
  d.setUTCDate(1 + ((wd - d.getUTCDay() + 7) % 7));
  return d;
}

function nthWeekdayUTC(year, month, wd, n) {
  const d = firstWeekdayUTC(year, month, wd);
  d.setUTCDate(d.getUTCDate() + (n - 1) * 7);
  return d;
}

function prevMonth(year, month) {
  return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
}

function nextMonth(year, month) {
  return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

function monthLabel(year, month) {
  return new Date(Date.UTC(year, month, 1))
    .toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return toDateStr(d);
}

// ── BLS DATA ──────────────────────────────────────────────────────────────────
async function fetchBLS() {
  if (_blsData && Date.now() - _blsTime < BLS_TTL) return _blsData;
  try {
    const resp = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
      method: 'POST',
      headers: BLS_HEADERS,
      body: JSON.stringify({ seriesid: Object.values(BLS_SERIES) }),
    });
    if (!resp.ok) return _blsData;
    const json = await resp.json();
    if (json.status !== 'REQUEST_SUCCEEDED') return _blsData;
    const result = {};
    for (const s of (json.Results?.series || [])) result[s.seriesID] = s.data;
    _blsData = result;
    _blsTime = Date.now();
    return result;
  } catch (e) {
    console.error('[EconCalendar] BLS error:', e.message);
    return _blsData;
  }
}

function blsGet(data, seriesId, year, month) {
  const rows = data?.[seriesId];
  if (!rows) return null;
  const p = `M${String(month).padStart(2, '0')}`;
  const row = rows.find(r => r.year === String(year) && r.period === p);
  return row ? parseFloat(row.value) : null;
}

function calcCpiYoY(data, year, month) {
  const curr = blsGet(data, BLS_SERIES.cpi, year, month);
  const prev = blsGet(data, BLS_SERIES.cpi, year - 1, month);
  if (curr == null || prev == null) return null;
  return +((curr - prev) / prev * 100).toFixed(2);
}

function calcNfpMoM(data, year, month) {
  const curr = blsGet(data, BLS_SERIES.nfp, year, month);
  const p = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const prev = blsGet(data, BLS_SERIES.nfp, p.year, p.month);
  if (curr == null || prev == null) return null;
  return Math.round(curr - prev);
}

function calcPpiYoY(data, year, month) {
  const curr = blsGet(data, BLS_SERIES.ppi, year, month);
  const prev = blsGet(data, BLS_SERIES.ppi, year - 1, month);
  if (curr == null || prev == null) return null;
  return +((curr - prev) / prev * 100).toFixed(2);
}

function getUnemployment(data, year, month) {
  return blsGet(data, BLS_SERIES.unemployment, year, month);
}

// ── NASDAQ CONSENSUS ──────────────────────────────────────────────────────────

// Fetch all events for one date from Nasdaq and return the rows array.
// Returns [] on failure or when Nasdaq has no data for that date.
async function fetchNasdaqDay(dateStr) {
  const cached = _nasdaqCache.get(dateStr);
  if (cached && Date.now() - cached.time < NASDAQ_TTL) return cached.rows;

  try {
    const url = `https://api.nasdaq.com/api/calendar/economicevents?type=all&date=${dateStr}`;
    const resp = await fetch(url, { headers: NASDAQ_HEADERS });
    if (!resp.ok) return [];
    const json = await resp.json();
    const rows = json?.data?.rows;
    if (!Array.isArray(rows)) { _nasdaqCache.set(dateStr, { rows: [], time: Date.now() }); return []; }
    // Normalise whitespace in string fields
    const clean = rows.map(r => ({
      eventName: (r.eventName || '').trim(),
      country:   (r.country   || '').trim(),
      gmt:       (r.gmt       || '').trim(),
      consensus: (r.consensus || '').trim(),
      previous:  (r.previous  || '').trim(),
      actual:    (r.actual    || '').trim(),
    }));
    _nasdaqCache.set(dateStr, { rows: clean, time: Date.now() });
    return clean;
  } catch (e) {
    console.error('[EconCalendar] Nasdaq error for', dateStr, e.message);
    return [];
  }
}

// Strip unit symbols and return a plain numeric string (or null).
// unit='%' → strip %, unit='K' → keep K suffix
function stripUnit(val, unit) {
  if (!val) return null;
  const v = val.replace(/&nbsp;/g, '').trim();
  if (!v || v === '-') return null;
  if (unit === '%') return v.replace('%', '').trim() || null;
  if (unit === 'K') {
    // Nasdaq shows NFP as "85K"; we store as "+85K" / "-85K"
    const raw = v.replace(/[,\s]/g, '');
    const n = parseFloat(raw);
    if (isNaN(n)) return null;
    return `${n > 0 ? '+' : ''}${Math.round(n)}K`;
  }
  return v || null;
}

// Extract consensus for a given dataType from Nasdaq rows.
// Returns a normalised string or null.
function extractConsensus(rows, dataType, unit) {
  const usRows = rows.filter(r => r.country === 'United States');

  if (dataType === 'cpi') {
    // Two "CPI" rows: YoY (prev≈3-5%) and MoM (prev≈0.x%) — pick the YoY
    const yoy = usRows.find(r =>
      r.eventName === 'CPI' && r.gmt === '08:30' && parseFloat(r.previous) > 1
    );
    return stripUnit(yoy?.consensus || null, '%');
  }

  if (dataType === 'ppi') {
    // Two "PPI" rows similarly; pick the one with a consensus value
    const ppi = usRows.find(r =>
      r.eventName === 'PPI' && r.gmt === '08:30' && r.consensus
    );
    return stripUnit(ppi?.consensus || null, '%');
  }

  if (dataType === 'nfp') {
    const r = usRows.find(r => r.eventName === 'Nonfarm Payrolls');
    return stripUnit(r?.consensus || null, 'K');
  }

  if (dataType === 'unemployment') {
    const r = usRows.find(r => r.eventName === 'Unemployment Rate');
    return stripUnit(r?.consensus || null, '%');
  }

  if (dataType === 'fomc') {
    const r = usRows.find(r => r.eventName === 'Fed Interest Rate Decision');
    return stripUnit(r?.consensus || null, '%');
  }

  if (dataType === 'retail') {
    // Take the first "Retail Sales" row that has a consensus
    const r = usRows.find(r =>
      r.eventName === 'Retail Sales' && r.gmt === '08:30' && r.consensus
    );
    return stripUnit(r?.consensus || null, '%');
  }

  if (dataType === 'gdp') {
    const r = usRows.find(r =>
      r.eventName === 'GDP' && r.gmt === '08:30' && r.consensus
    );
    return stripUnit(r?.consensus || null, '%');
  }

  return null;
}

// For a list of events, fetch Nasdaq consensus in parallel (only for near-term dates).
// Returns Map<eventId, consensusString|null>
async function fetchConsensusForEvents(events) {
  const today = new Date().toISOString().split('T')[0];
  const cutoff = addDays(today, 35); // Nasdaq has consensus ~4 weeks ahead

  // Collect unique dates (and +1 day fallback) for events within the window
  const dates = new Set();
  for (const ev of events) {
    if (ev.date >= addDays(today, -7) && ev.date <= cutoff) {
      dates.add(ev.date);
      dates.add(addDays(ev.date, 1)); // +1 day for BLS/Nasdaq date shift (e.g. NFP on Fri vs Sat UTC)
      dates.add(addDays(ev.date, -1)); // -1 day safety
    }
  }

  // Fetch all unique dates in parallel
  const dateArr = [...dates];
  const results = await Promise.allSettled(dateArr.map(d => fetchNasdaqDay(d)));
  const rowsByDate = {};
  dateArr.forEach((d, i) => {
    rowsByDate[d] = results[i].status === 'fulfilled' ? results[i].value : [];
  });

  // For each event, try its date then +1/-1 day
  const consensusMap = {};
  for (const ev of events) {
    for (const offset of [0, 1, -1]) {
      const d = addDays(ev.date, offset);
      const rows = rowsByDate[d] || [];
      if (!rows.length) continue;
      const c = extractConsensus(rows, ev.dataType, ev.unit);
      if (c) { consensusMap[ev.id] = c; break; }
    }
  }

  return consensusMap;
}

// ── CALENDAR BUILDER ──────────────────────────────────────────────────────────

async function buildCalendar(daysBack = 14, daysAhead = 60) {
  const [bls] = await Promise.all([fetchBLS()]);

  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - daysBack);
  fromDate.setUTCHours(0, 0, 0, 0);

  const toDate = new Date();
  toDate.setUTCDate(toDate.getUTCDate() + daysAhead);
  toDate.setUTCHours(23, 59, 59, 999);

  const events = [];

  // ── Monthly releases ───────────────────────────────────────────────────────
  const startRY = fromDate.getUTCFullYear();
  const startRM = fromDate.getUTCMonth();
  const endRY   = toDate.getUTCFullYear();
  const endRM   = toDate.getUTCMonth();

  let ry = startRY;
  let rm = Math.max(0, startRM - 1);

  while (ry < endRY || (ry === endRY && rm <= endRM + 1)) {
    const ref    = prevMonth(ry, rm);
    const refY   = ref.year;
    const refM1  = ref.month + 1;
    const refLabel = monthLabel(ref.year, ref.month);

    // NFP + Unemployment: first Friday of release month
    const nfpDate = firstWeekdayUTC(ry, rm, 5);
    if (nfpDate >= fromDate && nfpDate <= toDate) {
      const nfpActual  = calcNfpMoM(bls, refY, refM1);
      const unemActual = getUnemployment(bls, refY, refM1);
      const pm         = prevMonth(refY, ref.month);
      const nfpPrev    = calcNfpMoM(bls, pm.year, pm.month + 1);
      const unemPrev   = getUnemployment(bls, pm.year, pm.month + 1);

      events.push({
        id: `nfp-${refY}-${refM1}`,
        date: toDateStr(nfpDate), time: '08:30', tz: 'ET',
        name: 'Non-Farm Payrolls', nameAz: 'Kənd Xarici Məşğulluq',
        country: 'US', impact: 'high', unit: 'K',
        actual:   nfpActual  != null ? `${nfpActual  > 0 ? '+' : ''}${nfpActual}K`  : null,
        forecast: null,
        previous: nfpPrev    != null ? `${nfpPrev    > 0 ? '+' : ''}${nfpPrev}K`    : null,
        referenceMonth: refLabel, dataType: 'nfp', released: nfpActual != null,
      });
      events.push({
        id: `unemployment-${refY}-${refM1}`,
        date: toDateStr(nfpDate), time: '08:30', tz: 'ET',
        name: 'Unemployment Rate', nameAz: 'İşsizlik Dərəcəsi',
        country: 'US', impact: 'high', unit: '%',
        actual:   unemActual != null ? String(unemActual) : null,
        forecast: null,
        previous: unemPrev   != null ? String(unemPrev)   : null,
        referenceMonth: refLabel, dataType: 'unemployment', released: unemActual != null,
      });
    }

    // CPI: 2nd Wednesday
    const cpiDate = nthWeekdayUTC(ry, rm, 3, 2);
    if (cpiDate >= fromDate && cpiDate <= toDate) {
      const cpiActual = calcCpiYoY(bls, refY, refM1);
      const pm        = prevMonth(refY, ref.month);
      const cpiPrev   = calcCpiYoY(bls, pm.year, pm.month + 1);

      events.push({
        id: `cpi-${refY}-${refM1}`,
        date: toDateStr(cpiDate), time: '08:30', tz: 'ET',
        name: 'CPI Inflation (YoY)', nameAz: 'İstehlak Qiymət İndeksi (İllik)',
        country: 'US', impact: 'high', unit: '%',
        actual:   cpiActual != null ? String(cpiActual) : null,
        forecast: null,
        previous: cpiPrev   != null ? String(cpiPrev)   : null,
        referenceMonth: refLabel, dataType: 'cpi', released: cpiActual != null,
      });
    }

    // PPI: 2nd Thursday
    const ppiDate = nthWeekdayUTC(ry, rm, 4, 2);
    if (ppiDate >= fromDate && ppiDate <= toDate) {
      const ppiActual = calcPpiYoY(bls, refY, refM1);
      const pm        = prevMonth(refY, ref.month);
      const ppiPrev   = calcPpiYoY(bls, pm.year, pm.month + 1);

      events.push({
        id: `ppi-${refY}-${refM1}`,
        date: toDateStr(ppiDate), time: '08:30', tz: 'ET',
        name: 'PPI (YoY)', nameAz: 'İstehsalçı Qiymət İndeksi (İllik)',
        country: 'US', impact: 'medium', unit: '%',
        actual:   ppiActual != null ? String(ppiActual) : null,
        forecast: null,
        previous: ppiPrev   != null ? String(ppiPrev)   : null,
        referenceMonth: refLabel, dataType: 'ppi', released: ppiActual != null,
      });
    }

    // Retail Sales: 3rd Wednesday
    const rsDate = nthWeekdayUTC(ry, rm, 3, 3);
    if (rsDate >= fromDate && rsDate <= toDate) {
      events.push({
        id: `retail-${refY}-${refM1}`,
        date: toDateStr(rsDate), time: '08:30', tz: 'ET',
        name: 'Retail Sales (MoM)', nameAz: 'Pərakəndə Satışlar (Aylıq)',
        country: 'US', impact: 'medium', unit: '%',
        actual: null, forecast: null, previous: null,
        referenceMonth: refLabel, dataType: 'retail', released: false,
      });
    }

    const nm = nextMonth(ry, rm);
    ry = nm.year; rm = nm.month;
    if (ry > endRY + 1) break;
  }

  // ── GDP ───────────────────────────────────────────────────────────────────
  for (const g of GDP_RELEASES) {
    const d = new Date(g.date + 'T12:00:00Z');
    if (d >= fromDate && d <= toDate) {
      events.push({
        id: `gdp-${g.label.replace(' ', '-')}`,
        date: g.date, time: '08:30', tz: 'ET',
        name: `GDP Growth (${g.label})`, nameAz: `ÜDM Artımı (${g.label})`,
        country: 'US', impact: 'high', unit: '%',
        actual: null, forecast: null, previous: null,
        referenceMonth: g.label, dataType: 'gdp', released: d < new Date(),
      });
    }
  }

  // ── FOMC ──────────────────────────────────────────────────────────────────
  for (const dateStr of FOMC_DATES) {
    const d = new Date(dateStr + 'T19:00:00Z');
    if (d >= fromDate && d <= toDate) {
      events.push({
        id: `fomc-${dateStr}`,
        date: dateStr, time: '14:00', tz: 'ET',
        name: 'Fed Interest Rate Decision', nameAz: 'Fed Faiz Qərarı',
        country: 'US', impact: 'high', unit: '%',
        actual: null, forecast: null, previous: null,
        referenceMonth: null, dataType: 'fomc', released: d < new Date(),
      });
    }
  }

  const sorted = events.sort((a, b) =>
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );

  // ── Merge Nasdaq consensus ────────────────────────────────────────────────
  const consensusMap = await fetchConsensusForEvents(sorted);
  for (const ev of sorted) {
    if (consensusMap[ev.id]) ev.forecast = consensusMap[ev.id];
  }

  return sorted;
}

module.exports = { buildCalendar, fetchBLS };
