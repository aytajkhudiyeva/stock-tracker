import { useState, useCallback } from 'react';
import type { PortfolioEntry } from '../types';

const STORAGE_KEY = 'stock-portfolio';

function load(): PortfolioEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>(load);

  const persist = (entries: PortfolioEntry[]) => {
    setPortfolio(entries);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
  };

  const addPosition = useCallback((symbol: string, quantity: number, purchasePrice: number) => {
    const entry: PortfolioEntry = {
      id: `${((symbol) ?? '').toUpperCase()}-${Date.now()}`,
      symbol: ((symbol) ?? '').toUpperCase(),
      quantity,
      purchasePrice,
      addedAt: new Date().toISOString(),
    };
    persist([...load(), entry]);
  }, []);

  const removePosition = useCallback((id: string) => {
    persist(load().filter(e => e.id !== id));
  }, []);

  return { portfolio, addPosition, removePosition };
}
