import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchQuote } from '../services/api';
import type { StockQuote } from '../types';

interface Props {
  quotes: Record<string, StockQuote>;
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtLarge(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${fmt(n)}`;
}

export default function PortfolioPanel({ quotes }: Props) {
  const { t } = useLanguage();
  const { portfolio, addPosition, removePosition } = usePortfolio();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [formSymbol, setFormSymbol] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Unique symbols not already in watchlist quotes
  const missingSymbols = [...new Set(portfolio.map(e => e.symbol))].filter(s => !quotes[s]);

  const refreshPrices = useCallback(async () => {
    if (missingSymbols.length === 0) return;
    const results = await Promise.allSettled(missingSymbols.map(s => fetchQuote(s)));
    const next: Record<string, number> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') next[missingSymbols[i]] = r.value.regularMarketPrice;
    });
    setPrices(prev => ({ ...prev, ...next }));
  }, [missingSymbols.join(',')]);

  useEffect(() => { refreshPrices(); }, [refreshPrices]);

  useEffect(() => {
    const id = setInterval(refreshPrices, 30000);
    return () => clearInterval(id);
  }, [refreshPrices]);

  function getPrice(symbol: string): number | null {
    if (quotes[symbol]) return quotes[symbol].regularMarketPrice;
    return prices[symbol] ?? null;
  }

  // Compute per-position stats
  const rows = portfolio.map(entry => {
    const price = getPrice(entry.symbol);
    const costBasis = entry.quantity * entry.purchasePrice;
    const mktValue = price != null ? price * entry.quantity : null;
    const pnlDollar = mktValue != null ? mktValue - costBasis : null;
    const pnlPct = pnlDollar != null && costBasis > 0 ? (pnlDollar / costBasis) * 100 : null;
    return { ...entry, price, costBasis, mktValue, pnlDollar, pnlPct };
  });

  // Portfolio totals
  const totalCost = rows.reduce((s, r) => s + r.costBasis, 0);
  const totalValue = rows.reduce((s, r) => s + (r.mktValue ?? r.costBasis), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const hasPrices = rows.some(r => r.mktValue != null);
  const largest = rows.reduce<typeof rows[number] | null>((max, row) => {
    if (!row.mktValue) return max;
    if (!max || (row.mktValue || 0) > (max.mktValue || 0)) return row;
    return max;
  }, null);
  const concentration = largest?.mktValue && totalValue > 0 ? (largest.mktValue / totalValue) * 100 : 0;
  const weightedMove = rows.reduce((sum, row) => {
    const quote = quotes[row.symbol];
    const weight = row.mktValue && totalValue > 0 ? row.mktValue / totalValue : 0;
    return sum + weight * Math.abs(quote?.regularMarketChangePercent || 0);
  }, 0);
  const riskScore = Math.min(100, Math.round(concentration * 0.65 + weightedMove * 6));
  const riskLabel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = formSymbol.trim().toUpperCase();
    const qty = parseFloat(formQty);
    const price = parseFloat(formPrice);
    if (!sym || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) return;
    setSubmitting(true);
    addPosition(sym, qty, price);
    setFormSymbol(''); setFormQty(''); setFormPrice('');
    setShowForm(false);
    setSubmitting(false);
  };

  const pnlColor = (v: number | null) => {
    if (v == null) return '#5b6b80';
    return v >= 0 ? '#22c55e' : '#ef4444';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#5b6b80', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
          {t.portfolioSummary}
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#0092bc', borderRadius: '8px', padding: '6px 14px',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.addPosition}
          </button>
        )}
      </div>

      {/* Summary cards */}
      {portfolio.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: t.totalValue, value: hasPrices ? fmtLarge(totalValue) : '—', color: '#f4f4ec' },
            { label: t.totalCost, value: fmtLarge(totalCost), color: '#5b6b80' },
            {
              label: t.totalPnl,
              value: hasPrices ? `${totalPnl >= 0 ? '+' : ''}${fmtLarge(totalPnl)} (${totalPnlPct >= 0 ? '+' : ''}${fmt(totalPnlPct, 1)}%)` : '—',
              color: hasPrices ? pnlColor(totalPnl) : '#5b6b80',
            },
          ].map(card => (
            <div key={card.label} style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '10px', padding: '14px' }}>
              <div style={{ color: '#6e7d92', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{card.label}</div>
              <div style={{ color: card.color, fontWeight: 700, fontSize: '1rem' }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {portfolio.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(130px, 1fr))', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20', marginBottom: 20 }}>
          {[
            { label: 'Risk Score', value: `${riskScore}/100`, color: riskScore >= 70 ? '#ff3b30' : riskScore >= 40 ? '#f7b500' : '#16d46b' },
            { label: 'Risk Level', value: riskLabel, color: riskScore >= 70 ? '#ff3b30' : riskScore >= 40 ? '#f7b500' : '#16d46b' },
            { label: 'Largest Position', value: largest ? `${largest.symbol} ${((concentration) ?? 0).toFixed(1)}%` : '-', color: '#f4f4ec' },
            { label: 'Volatility Drag', value: `${((weightedMove) ?? 0).toFixed(2)}%`, color: '#f7b500' },
          ].map(card => (
            <div key={card.label} style={{ background: '#080808', padding: 12 }}>
              <div style={{ color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ color: card.color, fontWeight: 900, fontSize: '1rem', marginTop: 5 }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add position form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ color: '#5b6b80', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>{t.addPosition}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#6e7d92', fontSize: '0.68rem', marginBottom: '4px' }}>{t.symbolLabel}</div>
              <input
                autoFocus
                className="input-field"
                value={formSymbol}
                onChange={e => setFormSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ color: '#6e7d92', fontSize: '0.68rem', marginBottom: '4px' }}>{t.quantity}</div>
              <input
                className="input-field"
                type="number"
                min="0.001"
                step="any"
                value={formQty}
                onChange={e => setFormQty(e.target.value)}
                placeholder="10"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ color: '#6e7d92', fontSize: '0.68rem', marginBottom: '4px' }}>{t.purchasePrice}</div>
              <input
                className="input-field"
                type="number"
                min="0.01"
                step="any"
                value={formPrice}
                onChange={e => setFormPrice(e.target.value)}
                placeholder="150.00"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
              {t.add}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Holdings table */}
      {portfolio.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6e7d92' }}>
          <div style={{ fontSize: '0.78rem', marginBottom: '12px', color: '#f7b500', fontWeight: 800, letterSpacing: '0.8px' }}>PORTFOLIO</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#5b6b80', marginBottom: '6px' }}>{t.portfolioEmpty}</div>
          <div style={{ fontSize: '0.8rem' }}>{t.portfolioEmptyHint}</div>
        </div>
      ) : (
        <div className="portfolio-table-wrap">
          {/* Table header */}
          <div className="portfolio-table-row portfolio-table-head">
            {[t.symbolLabel, t.shares, t.avgCost, 'Price', t.marketValue, `${t.pnl} $`, `${t.pnl} %`, ''].map((h, i) => (
              <div key={i} style={{ color: '#6e7d92', fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>
            ))}
          </div>

          {rows.map((row, i) => (
            <div key={row.id} className="portfolio-table-row" style={{ borderBottom: i < rows.length - 1 ? '1px solid #1e2d47' : 'none' }}>
              <div style={{ color: '#f7b500', fontWeight: 800, fontSize: '0.88rem' }}>{row.symbol}</div>
              <div style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>{row.quantity}</div>
              <div style={{ color: '#5b6b80', fontSize: '0.82rem' }}>${fmt(row.purchasePrice)}</div>
              <div style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>
                {row.price != null ? `$${fmt(row.price)}` : '—'}
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>
                {row.mktValue != null ? fmtLarge(row.mktValue) : '—'}
              </div>
              <div style={{ color: pnlColor(row.pnlDollar), fontWeight: 600, fontSize: '0.82rem' }}>
                {row.pnlDollar != null ? `${row.pnlDollar >= 0 ? '+' : ''}$${fmt(Math.abs(row.pnlDollar))}` : '—'}
              </div>
              <div style={{ color: pnlColor(row.pnlPct), fontWeight: 600, fontSize: '0.82rem' }}>
                {row.pnlPct != null ? `${row.pnlPct >= 0 ? '+' : ''}${fmt(row.pnlPct, 1)}%` : '—'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => removePosition(row.id)}
                  style={{ background: 'transparent', border: 'none', color: '##8b99ad', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '##8b99ad')}
                  title={t.remove}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
