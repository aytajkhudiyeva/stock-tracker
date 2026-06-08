import { useState, useEffect, useCallback } from 'react';
import { fetchQuotes, fetchQuote } from './services/api';
import { useWatchlist } from './hooks/useWatchlist';
import { useLanguage } from './i18n/LanguageContext';
import Header from './components/Header';
import StockCard from './components/StockCard';
import StockChart from './components/StockChart';
import MetricsPanel from './components/MetricsPanel';
import AlertsPanel from './components/AlertsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import EarningsPanel from './components/EarningsPanel';
import PortfolioPanel from './components/PortfolioPanel';
import EconomicCalendar from './components/EconomicCalendar';
import MarketOverview from './components/MarketOverview';
import type { StockQuote } from './types';
import './index.css';

function isMarketOpen() {
  try {
    const nyStr = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const ny = new Date(nyStr);
    const day = ny.getDay();
    if (day === 0 || day === 6) return false;
    const mins = ny.getHours() * 60 + ny.getMinutes();
    return mins >= 570 && mins < 960; // 9:30 AM – 4:00 PM ET
  } catch { return true; }
}

const MARKET_SYMBOLS = ['^GSPC', '^DJI', '^IXIC', '^VIX'];
const REFRESH_INTERVAL = 30000;

type RightTab = 'chart' | 'metrics' | 'alerts' | 'analysis' | 'earnings';

function LoadingCard() {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div className="shimmer" style={{ height: '16px', borderRadius: '4px', marginBottom: '8px', width: '60%' }} />
      <div className="shimmer" style={{ height: '24px', borderRadius: '4px', marginBottom: '8px', width: '80%' }} />
      <div className="shimmer" style={{ height: '14px', borderRadius: '4px', width: '50%' }} />
    </div>
  );
}

export default function App() {
  const { watchlist, addSymbol, removeSymbol, hasSymbol } = useWatchlist();
  const { t } = useLanguage();
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [marketQuotes, setMarketQuotes] = useState<Record<string, StockQuote>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [loading, setLoading] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>('chart');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mainView, setMainView] = useState<'dashboard' | 'portfolio' | 'economy'>('dashboard');

  const loadQuotes = useCallback(async () => {
    if (watchlist.length === 0) { setLoading(false); return; }
    try {
      const [watchlistData, marketData] = await Promise.all([
        fetchQuotes(watchlist),
        fetchQuotes(MARKET_SYMBOLS).catch(() => ({})),
      ]);
      setQuotes(watchlistData);
      setMarketQuotes(marketData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load quotes', err);
    } finally {
      setLoading(false);
    }
  }, [watchlist.join(',')]);

  useEffect(() => {
    setLoading(true);
    loadQuotes();
  }, [watchlist.join(',')]);

  useEffect(() => {
    const id = setInterval(() => { if (isMarketOpen()) loadQuotes(); }, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [loadQuotes]);

  const handleSelectStock = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setRightTab('chart');
    if (!quotes[symbol]) {
      try {
        const q = await fetchQuote(symbol);
        setQuotes(prev => ({ ...prev, [symbol]: q }));
      } catch {}
    }
  };

  const handleAddToWatchlist = async (symbol: string) => {
    addSymbol(symbol);
    setSelectedSymbol(symbol);
    if (!quotes[symbol]) {
      try {
        const q = await fetchQuote(symbol);
        setQuotes(prev => ({ ...prev, [symbol]: q }));
      } catch {}
    }
  };

  const selectedQuote = quotes[selectedSymbol];
  const isUp = selectedQuote ? selectedQuote.regularMarketChange >= 0 : true;

  function fmt(n: number | undefined, digits = 2) {
    if (n === undefined || n === null) return '—';
    return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  const TAB_LABELS: Record<RightTab, string> = {
    chart: t.tabChart,
    metrics: t.tabMetrics,
    analysis: t.tabAnalysis,
    earnings: t.tabEarnings,
    alerts: t.tabAlerts,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      <Header onSelectStock={handleSelectStock} onAddToWatchlist={handleAddToWatchlist} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['dashboard', 'portfolio', 'economy'] as const).map(view => (
            <button
              key={view}
              onClick={() => setMainView(view)}
              style={{
                padding: '7px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: mainView === view ? 'rgba(59,130,246,0.15)' : 'transparent',
                border: mainView === view ? '1px solid rgba(59,130,246,0.4)' : '1px solid #1e2d47',
                color: mainView === view ? '#60a5fa' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {view === 'dashboard' ? t.dashboardView : view === 'portfolio' ? t.portfolio : t.economicCalendarView}
            </button>
          ))}
        </div>

        {/* Portfolio view */}
        {mainView === 'portfolio' && (
          <div className="card" style={{ padding: '24px' }}>
            <PortfolioPanel quotes={quotes} />
          </div>
        )}

        {/* Economic Calendar view */}
        {mainView === 'economy' && (
          <div className="card" style={{ padding: '24px' }}>
            <EconomicCalendar />
          </div>
        )}

        {/* Dashboard view */}
        {mainView === 'dashboard' && <>
        {/* Market Overview */}
        {Object.keys(marketQuotes).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
              {t.marketOverview}
            </div>
            <MarketOverview quotes={marketQuotes} />
          </div>
        )}

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Watchlist */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {t.watchlist} ({watchlist.length})
              </div>
              {lastUpdated && (
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                  {t.updated} {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <LoadingCard key={i} />)
                : watchlist.map(sym => {
                    const q = quotes[sym];
                    if (!q) return (
                      <div key={sym} className="card" style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{sym}</span>
                        <button onClick={() => removeSymbol(sym)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                      </div>
                    );
                    return (
                      <StockCard
                        key={sym}
                        quote={q}
                        selected={selectedSymbol === sym}
                        onClick={() => { setSelectedSymbol(sym); setRightTab('chart'); }}
                        onRemove={() => removeSymbol(sym)}
                      />
                    );
                  })
              }
              <AddStockButton onAdd={handleAddToWatchlist} />
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {selectedQuote ? (
              <div className="card" style={{ padding: '24px' }}>
                {/* Stock header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                        {selectedQuote.symbol}
                      </h1>
                      <span className="text-secondary" style={{ fontSize: '1rem' }}>
                        {selectedQuote.shortName || selectedQuote.longName}
                      </span>
                      {!hasSymbol(selectedQuote.symbol) && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                          onClick={() => addSymbol(selectedQuote.symbol)}
                        >{t.addToWatchlist}</button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px' }}>
                        ${fmt(selectedQuote.regularMarketPrice)}
                      </span>
                      <span style={{
                        background: isUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: isUp ? '#22c55e' : '#ef4444',
                        border: `1px solid ${isUp ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        padding: '5px 14px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
                      }}>
                        {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{fmt(selectedQuote.regularMarketChange)} ({isUp ? '+' : ''}{fmt(selectedQuote.regularMarketChangePercent)}%)
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                      {selectedQuote.exchange} · {selectedQuote.currency || 'USD'} · {lastUpdated?.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1e2d47', marginBottom: '20px' }}>
                  {(['chart', 'metrics', 'analysis', 'earnings', 'alerts'] as RightTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      style={{
                        padding: '8px 18px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `2px solid ${rightTab === tab ? '#3b82f6' : 'transparent'}`,
                        color: rightTab === tab ? '#60a5fa' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'color 0.15s',
                        marginBottom: '-1px',
                      }}
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>

                {rightTab === 'chart'    && <StockChart symbol={selectedQuote.symbol} isUp={isUp} currentPrice={selectedQuote.regularMarketPrice} />}
                {rightTab === 'metrics'  && <MetricsPanel quote={selectedQuote} />}
                {rightTab === 'analysis' && <AnalysisPanel symbol={selectedQuote.symbol} price={selectedQuote.regularMarketPrice} />}
                {rightTab === 'earnings' && <EarningsPanel symbol={selectedQuote.symbol} />}
                {rightTab === 'alerts'   && <AlertsPanel defaultSymbol={selectedQuote.symbol} />}
              </div>
            ) : (
              <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }}>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                </svg>
                {t.selectStock}
              </div>
            )}
          </div>
        </div>
        </>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AddStockButton({ onAdd }: { onAdd: (s: string) => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) { onAdd(value.trim()); setValue(''); setOpen(false); }
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="btn-secondary"
      style={{ width: '100%', textAlign: 'center', padding: '10px' }}
    >
      {t.addStock}
    </button>
  );

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '6px' }}>
      <input
        autoFocus
        className="input-field"
        value={value}
        onChange={e => setValue(e.target.value.toUpperCase())}
        placeholder={t.enterTicker}
        style={{ flex: 1 }}
      />
      <button className="btn-primary" type="submit" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{t.add}</button>
      <button type="button" className="btn-secondary" onClick={() => setOpen(false)} style={{ padding: '8px 10px' }}>✕</button>
    </form>
  );
}
