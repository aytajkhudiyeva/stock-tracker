import type { StockQuote } from '../types';

const INDEX_NAMES: Record<string, string> = {
  '%5EGSPC': 'S&P 500',
  '%5EDJI': 'Dow Jones',
  '%5EIXIC': 'NASDAQ',
  '%5EVIX': 'VIX',
};

interface Props {
  quotes: Record<string, StockQuote>;
}

function fmt(n: number | undefined, digits = 2) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export default function MarketOverview({ quotes }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
      {Object.entries(quotes).map(([symbol, quote]) => {
        const up = quote.regularMarketChange >= 0;
        const isIndex = symbol.startsWith('%5E') || symbol.startsWith('^');
        const name = INDEX_NAMES[symbol] || quote.shortName || quote.symbol;

        return (
          <div
            key={symbol}
            style={{
              background: '#0f1629',
              border: '1px solid #1e2d47',
              borderRadius: '10px',
              padding: '14px',
            }}
          >
            <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>{name}</div>
            <div style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
              {isIndex ? '' : '$'}{fmt(quote.regularMarketPrice)}
            </div>
            <div style={{ marginTop: '4px' }}>
              <span style={{
                color: up ? '#22c55e' : '#ef4444',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                {up ? '▲' : '▼'} {up ? '+' : ''}{fmt(quote.regularMarketChange)} ({up ? '+' : ''}{fmt(quote.regularMarketChangePercent)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
