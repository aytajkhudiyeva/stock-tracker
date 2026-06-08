// Economic Calendar: BLS (no key) for CPI/NFP/Unemployment/PPI + static schedule

const BLS_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const BLS_SERIES = {
  cpi:          'CUUR0000SA0',   // CPI All Urban Consumers
  unemployment: 'LNS14000000',   // Unemployment Rate
  nfp:          'CES0000000001', // Total Nonfarm Payrolls (thousands)
  ppi:          'WPU00000000',   // Producer Price Index, All Commodities
};

let _blsData = null;
let _blsTime = 0;
const BLS_TTL = 4 * 60 * 60 * 1000; // 4 hours

// FOMC 2026 + early 2027 decision dates (14:00 ET / published by Fed Reserve)
const FOMC_DATES = [
  '2026-01-29', '2026-03-19', '2026-05-07', '2026-06-18',
  '2026-07-30', '2026-09-17', '2026-10-29', '2026-12-10',
  '2027-01-28', '2027-03-18', '2027-04-29', '2027-06-17',
];

// GDP advance estimate quarters: {quarter label, release date}
const GDP_RELEASES = [
  { label: 'Q4 2025', date: '2026-01-29' },
  { label: 'Q1 2026', date: '2026-04-30' },
  { label: 'Q2 2026', date: '2026-07-30' },
  { label: 'Q3 2026', date: '2026-10-29' },
  { label: 'Q4 2026', date: '2027-01-28' },
];

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

// First occurrence of weekday (0=Sun…6=Sat) in year/month (0-indexed month)
function firstWeekdayUTC(year, month, wd) {
  const d = new Date(Date.UTC(year, month, 1));
  d.setUTCDate(1 + ((wd - d.getUTCDay() + 7) % 7));
  return d;
}

// Nth occurrence of weekday in year/month
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

// ── BLS DATA FETCHING ─────────────────────────────────────────────────────────

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
    for (const s of (json.Results?.series || [])) {
      result[s.seriesID] = s.data; // newest first
    }
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

// CPI Year-over-Year %
function calcCpiYoY(data, year, month) {
  const curr = blsGet(data, BLS_SERIES.cpi, year, month);
  const prev = blsGet(data, BLS_SERIES.cpi, year - 1, month);
  if (curr == null || prev == null) return null;
  return +((curr - prev) / prev * 100).toFixed(2);
}

// NFP Month-over-Month (thousands)
function calcNfpMoM(data, year, month) {
  const curr = blsGet(data, BLS_SERIES.nfp, year, month);
  const p = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const prev = blsGet(data, BLS_SERIES.nfp, p.year, p.month);
  if (curr == null || prev == null) return null;
  return Math.round(curr - prev);
}

// PPI Year-over-Year %
function calcPpiYoY(data, year, month) {
  const curr = blsGet(data, BLS_SERIES.ppi, year, month);
  const prev = blsGet(data, BLS_SERIES.ppi, year - 1, month);
  if (curr == null || prev == null) return null;
  return +((curr - prev) / prev * 100).toFixed(2);
}

// Unemployment rate (direct from BLS)
function getUnemployment(data, year, month) {
  return blsGet(data, BLS_SERIES.unemployment, year, month);
}

// ── SCHEDULE GENERATION ───────────────────────────────────────────────────────

// Generate events from `from` (Date) through `from + days` days
async function buildCalendar(daysBack = 14, daysAhead = 60) {
  const bls = await fetchBLS();

  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - daysBack);
  fromDate.setUTCHours(0, 0, 0, 0);

  const toDate = new Date();
  toDate.setUTCDate(toDate.getUTCDate() + daysAhead);
  toDate.setUTCHours(23, 59, 59, 999);

  const events = [];

  // ── Monthly releases (iterate over release months in range) ─────────────────
  // Release month is the calendar month AFTER the reference month.
  // So we scan release months and compute reference month = release - 1.

  const startReleaseYear = fromDate.getUTCFullYear();
  const startReleaseMonth = fromDate.getUTCMonth(); // 0-indexed
  const endReleaseYear = toDate.getUTCFullYear();
  const endReleaseMonth = toDate.getUTCMonth();

  // Iterate months from 2 before start to 2 after end to catch boundary events
  let ry = startReleaseYear;
  let rm = Math.max(0, startReleaseMonth - 1);

  while (ry < endReleaseYear || (ry === endReleaseYear && rm <= endReleaseMonth + 1)) {
    // Reference month = previous calendar month
    const ref = prevMonth(ry, rm);

    const refYear = ref.year;
    const refMonth1 = ref.month + 1; // 1-indexed for BLS

    const refLabel = monthLabel(ref.year, ref.month);

    // ── NFP + Unemployment (first Friday of release month, 08:30 ET) ──────────
    const nfpDate = firstWeekdayUTC(ry, rm, 5); // 5 = Friday
    if (nfpDate >= fromDate && nfpDate <= toDate) {
      const nfpActual = calcNfpMoM(bls, refYear, refMonth1);
      const unemActual = getUnemployment(bls, refYear, refMonth1);
      // Previous = last month values
      const pm = prevMonth(refYear, ref.month);
      const nfpPrev = calcNfpMoM(bls, pm.year, pm.month + 1);
      const unemPrev = getUnemployment(bls, pm.year, pm.month + 1);

      events.push({
        id: `nfp-${refYear}-${refMonth1}`,
        date: toDateStr(nfpDate), time: '08:30', tz: 'ET',
        name: 'Non-Farm Payrolls', nameAz: 'Kənd Xarici Məşğulluq',
        country: 'US', impact: 'high', unit: 'K',
        actual: nfpActual != null ? `${nfpActual > 0 ? '+' : ''}${nfpActual}K` : null,
        forecast: null, previous: nfpPrev != null ? `${nfpPrev > 0 ? '+' : ''}${nfpPrev}K` : null,
        referenceMonth: refLabel, dataType: 'nfp',
        released: nfpActual != null,
      });
      events.push({
        id: `unemployment-${refYear}-${refMonth1}`,
        date: toDateStr(nfpDate), time: '08:30', tz: 'ET',
        name: 'Unemployment Rate', nameAz: 'İşsizlik Dərəcəsi',
        country: 'US', impact: 'high', unit: '%',
        actual: unemActual != null ? String(unemActual) : null,
        forecast: null, previous: unemPrev != null ? String(unemPrev) : null,
        referenceMonth: refLabel, dataType: 'unemployment',
        released: unemActual != null,
      });
    }

    // ── CPI (2nd Wednesday of release month, 08:30 ET) ───────────────────────
    const cpiDate = nthWeekdayUTC(ry, rm, 3, 2); // 3 = Wednesday
    if (cpiDate >= fromDate && cpiDate <= toDate) {
      const cpiActual = calcCpiYoY(bls, refYear, refMonth1);
      // Previous = same indicator for prior reference month
      const pm = prevMonth(refYear, ref.month);
      const cpiPrev = calcCpiYoY(bls, pm.year, pm.month + 1);

      events.push({
        id: `cpi-${refYear}-${refMonth1}`,
        date: toDateStr(cpiDate), time: '08:30', tz: 'ET',
        name: 'CPI Inflation (YoY)', nameAz: 'İstehlak Qiymət İndeksi (İllik)',
        country: 'US', impact: 'high', unit: '%',
        actual: cpiActual != null ? String(cpiActual) : null,
        forecast: null, previous: cpiPrev != null ? String(cpiPrev) : null,
        referenceMonth: refLabel, dataType: 'cpi',
        released: cpiActual != null,
      });
    }

    // ── PPI (2nd Thursday of release month, 08:30 ET) ────────────────────────
    const ppiDate = nthWeekdayUTC(ry, rm, 4, 2); // 4 = Thursday
    if (ppiDate >= fromDate && ppiDate <= toDate) {
      const ppiActual = calcPpiYoY(bls, refYear, refMonth1);
      const pm = prevMonth(refYear, ref.month);
      const ppiPrev = calcPpiYoY(bls, pm.year, pm.month + 1);

      events.push({
        id: `ppi-${refYear}-${refMonth1}`,
        date: toDateStr(ppiDate), time: '08:30', tz: 'ET',
        name: 'PPI (YoY)', nameAz: 'İstehsalçı Qiymət İndeksi (İllik)',
        country: 'US', impact: 'medium', unit: '%',
        actual: ppiActual != null ? String(ppiActual) : null,
        forecast: null, previous: ppiPrev != null ? String(ppiPrev) : null,
        referenceMonth: refLabel, dataType: 'ppi',
        released: ppiActual != null,
      });
    }

    // ── Retail Sales (3rd Wednesday of release month, 08:30 ET) ──────────────
    const rsDate = nthWeekdayUTC(ry, rm, 3, 3); // 3rd Wednesday
    if (rsDate >= fromDate && rsDate <= toDate) {
      events.push({
        id: `retail-${refYear}-${refMonth1}`,
        date: toDateStr(rsDate), time: '08:30', tz: 'ET',
        name: 'Retail Sales (MoM)', nameAz: 'Pərakəndə Satışlar (Aylıq)',
        country: 'US', impact: 'medium', unit: '%',
        actual: null, forecast: null, previous: null,
        referenceMonth: refLabel, dataType: 'retail',
        released: false,
      });
    }

    // advance release month
    const nm = nextMonth(ry, rm);
    ry = nm.year; rm = nm.month;
    if (ry > endReleaseYear + 1) break;
  }

  // ── GDP quarterly releases ────────────────────────────────────────────────
  for (const g of GDP_RELEASES) {
    const d = new Date(g.date + 'T12:00:00Z');
    if (d >= fromDate && d <= toDate) {
      events.push({
        id: `gdp-${g.label.replace(' ', '-')}`,
        date: g.date, time: '08:30', tz: 'ET',
        name: `GDP Growth (${g.label})`, nameAz: `ÜDM Artımı (${g.label})`,
        country: 'US', impact: 'high', unit: '%',
        actual: null, forecast: null, previous: null,
        referenceMonth: g.label, dataType: 'gdp',
        released: d < new Date(),
      });
    }
  }

  // ── FOMC decisions ────────────────────────────────────────────────────────
  for (const dateStr of FOMC_DATES) {
    const d = new Date(dateStr + 'T19:00:00Z'); // 14:00 ET = 19:00 UTC
    if (d >= fromDate && d <= toDate) {
      events.push({
        id: `fomc-${dateStr}`,
        date: dateStr, time: '14:00', tz: 'ET',
        name: 'Fed Interest Rate Decision', nameAz: 'Fed Faiz Qərarı',
        country: 'US', impact: 'high', unit: '%',
        actual: null, forecast: null, previous: null,
        referenceMonth: null, dataType: 'fomc',
        released: d < new Date(),
      });
    }
  }

  return events.sort((a, b) =>
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );
}

module.exports = { buildCalendar, fetchBLS };
