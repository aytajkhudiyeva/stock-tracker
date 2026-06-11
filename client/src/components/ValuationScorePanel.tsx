import { useEffect, useState } from 'react';
import { fetchAnalystForecast } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels, type UiLabels } from '../i18n/uiLabels';
import type { AnalystForecast, StockQuote } from '../types';

interface Props { quote: StockQuote; }

function scoreBand(score: number, ui: UiLabels) {
  if (score >= 70) return { label: ui.lowerValuationPressure, color: '#16d46b' };
  if (score >= 40) return { label: ui.middleValuationZone, color: '#f7b500' };
  return { label: ui.higherValuationPressure, color: '#ff6b00' };
}

export default function ValuationScorePanel({ quote }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [forecast, setForecast] = useState<AnalystForecast | null>(null);
  useEffect(() => { fetchAnalystForecast(quote.symbol).then(setForecast).catch(() => setForecast(null)); }, [quote.symbol]);
  const peScore = quote.forwardPE ? Math.max(0, Math.min(100, 100 - quote.forwardPE * 2)) : 45;
  const growthProxy = forecast?.upsidePercent != null ? Math.max(0, Math.min(100, 50 + forecast.upsidePercent)) : 50;
  const qualityProxy = quote.marketCap && quote.marketCap > 100_000_000_000 ? 65 : 45;
  const score = Math.round(peScore * 0.4 + growthProxy * 0.35 + qualityProxy * 0.25);
  const band = scoreBand(score, ui);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ border: '1px solid #2d2b20', background: '#080808', padding: 16 }}>
        <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{ui.valuationScore}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 8 }}>
          <span style={{ color: band.color, fontSize: '2.2rem', fontWeight: 900 }}>{score}</span>
          <span style={{ color: '#f4f4ec', fontWeight: 900 }}>{band.label}</span>
        </div>
        <div style={{ color: '#8b8b7a', fontSize: '0.75rem', marginTop: 8 }}>
          {ui.valuationDisclaimer}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20' }}>
        {[
          [ui.forwardPe, quote.forwardPE?.toFixed(2) || '-'],
          [ui.analystImpliedMove, forecast?.upsidePercent != null ? `${forecast.upsidePercent.toFixed(1)}%` : '-'],
          [ui.marketCap, quote.marketCap ? `$${(quote.marketCap / 1e9).toFixed(1)}B` : '-'],
        ].map(([label, value]) => (
          <div key={label} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ color: '#f4f4ec', fontWeight: 900, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
