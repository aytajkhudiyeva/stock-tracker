import { useState, useEffect } from 'react';
import { fetchAnalysis } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { TechnicalAnalysis } from '../types';
import type { Translations } from '../i18n/translations';

interface Props { symbol: string; price: number; }

// ── color maps ────────────────────────────────────────────────────────────────

const SIG_COLOR = {
  buy:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  neutral: { color: '#5b6b80', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
  sell:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
} as const;

const SUMMARY_COLOR = {
  'Strong Buy':  { color: '#16a34a', bg: 'rgba(22,163,74,0.15)',   border: 'rgba(22,163,74,0.35)'   },
  'Buy':         { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.28)'   },
  'Neutral':     { color: '#5b6b80', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)'  },
  'Sell':        { color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.28)'   },
  'Strong Sell': { color: '#ef4444', bg: 'rgba(220,38,38,0.15)',   border: 'rgba(220,38,38,0.35)'   },
} as const;

// ── translation helpers ───────────────────────────────────────────────────────

function summarySignal(signal: string, t: Translations): string {
  const map: Record<string, string> = {
    'Strong Buy': t.strongBuy, 'Buy': t.buy, 'Neutral': t.neutral,
    'Sell': t.sell, 'Strong Sell': t.strongSell,
  };
  return map[signal] ?? signal;
}

function trendText(trend: string, t: Translations): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    strong_uptrend:   { label: t.strongUptrend,   color: '#16a34a' },
    uptrend:          { label: t.uptrend,          color: '#22c55e' },
    neutral:          { label: t.neutral,          color: '#5b6b80' },
    downtrend:        { label: t.downtrend,        color: '#f87171' },
    strong_downtrend: { label: t.strongDowntrend,  color: '#ef4444' },
  };
  return map[trend] ?? { label: trend, color: '#5b6b80' };
}

function translateSignalName(name: string, t: Translations): string {
  const map: Record<string, string> = {
    'RSI (14)':         t.sigRSI,
    'MACD (12,26,9)':   t.sigMACD,
    'Bollinger Bands':  t.sigBB,
    'Price vs SMA 50':  t.sigPriceSMA50,
    'Price vs SMA 200': t.sigPriceSMA200,
    'SMA 50 / 200':     t.sigSMA,
  };
  return map[name] ?? name;
}

function translateSignalValue(value: string, t: Translations): string {
  const exact: Record<string, string> = {
    'Bullish Crossover': t.bullishCrossover,
    'Bearish Crossover': t.bearishCrossover,
    'Near Lower Band':   t.nearLowerBand,
    'Near Upper Band':   t.nearUpperBand,
    'Golden Cross':      t.goldenCross,
    'Death Cross':       t.deathCross,
    'Bullish Alignment': t.bullishAlignment,
    'Bearish Alignment': t.bearishAlignment,
  };
  if (exact[value]) return exact[value];
  if (value.includes('— Oversold'))   return value.replace('— Oversold',   `— ${t.oversold}`);
  if (value.includes('— Overbought')) return value.replace('— Overbought', `— ${t.overbought}`);
  if (value.startsWith('Histogram ')) return `${t.histogram} ${value.slice(10)}`;
  if (value.startsWith('Above $'))    return `${t.aboveMA} $${value.slice(7)}`;
  if (value.startsWith('Below $'))    return `${t.belowMA} $${value.slice(7)}`;
  return value;
}

// ── small reusable pieces ─────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', color: '##8b99ad', marginBottom: '10px' }}>
      {children}
    </div>
  );
}

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0d1526', border: '1px solid #1a2d47', borderRadius: '10px', padding: '14px 16px' }}>
      {children}
    </div>
  );
}

function RangeBar({ pct, leftColor, rightColor, leftThreshold = 30, rightThreshold = 70 }: {
  pct: number; leftColor: string; rightColor: string; leftThreshold?: number; rightThreshold?: number;
}) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const markerColor = pct <= leftThreshold ? leftColor : pct >= rightThreshold ? rightColor : '#0092bc';
  return (
    <div style={{ position: 'relative', height: '6px', background: '#1a2540', borderRadius: '3px' }}>
      <div style={{ position: 'absolute', left: 0, width: `${leftThreshold}%`, height: '100%', background: `${leftColor}30`, borderRadius: '3px 0 0 3px' }} />
      <div style={{ position: 'absolute', left: `${rightThreshold}%`, width: `${100 - rightThreshold}%`, height: '100%', background: `${rightColor}30`, borderRadius: '0 3px 3px 0' }} />
      <div style={{
        position: 'absolute', left: `${clamped}%`, top: '-4px',
        transform: 'translateX(-50%)', width: '4px', height: '14px',
        background: markerColor, borderRadius: '2px',
        boxShadow: `0 0 8px ${markerColor}88`,
      }} />
    </div>
  );
}

function fmt(n: number | null | undefined, d = 2) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ── indicator cards ───────────────────────────────────────────────────────────

function RSICard({ rsi }: { rsi: TechnicalAnalysis['rsi'] }) {
  const { t } = useLanguage();
  const v = rsi?.value;
  const color = v == null ? '#6e7d92' : v < 30 ? '#22c55e' : v > 70 ? '#ef4444' : '#5b6b80';
  const label = v == null ? '' : v < 30 ? t.oversold : v > 70 ? t.overbought : t.neutral;
  return (
    <MiniCard>
      <SectionTitle>{t.sigRSI}</SectionTitle>
      {v == null ? (
        <div style={{ color: '#6e7d92', fontSize: '0.82rem' }}>{t.insufficientData}</div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-1px' }}>{v.toFixed(1)}</span>
            <span style={{ fontSize: '0.78rem', color: '#6e7d92' }}>{label}</span>
          </div>
          <RangeBar pct={v} leftColor="#22c55e" rightColor="#ef4444" leftThreshold={30} rightThreshold={70} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#374151', marginTop: '4px' }}>
            <span>0</span>
            <span style={{ color: '#22c55e88' }}>30</span>
            <span style={{ color: '#5b6b8066' }}>70</span>
            <span>100</span>
          </div>
        </>
      )}
    </MiniCard>
  );
}

function MACDCard({ macd }: { macd: TechnicalAnalysis['macd'] }) {
  const { t } = useLanguage();
  return (
    <MiniCard>
      <SectionTitle>{t.sigMACD}</SectionTitle>
      {!macd ? (
        <div style={{ color: '#6e7d92', fontSize: '0.82rem' }}>{t.insufficientData}</div>
      ) : (
        <>
          {macd.crossover && (
            <div style={{
              marginBottom: '10px', padding: '5px 9px', borderRadius: '5px',
              background: macd.crossover === 'bullish' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: macd.crossover === 'bullish' ? '#22c55e' : '#ef4444',
              fontSize: '0.75rem', fontWeight: 600,
            }}>
              ⚡ {macd.crossover === 'bullish' ? t.bullishCrossover : t.bearishCrossover}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {([
              { label: t.macdLine,   value: macd.macd,      color: macd.trend === 'bullish' ? '#22c55e' : '#ef4444' },
              { label: t.signalLine, value: macd.signal,    color: '#5b6b80' },
              { label: t.histogram,  value: macd.histogram, color: macd.histogram >= 0 ? '#22c55e' : '#ef4444' },
            ] as const).map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6e7d92' }}>{row.label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: row.color, fontVariantNumeric: 'tabular-nums' }}>
                  {row.value >= 0 ? '+' : ''}{fmt(row.value, 3)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </MiniCard>
  );
}

function BBCard({ bb }: { bb: TechnicalAnalysis['bollingerBands'] }) {
  const { t } = useLanguage();
  if (!bb) return (
    <MiniCard>
      <SectionTitle>{t.sigBB}</SectionTitle>
      <div style={{ color: '#6e7d92', fontSize: '0.82rem' }}>{t.insufficientData}</div>
    </MiniCard>
  );
  const pct = Math.min(Math.max(bb.percentB * 100, 0), 100);
  const posLabel = bb.signal === 'near_lower' ? t.nearLowerBand : bb.signal === 'near_upper' ? t.nearUpperBand : t.midRange;
  const posColor = bb.signal === 'near_lower' ? '#22c55e' : bb.signal === 'near_upper' ? '#ef4444' : '#0092bc';
  return (
    <MiniCard>
      <SectionTitle>{t.sigBB}</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: posColor }}>{pct.toFixed(0)}%B</span>
        <span style={{ fontSize: '0.78rem', color: '#6e7d92' }}>{posLabel}</span>
      </div>
      <RangeBar pct={pct} leftColor="#22c55e" rightColor="#ef4444" leftThreshold={20} rightThreshold={80} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginTop: '10px' }}>
        {[
          { label: t.lowerBand,  value: bb.lower,  color: '#22c55e' },
          { label: t.middleBand, value: bb.middle, color: '#5b6b80' },
          { label: t.upperBand,  value: bb.upper,  color: '#ef4444' },
        ].map(r => (
          <div key={r.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '##8b99ad', marginBottom: '2px' }}>{r.label}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: r.color }}>${fmt(r.value)}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.68rem', color: '##8b99ad' }}>{t.widthLabel}: {(bb.bandwidth * 100).toFixed(1)}%</span>
      </div>
    </MiniCard>
  );
}

function MACard({ ma }: { ma: TechnicalAnalysis['movingAverages'] }) {
  const { t } = useLanguage();
  return (
    <MiniCard>
      <SectionTitle>{t.movingAverages}</SectionTitle>
      {ma.cross && (
        <div style={{
          marginBottom: '10px', padding: '5px 9px', borderRadius: '5px',
          background: ma.cross === 'golden' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
          color: ma.cross === 'golden' ? '#eab308' : '#ef4444',
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          ✦ {ma.cross === 'golden' ? t.goldenCrossAlert : t.deathCrossAlert}
        </div>
      )}
      {ma.sma50 == null && ma.sma200 == null ? (
        <div style={{ color: '#6e7d92', fontSize: '0.82rem' }}>{t.insufficientData}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ma.sma50 != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#6e7d92' }}>SMA 50</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>${fmt(ma.sma50)}</span>
                <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 700,
                  background: ma.priceVsSma50 === 'above' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: ma.priceVsSma50 === 'above' ? '#22c55e' : '#ef4444' }}>
                  {ma.priceVsSma50 === 'above' ? `▲ ${t.aboveMA}` : `▼ ${t.belowMA}`}
                </span>
              </div>
            </div>
          )}
          {ma.sma200 != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#6e7d92' }}>SMA 200</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>${fmt(ma.sma200)}</span>
                <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 700,
                  background: ma.priceVsSma200 === 'above' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: ma.priceVsSma200 === 'above' ? '#22c55e' : '#ef4444' }}>
                  {ma.priceVsSma200 === 'above' ? `▲ ${t.aboveMA}` : `▼ ${t.belowMA}`}
                </span>
              </div>
            </div>
          )}
          {ma.sma50 != null && ma.sma200 != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid #1e2d47' }}>
              <span style={{ fontSize: '0.78rem', color: '#6e7d92' }}>{t.alignmentLabel}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ma.sma50VsSma200 === 'above' ? '#22c55e' : '#ef4444' }}>
                {ma.sma50VsSma200 === 'above' ? t.bullish : t.bearish}
              </span>
            </div>
          )}
        </div>
      )}
    </MiniCard>
  );
}

function SRCard({ sr, price }: { sr: TechnicalAnalysis['supportResistance']; price: number }) {
  const { t } = useLanguage();
  const empty = sr.supports.length === 0 && sr.resistances.length === 0;
  return (
    <MiniCard>
      <SectionTitle>{t.supportResistance}</SectionTitle>
      {empty ? (
        <div style={{ color: '#6e7d92', fontSize: '0.82rem' }}>{t.noSwingPoints}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {[...sr.resistances].reverse().map((r, i) => (
            <div key={`r${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '5px', background: 'rgba(239,68,68,0.06)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444', opacity: 0.5, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.85rem', color: '#1a2433', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${r.toFixed(2)}</span>
              <span style={{ fontSize: '0.72rem', color: '#ef4444', minWidth: '68px' }}>{t.resistance}</span>
              <span style={{ fontSize: '0.72rem', color: '#6e7d92', minWidth: '48px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                +{((r / price - 1) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '5px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0092bc', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.88rem', color: '#0092bc', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${price.toFixed(2)}</span>
            <span style={{ fontSize: '0.72rem', color: '#0092bc' }}>{t.currentPrice}</span>
          </div>
          {sr.supports.map((s, i) => (
            <div key={`s${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '5px', background: 'rgba(34,197,94,0.06)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#22c55e', opacity: 0.5, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.85rem', color: '#1a2433', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${s.toFixed(2)}</span>
              <span style={{ fontSize: '0.72rem', color: '#22c55e', minWidth: '68px' }}>{t.support}</span>
              <span style={{ fontSize: '0.72rem', color: '#6e7d92', minWidth: '48px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {((s / price - 1) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </MiniCard>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AnalysisPanel({ symbol, price }: Props) {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    fetchAnalysis(symbol)
      .then(data => { setAnalysis(data); setLoading(false); })
      .catch(e => { setError(e.message || 'Failed'); setLoading(false); });
  }, [symbol]);

  if (loading) return (
    <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', color: '#6e7d92' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #1e2d47', borderTopColor: '#0092bc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '0.82rem' }}>{t.computingIndicators}</span>
    </div>
  );

  if (error || !analysis) return (
    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e7d92', fontSize: '0.85rem' }}>
      {t.analysisFailed}
    </div>
  );

  const sc = SUMMARY_COLOR[analysis.summary.signal];
  const trend = trendText(analysis.trend, t);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Summary Banner */}
      <div style={{
        background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '12px',
        padding: '18px 22px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', color: '#6e7d92', marginBottom: '4px' }}>
            {t.technicalSummary}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: sc.color, letterSpacing: '-0.5px' }}>
            {summarySignal(analysis.summary.signal, t)}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#6e7d92', marginTop: '3px' }}>
            {t.trendLabel}: <span style={{ color: trend.color, fontWeight: 700 }}>{trend.label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {([
            { label: t.buyCount,     count: analysis.summary.buyCount,     color: '#22c55e' },
            { label: t.neutralCount, count: analysis.summary.neutralCount, color: '#6e7d92' },
            { label: t.sellCount,    count: analysis.summary.sellCount,    color: '#ef4444' },
          ] as const).map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: item.color, letterSpacing: '-1px' }}>{item.count}</div>
              <div style={{ fontSize: '0.63rem', color: '##8b99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Table */}
      <div>
        <SectionTitle>{t.indicatorSignals}</SectionTitle>
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #1a2d47' }}>
          {analysis.signals.map((sig, i) => {
            const c = SIG_COLOR[sig.signal];
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px',
                background: i % 2 === 0 ? '#0d1526' : 'transparent',
                borderBottom: i < analysis.signals.length - 1 ? '1px solid #111d35' : 'none',
              }}>
                <span style={{ flex: '0 0 155px', fontSize: '0.8rem', color: '#5b6b80' }}>
                  {translateSignalName(sig.name, t)}
                </span>
                <span style={{
                  display: 'inline-block', padding: '2px 9px', borderRadius: '4px',
                  background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {sig.signal === 'buy' ? t.pillBuy : sig.signal === 'sell' ? t.pillSell : t.pillNeutral}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', flex: 1 }}>
                  {translateSignalValue(sig.value, t)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicator Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <RSICard rsi={analysis.rsi} />
        <MACDCard macd={analysis.macd} />
        <BBCard bb={analysis.bollingerBands} />
        <MACard ma={analysis.movingAverages} />
      </div>

      {/* Support / Resistance */}
      <SRCard sr={analysis.supportResistance} price={price} />
    </div>
  );
}
