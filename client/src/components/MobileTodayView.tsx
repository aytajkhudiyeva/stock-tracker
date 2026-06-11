import type { StockQuote } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import WatchlistHeatmap from './WatchlistHeatmap';

interface Props { quotes: Record<string, StockQuote>; onSelect: (symbol: string) => void; }

export default function MobileTodayView({ quotes, onSelect }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const rows = Object.values(quotes).sort((a, b) => Math.abs(b.regularMarketChangePercent) - Math.abs(a.regularMarketChangePercent));
  return (
    <div className="card page-panel mobile-watch-mode">
      <div className="section-kicker">{ui.todayWatchMode}</div>
      <WatchlistHeatmap quotes={quotes} onSelect={onSelect} />
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.slice(0, 8).map(q => (
          <button key={q.symbol} onClick={() => onSelect(q.symbol)} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #2d2b20', background: '#080808', padding: 10 }}>
            <span style={{ color: '#f7b500', fontWeight: 900 }}>{q.symbol}</span>
            <span style={{ color: q.regularMarketChangePercent >= 0 ? '#16d46b' : '#ff3b30', fontWeight: 900 }}>{q.regularMarketChangePercent >= 0 ? '+' : ''}{(q.regularMarketChangePercent ?? 0).toFixed(2)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
