import { useState, useEffect } from 'react';

const STORAGE_KEY = 'stock-watchlist';
const DEFAULT_SYMBOLS = ['NVDA', 'AVGO', 'INTC', 'AAPL', 'MSFT', 'TSLA', 'AMD', 'META'];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SYMBOLS;
    } catch {
      return DEFAULT_SYMBOLS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addSymbol = (symbol: string) => {
    const s = symbol.toUpperCase().trim();
    if (s && !watchlist.includes(s)) {
      setWatchlist(prev => [...prev, s]);
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  };

  const hasSymbol = (symbol: string) => watchlist.includes(symbol.toUpperCase());

  return { watchlist, addSymbol, removeSymbol, hasSymbol };
}
