import { useEffect, useState } from 'react';
import { fetchAnalysis } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import type { StockQuote, TechnicalAnalysis } from '../types';

interface Props { quotes: Record<string, StockQuote>; }

export default function TechnicalScanner({ quotes }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [analysis, setAnalysis] = useState<Record<string, TechnicalAnalysis>>({});
  const symbols = Object.keys(quotes).filter(Boolean);

  useEffect(() => {
    let active = true;
    Promise.allSettled(symbols.map(symbol => fetchAnalysis(symbol))).then(results => {
      if (!active) return;
      const next: Record<string, TechnicalAnalysis> = {};
      results.forEach((result, index) => { if (result.status === 'fulfilled') next[symbols[index]] = result.value; });
      setAnalysis(next);
    });
    return () => { active = false; };
  }, [symbols.join(',')]);

  const rows = symbols.flatMap(symbol => {
    const q = quotes[symbol];
    const a = analysis[symbol];
    const flags: Array<{ label: string; tone: string }> = [];
    if (a?.rsi?.value != null && a.rsi.value < 35) flags.push({ label: `${ui.rsiLow} (${a.rsi.value.toFixed(1)})`, tone: '#f7b500' });
    if (a?.movingAverages.cross === 'golden') flags.push({ label: ui.goldenCrossObserved, tone: '#16d46b' });
    if (a?.supportResistance.resistances[0] && q.regularMarketPrice > a.supportResistance.resistances[0] * 0.98) flags.push({ label: ui.nearResistance, tone: '#ff6b00' });
    if (q.regularMarketChangePercent < -3 && q.regularMarketVolume) flags.push({ label: ui.highSelloffFlag, tone: '#ff3b30' });
    if (a?.trend.includes('uptrend') && q.regularMarketChangePercent < 0) flags.push({ label: ui.trendFriction, tone: '#f7b500' });
    return flags.length ? flags.map(flag => ({ symbol, ...flag })) : [{ symbol, label: ui.noScannerFlag, tone: '#8b8b7a' }];
  });

  return (
    <div className="card page-panel">
      <div className="section-kicker">{ui.technicalScanner}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map((row, index) => (
          <div key={`${row.symbol}-${row.label}-${index}`} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, border: '1px solid #2d2b20', background: '#080808', padding: '9px 12px' }}>
            <div style={{ color: '#f7b500', fontWeight: 900 }}>{row.symbol}</div>
            <div style={{ color: row.tone, fontWeight: 800 }}>{row.label}</div>
          </div>
        ))}
      </div>
      <div style={{ color: '#8b8b7a', fontSize: '0.72rem', marginTop: 10 }}>{ui.scannerDisclaimer}</div>
    </div>
  );
}
