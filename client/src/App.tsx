import { useState, useEffect, useCallback } from 'react';
import { fetchQuotes, fetchQuote } from './services/api';
import { useWatchlist } from './hooks/useWatchlist';
import { useLanguage } from './i18n/LanguageContext';
import { uiLabels } from './i18n/uiLabels';
import Header from './components/Header';
import StockCard from './components/StockCard';
import StockChart from './components/StockChart';
import MetricsPanel from './components/MetricsPanel';
import AlertsPanel from './components/AlertsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import AnalystForecastPanel from './components/AnalystForecastPanel';
import AiStockSummaryPanel from './components/AiStockSummaryPanel';
import NewsSentimentPanel from './components/NewsSentimentPanel';
import CorporateActivityPanel from './components/CorporateActivityPanel';
import CompareStocksPanel from './components/CompareStocksPanel';
import WatchlistHeatmap from './components/WatchlistHeatmap';
import SectorIndustryMap from './components/SectorIndustryMap';
import ValuationScorePanel from './components/ValuationScorePanel';
import OptionsSentimentPanel from './components/OptionsSentimentPanel';
import TechnicalScanner from './components/TechnicalScanner';
import StockScreener from './components/StockScreener';
import DailyBrief from './components/DailyBrief';
import TradingJournal from './components/TradingJournal';
import MobileTodayView from './components/MobileTodayView';
import EarningsPanel from './components/EarningsPanel';
import PortfolioPanel from './components/PortfolioPanel';
import EconomicCalendar from './components/EconomicCalendar';
import MarketOverview from './components/MarketOverview'
import BrokersSection from './components/BrokersSection';
import type { StockQuote } from './types';
import './index.css';

const MARKET_SYMBOLS = ['^GSPC', '^DJI', '^IXIC', '^VIX'];
const REFRESH_INTERVAL = 30000;

type RightTab = 'summary' | 'chart' | 'metrics' | 'valuation' | 'options' | 'alerts' | 'analysis' | 'forecast' | 'news' | 'activity' | 'compare' | 'earnings';

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
  const { t, lang } = useLanguage();
  const ui = uiLabels(lang);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [marketQuotes, setMarketQuotes] = useState<Record<string, StockQuote>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [loading, setLoading] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>('summary');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
const [mainView, setMainView] = useState<'dashboard' | 'brief' | 'today' | 'scanner' | 'screener' | 'journal' | 'portfolio' | 'economy' | 'brokers'>('dashboard');  const [loadError, setLoadError] = useState(false);

  const loadQuotes = useCallback(async () => {
    if (watchlist.length === 0) { setLoading(false); return; }
    try {
      setLoadError(false);
      const [watchlistData, marketData] = await Promise.all([
        fetchQuotes(watchlist),
        fetchQuotes(MARKET_SYMBOLS).catch(() => ({})),
      ]);
      setQuotes(watchlistData);
      setMarketQuotes(marketData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load quotes', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [watchlist.join(',')]);

  useEffect(() => {
    setLoading(true);
    loadQuotes();
  }, [watchlist.join(',')]);

  useEffect(() => {
    const id = setInterval(loadQuotes, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [loadQuotes]);

  const handleSelectStock = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setRightTab('summary');
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
    summary: ui.summary,
    chart: t.tabChart,
    metrics: t.tabMetrics,
    valuation: ui.valuation,
    options: ui.options,
    analysis: t.tabAnalysis,
    forecast: t.tabForecast,
    news: ui.news,
    activity: ui.activity,
    compare: ui.compare,
    earnings: t.tabEarnings,
    alerts: t.tabAlerts,
  };

  return (
    <div className="app-shell">
      <Header onSelectStock={handleSelectStock} onAddToWatchlist={handleAddToWatchlist} />

        <div className="app-container">
        <div className="compliance-banner">
          {ui.compliance}
        </div>

        {/* View toggle */}
        <div className="view-tabs">
{(['dashboard', 'brief', 'today', 'scanner', 'screener', 'journal', 'portfolio', 'economy', 'brokers'] as const).map(view => (            <button
              key={view}
              onClick={() => setMainView(view)}
              className={`view-tab ${mainView === view ? 'view-tab-active' : ''}`}
            >
{view === 'dashboard' ? t.dashboardView : view === 'brief' ? ui.brief : view === 'today' ? ui.today : view === 'scanner' ? ui.scanner : view === 'screener' ? ui.screener : view === 'journal' ? ui.journal : view === 'portfolio' ? t.portfolio : view === 'economy' ? t.economicCalendarView : ui.brokers}            </button>
          ))}
        </div>

        {mainView === 'brief' && <DailyBrief quotes={quotes} />}
        {mainView === 'today' && <MobileTodayView quotes={quotes} onSelect={(sym) => { setSelectedSymbol(sym); setRightTab('summary'); setMainView('dashboard'); }} />}
        {mainView === 'scanner' && <TechnicalScanner quotes={quotes} />}
        {mainView === 'screener' && <StockScreener quotes={quotes} />}
        {mainView === 'journal' && <TradingJournal />}

        {/* Portfolio view */}
        {mainView === 'portfolio' && (
          <div className="card page-panel">
            <PortfolioPanel quotes={quotes} />
          </div>
        )}

        {/* Economic Calendar view */}
        {mainView === 'economy' && (
          <div className="card page-panel">
            <EconomicCalendar />
          </div>
        )}
        {/* Brokers view */}
{mainView === 'brokers' && (
  <div className="card page-panel">
    <BrokersSection />
  </div>
)}

        {/* Dashboard view */}
        {mainView === 'dashboard' && <>
        {loadError && (
          <div className="status-banner" style={{ marginBottom: '16px' }}>
            <span>{t.quoteLoadFailed}</span>
            <button className="btn-secondary" onClick={loadQuotes} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              {t.retry}
            </button>
          </div>
        )}

        {/* Market Overview */}
        {Object.keys(marketQuotes).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="section-kicker">
              {t.marketOverview}
            </div>
            <MarketOverview quotes={marketQuotes} />
          </div>
        )}

        {/* Main layout */}
        <WatchlistHeatmap quotes={quotes} onSelect={(sym) => { setSelectedSymbol(sym); setRightTab('summary'); }} />
        <SectorIndustryMap quotes={quotes} />

        {/* Main layout */}
        <div className="dashboard-grid">

          {/* Watchlist */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="section-kicker" style={{ marginBottom: 0 }}>
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
                      <div key={sym} className="card" style={{ padding: '16px', color: '#6e7d92', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{sym}</span>
                        <button onClick={() => removeSymbol(sym)} style={{ background: 'transparent', border: 'none', color: '#6e7d92', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                      </div>
                    );
                    return (
                      <StockCard
                        key={sym}
                        quote={q}
                        selected={selectedSymbol === sym}
                        onClick={() => { setSelectedSymbol(sym); setRightTab('summary'); }}
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
              <div className="card detail-panel">
                {/* Stock header */}
                <div className="detail-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#f7b500', letterSpacing: '0' }}>
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
                    <div className="price-row">
                      <span key={selectedQuote.regularMarketPrice} className="price-live" style={{ fontSize: '2rem', fontWeight: 900, color: '#f4f4ec', letterSpacing: '0' }}>
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
                <div className="detail-tabs">
                  {(['summary', 'chart', 'metrics', 'valuation', 'analysis', 'forecast', 'options', 'news', 'activity', 'compare', 'earnings', 'alerts'] as RightTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      style={{
                        padding: '8px 18px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `2px solid ${rightTab === tab ? '#f7b500' : 'transparent'}`,
                        color: rightTab === tab ? '#f7b500' : '#8b8b7a',
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

                {rightTab === 'summary'  && <AiStockSummaryPanel quote={selectedQuote} />}
                {rightTab === 'chart'    && <StockChart symbol={selectedQuote.symbol} isUp={isUp} currentPrice={selectedQuote.regularMarketPrice} />}
                {rightTab === 'metrics'  && <MetricsPanel quote={selectedQuote} />}
                {rightTab === 'valuation' && <ValuationScorePanel quote={selectedQuote} />}
                {rightTab === 'analysis' && <AnalysisPanel symbol={selectedQuote.symbol} price={selectedQuote.regularMarketPrice} />}
                {rightTab === 'forecast' && <AnalystForecastPanel symbol={selectedQuote.symbol} />}
                {rightTab === 'options'  && <OptionsSentimentPanel quote={selectedQuote} />}
                {rightTab === 'news'     && <NewsSentimentPanel symbol={selectedQuote.symbol} />}
                {rightTab === 'activity' && <CorporateActivityPanel symbol={selectedQuote.symbol} />}
                {rightTab === 'compare'  && <CompareStocksPanel baseSymbol={selectedQuote.symbol} watchlist={watchlist} />}
                {rightTab === 'earnings' && <EarningsPanel symbol={selectedQuote.symbol} />}
                {rightTab === 'alerts'   && <AlertsPanel defaultSymbol={selectedQuote.symbol} />}
              </div>
            ) : (
              <div className="card empty-state">
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
    <form onSubmit={submit} className="add-stock-form">
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
