import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchHistory } from '../services/api';
import type { HistoryPoint, Period } from '../types';
import { format } from 'date-fns';

const PERIODS: { label: string; value: Period }[] = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
];

interface Props {
  symbol: string;
  isUp: boolean;
}

function formatDate(dateStr: string, period: Period) {
  try {
    const d = new Date(dateStr);
    if (period === '1d' || period === '5d') return format(d, 'MMM d HH:mm');
    return format(d, 'MMM d');
  } catch {
    return dateStr;
  }
}

const CustomTooltip = ({ active, payload, period }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card" style={{ padding: '10px 14px', border: '1px solid #2a3f5f', minWidth: '160px' }}>
      <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>{formatDate(d.date, period)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>Open</span><div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>${d.open?.toFixed(2)}</div></div>
        <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>Close</span><div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>${d.close?.toFixed(2)}</div></div>
        <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>High</span><div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 500 }}>${d.high?.toFixed(2)}</div></div>
        <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>Low</span><div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>${d.low?.toFixed(2)}</div></div>
      </div>
    </div>
  );
};

export default function StockChart({ symbol, isUp }: Props) {
  const [period, setPeriod] = useState<Period>('1mo');
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchHistory(symbol, period)
      .then(d => { setData(d.filter(p => p.close)); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [symbol, period]);

  const color = isUp ? '#22c55e' : '#ef4444';
  const gradientId = `grad-${symbol}-${isUp ? 'up' : 'down'}`;

  if (loading) return (
    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #1e2d47', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: '8px' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style={{ fontSize: '0.85rem' }}>Failed to load chart data</span>
    </div>
  );

  const minClose = Math.min(...data.map(d => d.close));
  const maxClose = Math.max(...data.map(d => d.close));
  const padding = (maxClose - minClose) * 0.05;

  return (
    <div>
      {/* Period selector */}
      <div className="flex gap-1 mb-4">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding: '5px 11px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.15s',
              background: period === p.value ? '#3b82f6' : 'transparent',
              color: period === p.value ? 'white' : '#64748b',
            }}
            onMouseEnter={e => { if (period !== p.value) e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={e => { if (period !== p.value) e.currentTarget.style.color = '#64748b'; }}
          >{p.label}</button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={d => formatDate(d, period)}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minClose - padding, maxClose + padding]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v.toFixed(0)}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip period={period} />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#0a0e1a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
