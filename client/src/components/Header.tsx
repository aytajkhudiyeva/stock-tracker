import { useState, useCallback } from 'react';
import { searchStocks } from '../services/api';
import type { SearchResult } from '../types';

interface HeaderProps {
  onSelectStock: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
}

export default function Header({ onSelectStock, onAddToWatchlist }: HeaderProps) {
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
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const addToWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    onAddToWatchlist(symbol);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <header style={{ background: '#0a0e1a', borderBottom: '1px solid #1e2d47' }} className="sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '10px', padding: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white" style={{ fontSize: '1.1rem', letterSpacing: '-0.3px' }}>StockTrack</div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Real-time market data</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input-field"
              style={{ paddingLeft: '38px' }}
              placeholder="Search stocks (NVDA, Apple, etc.)"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onFocus={() => results.length > 0 && setOpen(true)}
            />
            {searching && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <div style={{ width: '14px', height: '14px', border: '2px solid #1e2d47', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
                  >+ Watch</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="pulse-dot" />
          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Live</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
