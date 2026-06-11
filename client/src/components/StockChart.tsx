import { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart, AreaChart, Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fetchHistory, fetchIntraday } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { HistoryPoint, IntradayData, PivotKey, PivotLevels, Period } from '../types';
import type { Translations } from '../i18n/translations';
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

type PivotDef = { key: PivotKey; label: string; color: string };

const PIVOT_DEFS: PivotDef[] = [
  { key: 'r3', label: 'R3', color: '#ef4444' },
  { key: 'r2', label: 'R2', color: '#f87171' },
  { key: 'r1', label: 'R1', color: '#fca5a5' },
  { key: 'pp', label: 'PP', color: '#f59e0b' },
  { key: 's1', label: 'S1', color: '#86efac' },
  { key: 's2', label: 'S2', color: '#4ade80' },
  { key: 's3', label: 'S3', color: '#22c55e' },
];

function fmtET(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(iso));
  } catch { return iso; }
}

function formatDate(dateStr: string, period: Period) {
  try {
    const d = new Date(dateStr);
    if (period === '5d') return format(d, 'MMM d HH:mm');
    return format(d, 'MMM d');
  } catch { return dateStr; }
}

// ── Pivot Table ───────────────────────────────────────────────────────────────

interface PivotTableProps {
  pivots: PivotLevels;
  currentPrice: number;
  todayOpen: number | null;
  todayHigh: number | null;
  todayLow: number | null;
  t: Translations;
}

function PivotTable({ pivots, currentPrice, todayOpen, todayHigh, todayLow, t }: PivotTableProps) {
  const levels = PIVOT_DEFS.map(def => {
    const price = pivots[def.key];
    const dist = ((price - currentPrice) / currentPrice) * 100;
    return { ...def, price, dist, near: Math.abs(dist) < 0.5 };
  });

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Session stats */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {([
          { label: t.open,    val: todayOpen, color: '#5b6b80' },
          { label: t.dayHigh, val: todayHigh, color: '#22c55e' },
          { label: t.dayLow,  val: todayLow,  color: '#ef4444' },
        ] as const).map(({ label, val, color }) => val != null && (
          <div key={label} style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '6px', padding: '5px 10px' }}>
            <div style={{ color: '##8b99ad', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '1px' }}>{label}</div>
            <div style={{ color, fontSize: '0.82rem', fontWeight: 700 }}>${val.toFixed(2)}</div>
          </div>
        ))}
        <div style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '6px', padding: '5px 10px' }}>
          <div style={{ color: '##8b99ad', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '1px' }}>{t.prevDay} ({pivots.prevDate})</div>
          <div style={{ color: '#6e7d92', fontSize: '0.75rem' }}>
            H: ${pivots.prevHigh.toFixed(2)} · L: ${pivots.prevLow.toFixed(2)} · C: ${pivots.prevClose.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
        color: '##8b99ad', marginBottom: '6px',
        display: 'grid', gridTemplateColumns: '36px 88px 74px 1fr', gap: '0 10px', padding: '0 12px',
      }}>
        <span>{t.pivotLevels}</span>
        <span style={{ textAlign: 'right' }}>$ {t.currentPrice}</span>
        <span style={{ textAlign: 'right' }}>{t.distancePct}</span>
        <span />
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {levels.map(lv => (
          <div key={lv.key} style={{
            display: 'grid',
            gridTemplateColumns: '36px 88px 74px 1fr',
            gap: '0 10px',
            alignItems: 'center',
            padding: '7px 12px',
            borderRadius: '6px',
            background: lv.near ? 'rgba(59,130,246,0.07)' : '#0f1629',
            border: `1px solid ${lv.near ? 'rgba(59,130,246,0.35)' : '#1e2d47'}`,
            transition: 'all 0.15s',
          }}>
            {/* Label */}
            <div style={{ color: lv.color, fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {lv.label}
              {lv.near && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0092bc', display: 'inline-block', boxShadow: '0 0 6px #0092bc' }} />}
            </div>
            {/* Price */}
            <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' }}>
              ${lv.price.toFixed(2)}
            </div>
            {/* Distance */}
            <div style={{ color: lv.dist >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.78rem', fontWeight: 600, textAlign: 'right' }}>
              {lv.dist >= 0 ? '+' : ''}{lv.dist.toFixed(2)}%
            </div>
            {/* Bar */}
            <div style={{ height: '3px', background: '#1e2d47', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(Math.abs(lv.dist) * 8, 100)}%`,
                background: lv.color,
                borderRadius: '2px',
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', color: '#dce3ed', fontSize: '0.65rem', textAlign: 'center' }}>
        {t.pivotPoint}: PP = (H+L+C)/3 · R/S = Classic method · 15-min delayed
      </div>
    </div>
  );
}

// ── Intraday Chart ────────────────────────────────────────────────────────────

interface IntradayChartProps {
  data: IntradayData;
  isUp: boolean;
  currentPrice: number;
  t: Translations;
}

function IntradayChart({ data, isUp, currentPrice, t }: IntradayChartProps) {
  const { candles, pivots, todayOpen, todayHigh, todayLow } = data;
  const color = isUp ? '#22c55e' : '#ef4444';

  const maxVol = useMemo(() => Math.max(...candles.map(c => c.volume), 1), [candles]);

  // Price domain that includes VWAP and nearby pivot levels
  const allPrices = candles.flatMap(c => [c.close, c.vwap]).filter((v): v is number => v != null);
  if (pivots) {
    for (const def of PIVOT_DEFS) {
      const p = pivots[def.key];
      if (Math.abs(p - currentPrice) / currentPrice < 0.04) allPrices.push(p);
    }
  }
  const minP = allPrices.length ? Math.min(...allPrices) * 0.9997 : currentPrice * 0.99;
  const maxP = allPrices.length ? Math.max(...allPrices) * 1.0003 : currentPrice * 1.01;

  if (!candles.length) {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e7d92', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '1.8rem' }}>📊</div>
        <div style={{ fontSize: '0.85rem' }}>{t.noIntradayData}</div>
        {data.tradingDate && <div style={{ fontSize: '0.75rem', color: '#dce3ed' }}>{data.tradingDate}</div>}
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="card" style={{ padding: '9px 13px', border: '1px solid #2a3f5f', minWidth: '170px' }}>
        <div style={{ color: '#6e7d92', fontSize: '0.7rem', marginBottom: '5px' }}>{fmtET(d.date)} ET</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px' }}>
          <div><span style={{ color: '##8b99ad', fontSize: '0.65rem' }}>{t.open} </span><span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>${d.open?.toFixed(2)}</span></div>
          <div><span style={{ color: '##8b99ad', fontSize: '0.65rem' }}>{t.close} </span><span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>${d.close?.toFixed(2)}</span></div>
          <div><span style={{ color: '##8b99ad', fontSize: '0.65rem' }}>{t.high} </span><span style={{ color: '#22c55e', fontSize: '0.8rem' }}>${d.high?.toFixed(2)}</span></div>
          <div><span style={{ color: '##8b99ad', fontSize: '0.65rem' }}>{t.low} </span><span style={{ color: '#ef4444', fontSize: '0.8rem' }}>${d.low?.toFixed(2)}</span></div>
        </div>
        {d.vwap != null && (
          <div style={{ marginTop: '5px', paddingTop: '4px', borderTop: '1px solid #1e2d47' }}>
            <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>{t.vwap} </span>
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem' }}>${d.vwap.toFixed(2)}</span>
          </div>
        )}
        <div style={{ color: '##8b99ad', fontSize: '0.65rem', marginTop: '3px' }}>
          {t.volume}: {d.volume >= 1000000 ? `${(d.volume / 1000000).toFixed(2)}M` : d.volume >= 1000 ? `${(d.volume / 1000).toFixed(0)}K` : d.volume}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '2px', background: color }} />
          <span style={{ color: '#6e7d92', fontSize: '0.68rem' }}>{t.close}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '2px', background: '#f59e0b', borderTop: '1px dashed #f59e0b' }} />
          <span style={{ color: '#6e7d92', fontSize: '0.68rem' }}>{t.vwap}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '8px', background: 'rgba(59,130,246,0.2)', borderRadius: '1px' }} />
          <span style={{ color: '#6e7d92', fontSize: '0.68rem' }}>{t.volume}</span>
        </div>
        {pivots && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '16px', height: '1px', borderTop: '1px dashed #ef4444' }} />
              <span style={{ color: '#6e7d92', fontSize: '0.68rem' }}>{t.resistance}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '16px', height: '1px', borderTop: '1px dashed #f59e0b' }} />
              <span style={{ color: '#6e7d92', fontSize: '0.68rem' }}>PP</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '16px', height: '1px', borderTop: '1px dashed #22c55e' }} />
              <span style={{ color: '#6e7d92', fontSize: '0.68rem' }}>{t.support}</span>
            </div>
          </>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={candles} margin={{ top: 4, right: 52, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="grad-intraday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={fmtET}
            tick={{ fill: '#6e7d92', fontSize: 10 }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd"
          />

          {/* Left y-axis: price */}
          <YAxis
            yAxisId="price"
            domain={[minP, maxP]}
            tick={{ fill: '#6e7d92', fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${v.toFixed(1)}`}
            width={52}
          />

          {/* Right y-axis: volume (hidden, domain scaled so bars occupy ~18% of height) */}
          <YAxis yAxisId="vol" orientation="right" domain={[0, maxVol * 6]} hide />

          <Tooltip content={<CustomTooltip />} />

          {/* Volume bars (behind price) */}
          <Bar yAxisId="vol" dataKey="volume" fill="rgba(59,130,246,0.18)" isAnimationActive={false} />

          {/* Price area */}
          <Area
            yAxisId="price" type="monotone" dataKey="close"
            stroke={color} strokeWidth={1.5} fill="url(#grad-intraday)"
            dot={false} activeDot={{ r: 3, fill: color, stroke: '#0a0e1a', strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* VWAP line */}
          <Line
            yAxisId="price" type="monotone" dataKey="vwap"
            stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3"
            dot={false} activeDot={false} isAnimationActive={false}
          />

          {/* Today's open */}
          {todayOpen != null && todayOpen >= minP && todayOpen <= maxP && (
            <ReferenceLine
              yAxisId="price" y={todayOpen}
              stroke="##8b99ad" strokeDasharray="6 4" strokeWidth={1}
              label={{ value: 'O', position: 'insideTopRight', fill: '##8b99ad', fontSize: 9 }}
            />
          )}

          {/* Pivot levels — only render those within the visible price domain */}
          {pivots && PIVOT_DEFS.map(def => {
            const price = pivots[def.key];
            if (price < minP || price > maxP) return null;
            return (
              <ReferenceLine
                key={def.key}
                yAxisId="price" y={price}
                stroke={def.color} strokeDasharray="4 3" strokeWidth={1}
                label={{ value: def.label, position: 'insideTopRight', fill: def.color, fontSize: 9, fontWeight: 700 }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Pivot levels table */}
      {pivots && (
        <PivotTable
          pivots={pivots}
          currentPrice={currentPrice}
          todayOpen={todayOpen}
          todayHigh={todayHigh}
          todayLow={todayLow}
          t={t}
        />
      )}
    </>
  );
}

// ── Historical Chart ──────────────────────────────────────────────────────────

interface HistChartProps { data: HistoryPoint[]; color: string; gradientId: string; period: Period; t: Translations; }

function HistoricalChart({ data, color, gradientId, period, t }: HistChartProps) {
  if (!data.length) return null;
  const closes = data.map(d => d.close);
  const minC = Math.min(...closes), maxC = Math.max(...closes);
  const pad = (maxC - minC) * 0.05;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="card" style={{ padding: '10px 14px', border: '1px solid #2a3f5f', minWidth: '160px' }}>
        <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>{formatDate(d.date, period)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
          <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>{t.open}</span><div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>${d.open?.toFixed(2)}</div></div>
          <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>{t.close}</span><div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>${d.close?.toFixed(2)}</div></div>
          <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>{t.high}</span><div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 500 }}>${d.high?.toFixed(2)}</div></div>
          <div><span className="text-muted" style={{ fontSize: '0.7rem' }}>{t.low}</span><div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>${d.low?.toFixed(2)}</div></div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" vertical={false} />
        <XAxis dataKey="date" tickFormatter={d => formatDate(d, period)} tick={{ fill: '#6e7d92', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[minC - pad, maxC + pad]} tick={{ fill: '#6e7d92', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(0)}`} width={55} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4, fill: color, stroke: '#0a0e1a', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props { symbol: string; isUp: boolean; currentPrice: number; }

export default function StockChart({ symbol, isUp, currentPrice }: Props) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('1mo');
  const [histData, setHistData] = useState<HistoryPoint[]>([]);
  const [intradayData, setIntradayData] = useState<IntradayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    if (period === '1d') {
      fetchIntraday(symbol)
        .then(d => { setIntradayData(d); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    } else {
      fetchHistory(symbol, period)
        .then(d => { setHistData(d.filter(p => p.close)); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    }
  }, [symbol, period]);

  const color = isUp ? '#22c55e' : '#ef4444';
  const gradientId = `grad-hist-${symbol}-${isUp ? 'up' : 'dn'}`;

  return (
    <div>
      {/* Period selector */}
      <div className="flex gap-1 mb-4">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding: '5px 11px', borderRadius: '2px', border: '1px solid #2d2b20', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 800, transition: 'all 0.15s',
              background: period === p.value ? '#f7b500' : 'transparent',
              color: period === p.value ? '#050505' : '#8b8b7a',
            }}
            onMouseEnter={e => { if (period !== p.value) e.currentTarget.style.color = '#f7b500'; }}
            onMouseLeave={e => { if (period !== p.value) e.currentTarget.style.color = '#8b8b7a'; }}
          >{p.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #2d2b20', borderTopColor: '#f7b500', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e7d92', flexDirection: 'column', gap: '8px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: '0.85rem' }}>{period === '1d' ? t.intradayFailed : t.chartFailed}</span>
        </div>
      ) : period === '1d' && intradayData ? (
        <IntradayChart data={intradayData} isUp={isUp} currentPrice={currentPrice} t={t} />
      ) : period !== '1d' ? (
        <HistoricalChart data={histData} color={color} gradientId={gradientId} period={period} t={t} />
      ) : null}
    </div>
  );
}
