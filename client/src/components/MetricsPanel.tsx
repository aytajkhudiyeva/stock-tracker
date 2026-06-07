import type { StockQuote } from '../types';

interface Props { quote: StockQuote; }

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #1e2d47' }}>
      <div>
        <div className="text-secondary" style={{ fontSize: '0.82rem' }}>{label}</div>
        {hint && <div className="text-muted" style={{ fontSize: '0.68rem' }}>{hint}</div>}
      </div>
      <div style={{ color: '#f1f5f9', fontSize: '0.88rem', fontWeight: 600, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

function fmt(n: number | undefined, digits = 2, prefix = '') {
  if (n === undefined || n === null) return '—';
  return `${prefix}${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function fmtVol(n: number | undefined) {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

function fmtLarge(n: number | undefined) {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

export default function MetricsPanel({ quote }: Props) {
  return (
    <div>
      <h3 style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px', marginTop: 0 }}>
        Financial Metrics
      </h3>

      {/* Price overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', marginTop: '12px' }}>
        {[
          { label: 'Open', value: `$${fmt(quote.regularMarketOpen)}` },
          { label: 'Prev Close', value: `$${fmt(quote.regularMarketPreviousClose)}` },
          { label: 'Day High', value: <span style={{ color: '#22c55e', fontWeight: 600 }}>${fmt(quote.regularMarketDayHigh)}</span> },
          { label: 'Day Low', value: <span style={{ color: '#ef4444', fontWeight: 600 }}>${fmt(quote.regularMarketDayLow)}</span> },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#0f1629', borderRadius: '8px', padding: '10px 12px', border: '1px solid #1e2d47' }}>
            <div className="text-muted" style={{ fontSize: '0.68rem', marginBottom: '3px' }}>{label}</div>
            <div style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 52-week range */}
      <div style={{ background: '#0f1629', borderRadius: '8px', padding: '12px', border: '1px solid #1e2d47', marginBottom: '16px' }}>
        <div className="text-muted" style={{ fontSize: '0.68rem', marginBottom: '8px' }}>52-Week Range</div>
        <div className="flex justify-between" style={{ marginBottom: '6px' }}>
          <span style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>${fmt(quote.fiftyTwoWeekLow)}</span>
          <span style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 600 }}>${fmt(quote.fiftyTwoWeekHigh)}</span>
        </div>
        {quote.fiftyTwoWeekLow && quote.fiftyTwoWeekHigh && (
          <div style={{ background: '#1e2d47', borderRadius: '4px', height: '6px', position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(90deg, #ef4444, #22c55e)',
              borderRadius: '4px', height: '100%',
              width: `${Math.min(100, Math.max(0, ((quote.regularMarketPrice - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100))}%`,
            }} />
            <div style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
              left: `${Math.min(100, Math.max(0, ((quote.regularMarketPrice - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100))}%`,
              width: '10px', height: '10px', background: '#f1f5f9', borderRadius: '50%',
              border: '2px solid #0a0e1a',
            }} />
          </div>
        )}
      </div>

      {/* Detailed metrics */}
      <div>
        <Row label="Market Cap" value={fmtLarge(quote.marketCap)} />
        <Row label="Volume" value={fmtVol(quote.regularMarketVolume)} />
        <Row label="Avg Volume" value={fmtVol(quote.averageVolume)} />
        <Row label="P/E Ratio (TTM)" value={fmt(quote.trailingPE, 2)} hint="Trailing 12 months" />
        <Row label="P/E Ratio (Fwd)" value={fmt(quote.forwardPE, 2)} hint="Forward estimate" />
        <Row label="EPS (TTM)" value={quote.eps ? `$${fmt(quote.eps)}` : '—'} />
        <Row label="Dividend Yield" value={quote.dividendYield ? `${fmt(quote.dividendYield * 100, 2)}%` : '—'} />
        <Row label="Beta" value={fmt(quote.beta, 3)} hint="vs S&P 500" />
        <Row label="Exchange" value={quote.exchange || '—'} />
        <Row label="Currency" value={quote.currency || 'USD'} />
      </div>
    </div>
  );
}
