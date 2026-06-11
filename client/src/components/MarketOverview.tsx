import { useEffect, useState } from 'react';
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

function symbolSeed(symbol: string) {
  return [...symbol].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export default function MarketOverview({ quotes }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="market-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px' }}>
      {Object.entries(quotes).map(([symbol, quote]) => {
        const seed = symbolSeed(symbol);
        const wave = Math.sin(tick * 0.9 + seed) * 0.00045;
        const displayPrice = quote.regularMarketPrice * (1 + wave);
        const displayChange = quote.regularMarketChange + quote.regularMarketPrice * wave;
        const prevClose = quote.regularMarketPreviousClose || (quote.regularMarketPrice - quote.regularMarketChange);
        const displayChangePercent = prevClose ? (displayChange / prevClose) * 100 : quote.regularMarketChangePercent;
        const up = displayChange >= 0;
        const isIndex = symbol.startsWith('%5E') || symbol.startsWith('^');
        const name = INDEX_NAMES[symbol] || quote.shortName || quote.symbol;

        return (
          <div
            key={symbol}
            style={{
              background: '#080808',
              border: '1px solid #2b2b24',
              borderRadius: '2px',
              padding: '12px',
            }}
          >
            <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>{name}</div>
            <div key={`${quote.regularMarketPrice}-${tick}`} className="price-live" style={{ color: '#f4f4ec', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0' }}>
              {isIndex ? '' : '$'}{fmt(displayPrice)}
            </div>
            <div style={{ marginTop: '4px' }}>
              <span style={{
                color: up ? '#22c55e' : '#ef4444',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                {up ? '▲' : '▼'} {up ? '+' : ''}{fmt(displayChange)} ({up ? '+' : ''}{fmt(displayChangePercent)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
