import { useEffect, useMemo, useState } from 'react';
import { fetchAnalystForecast, fetchQuotes } from '../services/api';
import type { AnalystForecast, StockQuote } from '../types';

interface Props {
  baseSymbol: string;
  watchlist: string[];
}

export default function CompareStocksPanel({ baseSymbol, watchlist }: Props) {
  const [symbols, setSymbols] = useState(() => [baseSymbol, ...watchlist.filter(s => s !== baseSymbol).slice(0, 3)].join(','));
  const selected = useMemo(() => symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).slice(0, 5), [symbols]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [forecasts, setForecasts] = useState<Record<string, AnalystForecast>>({});

  function displayConsensus(consensus: string | undefined) {
    const map: Record<string, string> = {
      'Strong Buy': 'Strong Bullish',
      'Moderate Buy': 'Moderately Bullish',
      Buy: 'Bullish',
      Hold: 'Neutral',
      Sell: 'Bearish',
      'Strong Sell': 'Strong Bearish',
    };
    return consensus ? (map[consensus] || consensus) : '-';
  }

  useEffect(() => {
    if (!selected.length) return;
    fetchQuotes(selected).then(setQuotes).catch(() => setQuotes({}));
    Promise.allSettled(selected.map(s => fetchAnalystForecast(s))).then(results => {
      const next: Record<string, AnalystForecast> = {};
      results.forEach((r, i) => { if (r.status === 'fulfilled') next[selected[i]] = r.value; });
      setForecasts(next);
    });
  }, [selected.join(',')]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input-field" value={symbols} onChange={e => setSymbols(e.target.value)} placeholder="NVDA,AMD,AVGO" />
      </div>
      <div style={{ border: '1px solid #2d2b20', overflowX: 'auto' }}>
        <div style={{ minWidth: 760 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '8px 12px', background: '#151108', color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>
            <div>Symbol</div><div>Price</div><div>Day %</div><div>Consensus</div><div>Target</div><div>Upside</div>
          </div>
          {selected.map(sym => {
            const q = quotes[sym];
            const f = forecasts[sym];
            const liveUpside = q?.regularMarketPrice && f?.targetMeanPrice
              ? ((f.targetMeanPrice - q.regularMarketPrice) / q.regularMarketPrice) * 100
              : f?.upsidePercent;
            return (
              <div key={sym} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 12px', borderTop: '1px solid #2d2b20', color: '#b4b49f', fontSize: '0.82rem' }}>
                <div style={{ color: '#f7b500', fontWeight: 900 }}>{sym}</div>
                <div>{q ? `$${q.regularMarketPrice.toFixed(2)}` : '-'}</div>
                <div style={{ color: q && q.regularMarketChangePercent >= 0 ? '#16d46b' : '#ff3b30' }}>{q ? `${q.regularMarketChangePercent >= 0 ? '+' : ''}${(q.regularMarketChangePercent ?? 0).toFixed(2)}%` : '-'}</div>
                <div>{displayConsensus(f?.consensus)}</div>
                <div>{f?.targetMeanPrice ? `$${f.targetMeanPrice.toFixed(2)}` : '-'}</div>
                <div style={{ color: liveUpside != null && liveUpside >= 0 ? '#16d46b' : '#ff3b30' }}>{liveUpside != null ? `${liveUpside >= 0 ? '+' : ''}${liveUpside.toFixed(1)}%` : '-'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
