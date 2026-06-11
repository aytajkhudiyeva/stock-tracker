import { useState, useCallback, useEffect } from 'react';
import { searchStocks } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { SearchResult } from '../types';

interface HeaderProps {
  onSelectStock: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
}

export default function Header({ onSelectStock, onAddToWatchlist }: HeaderProps) {
  const { t, lang, toggleLang } = useLanguage();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'; } catch { return 'dark'; }
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); setOpen(false); return; }
    setSearching(true);
    try {
      const data = await searchStocks(q);
      setResults(data.slice(0, 6));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const select = (symbol: string) => {
    onSelectStock(symbol);
    setQuery(''); setResults([]); setOpen(false);
  };

  const addToWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    onAddToWatchlist(symbol);
    setQuery(''); setResults([]); setOpen(false);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  return (
    <header className="site-header">
      <div className="site-header-inner">

        {/* Logo */}
        <div className="brand-lockup">
          <div style={{ background: '#f7b500', borderRadius: '2px', padding: '8px', border: '1px solid #ffc83d' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white" style={{ fontSize: '1.1rem', letterSpacing: '0.2px' }}>StockAZ</div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{t.tagline}</div>
          </div>
        </div>

        {/* Search */}
        <div className="header-search">
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6e7d92' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input-field"
              style={{ paddingLeft: '38px' }}
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onFocus={() => results.length > 0 && setOpen(true)}
            />
            {searching && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <div style={{ width: '14px', height: '14px', border: '2px solid #2b2b24', borderTopColor: '#f7b500', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}
          </div>

          {open && results.length > 0 && (
            <div className="card" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100, overflow: 'hidden' }}>
              {results.map(r => (
                <div
                  key={r.symbol}
                  onClick={() => select(r.symbol)}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #1e2d47', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a2540')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div>
                    <span className="font-bold text-white" style={{ fontSize: '0.9rem' }}>{r.symbol}</span>
                    <span className="text-secondary" style={{ fontSize: '0.8rem', marginLeft: '8px' }}>{r.shortname || r.longname}</span>
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                    onClick={e => addToWatchlist(e, r.symbol)}
                  >{t.addWatch}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Live + Language toggle */}
        <div className="header-actions">
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{t.live}</span>
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              display: 'flex', alignItems: 'center',
              background: '#050505', border: '1px solid #2b2b24',
              borderRadius: '2px', padding: '3px', cursor: 'pointer', gap: '2px',
            }}
            title={lang === 'en' ? 'Switch to Azerbaijani' : 'İngilis dilinə keç'}
          >
            {(['en', 'az'] as const).map(l => (
              <span key={l} style={{
                padding: '3px 9px', borderRadius: '5px',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3px',
                background: lang === l ? '#f7b500' : 'transparent',
                color: lang === l ? '#050505' : '#8b8b7a',
                transition: 'all 0.15s',
              }}>
                {((l) ?? '').toUpperCase()}
              </span>
            ))}
          </button>

          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="theme-toggle"
            title={theme === 'dark' ? t.lightTheme : t.darkTheme}
            aria-label={theme === 'dark' ? t.lightTheme : t.darkTheme}
          >
            <span className={theme === 'dark' ? 'theme-toggle-active' : ''}>{t.darkTheme}</span>
            <span className={theme === 'light' ? 'theme-toggle-active' : ''}>{t.lightTheme}</span>
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
