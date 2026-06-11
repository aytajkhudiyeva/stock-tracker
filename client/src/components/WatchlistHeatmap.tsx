import type { StockQuote } from '../types';

interface Props {
  quotes: Record<string, StockQuote>;
  onSelect: (symbol: string) => void;
}

function bg(change: number) {
  if (change >= 5) return '#046c36';
  if (change >= 2) return '#0d8b47';
  if (change > 0) return '#124d2f';
  if (change <= -5) return '#8f1d18';
  if (change <= -2) return '#6f211d';
  return '#3b2018';
}

export default function WatchlistHeatmap({ quotes, onSelect }: Props) {
  const rows = Object.values(quotes).filter(Boolean);
  if (!rows.length) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="section-kicker">Watchlist Heatmap</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
        {rows.map(q => (
          <button key={q.symbol} onClick={() => onSelect(q.symbol)} style={{ border: '1px solid #2d2b20', background: bg(q.regularMarketChangePercent), padding: 12, minHeight: 76, textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ color: '#f4f4ec', fontWeight: 900 }}>{q.symbol}</div>
            <div style={{ color: '#f4f4ec', fontSize: '1.05rem', fontWeight: 900 }}>${q.regularMarketPrice.toFixed(2)}</div>
            <div style={{ color: '#f4f4ec', fontSize: '0.75rem' }}>{q.regularMarketChangePercent >= 0 ? '+' : ''}{(q.regularMarketChangePercent ?? 0).toFixed(2)}%</div>
          </button>
        ))}
      </div>
    </div>
  );
}
