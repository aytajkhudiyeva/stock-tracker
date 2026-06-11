import { useState, useEffect } from 'react';
import { fetchEarnings } from '../services/api';
import type { StockQuote } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface StockCardProps {
  quote: StockQuote;
  selected: boolean;
  onClick: () => void;
  onRemove: () => void;
}

function fmt(n: number | undefined, digits = 2) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtLarge(n: number | undefined) {
  if (n === undefined || n === null) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

export default function StockCard({ quote, selected, onClick, onRemove }: StockCardProps) {
  const { t } = useLanguage();
  const [earningsDays, setEarningsDays] = useState<number | null>(null);
  const up = quote.regularMarketChange >= 0;

  useEffect(() => {
    fetchEarnings(quote.symbol)
      .then(d => { if (d.daysUntilEarnings != null && d.daysUntilEarnings >= 0 && d.daysUntilEarnings <= 14) setEarningsDays(d.daysUntilEarnings); })
      .catch(() => {});
  }, [quote.symbol]);
  const changeColor = up ? '#22c55e' : '#ef4444';

  return (
    <div
      onClick={onClick}
      className="card card-hover"
      style={{
        padding: '16px',
        position: 'relative',
        borderColor: selected ? '#f7b500' : undefined,
        boxShadow: selected ? 'inset 3px 0 0 #f7b500' : undefined,
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'transparent', border: 'none', color: '#6e7d92',
          cursor: 'pointer', padding: '2px', borderRadius: '4px', lineHeight: 1,
          fontSize: '1rem', transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6e7d92')}
        title={t.removeFromWatchlist}
      >×</button>

      <div style={{ marginBottom: '10px' }}>
        <div className="font-bold text-white" style={{ fontSize: '1rem', letterSpacing: '0.3px' }}>{quote.symbol}</div>
        <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
          {quote.shortName || quote.longName || '—'}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div key={quote.regularMarketPrice} className="font-bold price-live" style={{ fontSize: '1.35rem', color: '#f4f4ec', letterSpacing: '0' }}>
          ${fmt(quote.regularMarketPrice)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span style={{
          background: up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          color: changeColor,
          border: `1px solid ${up ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: '6px', padding: '2px 7px', fontSize: '0.75rem', fontWeight: 600,
        }}>
          {up ? '+' : ''}{fmt(quote.regularMarketChange)} ({up ? '+' : ''}{fmt(quote.regularMarketChangePercent)}%)
        </span>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>{t.marketCap}</div>
          <div className="text-secondary" style={{ fontSize: '0.78rem', fontWeight: 500 }}>{fmtLarge(quote.marketCap)}</div>
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>{t.peRatio}</div>
          <div className="text-secondary" style={{ fontSize: '0.78rem', fontWeight: 500 }}>{quote.trailingPE ? fmt(quote.trailingPE, 1) : '—'}</div>
        </div>
      </div>

      {earningsDays != null && (
        <div style={{ marginTop: '8px' }}>
          <span style={{
            background: earningsDays <= 1 ? 'rgba(239,68,68,0.12)' : earningsDays <= 7 ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.1)',
            color: earningsDays <= 1 ? '#ef4444' : earningsDays <= 7 ? '#f59e0b' : '#f7b500',
            border: `1px solid ${earningsDays <= 1 ? 'rgba(239,68,68,0.25)' : earningsDays <= 7 ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.2)'}`,
            borderRadius: '5px', padding: '2px 7px', fontSize: '0.68rem', fontWeight: 700,
          }}>
            {t.earningsIn} {earningsDays === 0 ? t.today : earningsDays === 1 ? t.tomorrow : `${earningsDays}d`}
          </span>
        </div>
      )}
    </div>
  );
}
