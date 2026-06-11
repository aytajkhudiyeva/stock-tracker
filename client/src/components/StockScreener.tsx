import { useEffect, useState } from 'react';
import { fetchAnalysis, fetchAnalystForecast } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import type { AnalystForecast, StockQuote, TechnicalAnalysis } from '../types';

interface Props { quotes: Record<string, StockQuote>; }

export default function StockScreener({ quotes }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [minUpside, setMinUpside] = useState(20);
  const [maxRsi, setMaxRsi] = useState(40);
  const [minMarketCap, setMinMarketCap] = useState(10);
  const [forecasts, setForecasts] = useState<Record<string, AnalystForecast>>({});
  const [analysis, setAnalysis] = useState<Record<string, TechnicalAnalysis>>({});
  const symbols = Object.keys(quotes);

  useEffect(() => {
    Promise.allSettled(symbols.map(s => fetchAnalystForecast(s))).then(results => {
      const next: Record<string, AnalystForecast> = {};
      results.forEach((r, i) => { if (r.status === 'fulfilled') next[symbols[i]] = r.value; });
      setForecasts(next);
    });
    Promise.allSettled(symbols.map(s => fetchAnalysis(s))).then(results => {
      const next: Record<string, TechnicalAnalysis> = {};
      results.forEach((r, i) => { if (r.status === 'fulfilled') next[symbols[i]] = r.value; });
      setAnalysis(next);
    });
  }, [symbols.join(',')]);

  const rows = symbols.filter(symbol => {
    const q = quotes[symbol];
    const f = forecasts[symbol];
    const a = analysis[symbol];
    const liveUpside = q?.regularMarketPrice && f?.targetMeanPrice ? ((f.targetMeanPrice - q.regularMarketPrice) / q.regularMarketPrice) * 100 : f?.upsidePercent;
    return (liveUpside == null || liveUpside >= minUpside)
      && (!a?.rsi?.value || a.rsi.value <= maxRsi)
      && (!q.marketCap || q.marketCap >= minMarketCap * 1e9);
  });

  return (
    <div className="card page-panel">
      <div className="section-kicker">{ui.stockScreener}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        <label className="text-muted">{ui.minImpliedMove}<input className="input-field" type="number" value={minUpside} onChange={e => setMinUpside(Number(e.target.value))} /></label>
        <label className="text-muted">{ui.maxRsi}<input className="input-field" type="number" value={maxRsi} onChange={e => setMaxRsi(Number(e.target.value))} /></label>
        <label className="text-muted">{ui.minMarketCap}<input className="input-field" type="number" value={minMarketCap} onChange={e => setMinMarketCap(Number(e.target.value))} /></label>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map(symbol => {
          const q = quotes[symbol];
          const f = forecasts[symbol];
          const a = analysis[symbol];
          const liveUpside = q?.regularMarketPrice && f?.targetMeanPrice ? ((f.targetMeanPrice - q.regularMarketPrice) / q.regularMarketPrice) * 100 : f?.upsidePercent;
          return (
            <div key={symbol} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr', border: '1px solid #2d2b20', background: '#080808', padding: '9px 12px' }}>
              <div style={{ color: '#f7b500', fontWeight: 900 }}>{symbol}</div>
              <div>{ui.move}: {liveUpside != null ? `${((liveUpside) ?? 0).toFixed(1)}%` : '-'}</div>
              <div>RSI: {a?.rsi?.value != null ? ((a.rsi.value) ?? 0).toFixed(1) : '-'}</div>
              <div>{ui.cap}: {q.marketCap ? `$${(q.marketCap / 1e9).toFixed(1)}B` : '-'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
