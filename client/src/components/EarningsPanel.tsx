import { useState, useEffect } from 'react';
import { fetchEarnings } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { EarningsData } from '../types';

interface Props { symbol: string; }

function fmtDate(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang === 'az' ? 'az-AZ' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return iso.split('T')[0]; }
}

function fmtRev(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

function formatQuarter(q: string) {
  // Normalize "1Q2026" → "Q1 FY2026", "Apr 2026" → "Apr 2026"
  const m = q.match(/^(\d)Q(\d{4})$/);
  if (m) return `Q${m[1]} FY${m[2]}`;
  return q;
}

export default function EarningsPanel({ symbol }: Props) {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);
    fetchEarnings(symbol)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(t.earningsFailed); setLoading(false); });
  }, [symbol]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', color: '#6e7d92' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid #1e2d47', borderTopColor: '#0092bc', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '12px' }} />
      {t.earningsLoading}
    </div>
  );

  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '48px', color: '#6e7d92' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
      <div style={{ fontSize: '0.85rem' }}>{error || t.earningsUnavailable}</div>
    </div>
  );

  const days = data.daysUntilEarnings;
  let daysLabel = '';
  if (days === 0) daysLabel = t.today;
  else if (days === 1) daysLabel = t.tomorrow;
  else if (days != null && days > 0) daysLabel = `${days} ${t.daysUntil}`;

  const urgentColor = days != null && days <= 7 ? '#f59e0b' : days != null && days <= 1 ? '#ef4444' : '#0092bc';
  const beatCount = data.pastEarnings.filter(row => row.actual != null && row.estimate != null && row.actual >= row.estimate).length;
  const missCount = data.pastEarnings.filter(row => row.actual != null && row.estimate != null && row.actual < row.estimate).length;
  const volFlag = days != null && days >= 0 && days <= 7 ? 'Elevated event window' : days != null && days <= 14 ? 'Approaching event window' : 'Normal calendar window';

  return (
    <div>
      <h3 style={{ color: '#5b6b80', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px', marginTop: 0 }}>
        {t.earningsCalendar}
      </h3>

      {/* Next Earnings Card */}
      {data.nextEarningsDate && (
        <div style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#5b6b80', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                {t.nextEarnings}
              </div>
              <div style={{ color: '#1a2433', fontSize: '1.05rem', fontWeight: 700 }}>
                {fmtDate(data.nextEarningsDate, lang)}
              </div>
            </div>
            {daysLabel && (
              <div style={{
                background: days != null && days <= 1 ? 'rgba(239,68,68,0.15)' : days != null && days <= 7 ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                border: `1px solid ${days != null && days <= 1 ? 'rgba(239,68,68,0.3)' : days != null && days <= 7 ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                borderRadius: '8px', padding: '6px 12px',
                color: urgentColor, fontSize: '0.82rem', fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                📅 {daysLabel}
              </div>
            )}
          </div>

          {(data.epsEstimate != null || data.revenueEstimate != null) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
              {data.epsEstimate != null && (
                <div style={{ background: '#0a0e1a', borderRadius: '8px', padding: '10px 12px', border: '1px solid #1e2d47' }}>
                  <div style={{ color: '#6e7d92', fontSize: '0.68rem', marginBottom: '4px' }}>{t.epsEstimate}</div>
                  <div style={{ color: '#1a2433', fontWeight: 700, fontSize: '1rem' }}>${data.epsEstimate.toFixed(2)}</div>
                </div>
              )}
              {data.revenueEstimate != null && (
                <div style={{ background: '#0a0e1a', borderRadius: '8px', padding: '10px 12px', border: '1px solid #1e2d47' }}>
                  <div style={{ color: '#6e7d92', fontSize: '0.68rem', marginBottom: '4px' }}>{t.revEstimate}</div>
                  <div style={{ color: '#1a2433', fontWeight: 700, fontSize: '1rem' }}>{fmtRev(data.revenueEstimate)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20', marginBottom: 16 }}>
        {[
          { label: 'EPS / Revenue Setup', value: `${data.epsEstimate != null ? `$${data.epsEstimate.toFixed(2)} EPS` : 'EPS -'} · ${data.revenueEstimate != null ? fmtRev(data.revenueEstimate) : 'Revenue -'}` },
          { label: 'Last 4 Result Mix', value: `${beatCount} beat · ${missCount} miss` },
          { label: 'Beat Scenario', value: 'Watch target/estimate revisions after report' },
          { label: 'Miss Scenario', value: 'Watch support zones and estimate cuts' },
          { label: 'Volatility Flag', value: volFlag },
        ].map(item => (
          <div key={item.label} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ color: '#b4b49f', fontSize: '0.8rem', marginTop: 5 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Past Earnings Table */}
      {data.pastEarnings && data.pastEarnings.length > 0 && (
        <div>
          <div style={{ color: '#5b6b80', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
            {t.pastEarningsTitle}
          </div>

          <div style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '10px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.85fr 0.9fr 1fr 1fr 0.85fr', gap: 0, padding: '8px 14px', background: '#0a0e1a', borderBottom: '1px solid #1e2d47' }}>
              {['Quarter', t.epsActualLabel, t.epsEstimateLabel, t.revenueActualLabel, t.revenueEstimateLabel, t.resultLabel].map(h => (
                <div key={h} style={{ color: '#6e7d92', fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>
              ))}
            </div>

            {data.pastEarnings.map((row, i) => {
              const beat = row.actual != null && row.estimate != null
                ? row.actual >= row.estimate
                : null;
              const surprise = row.surprise != null
                ? row.surprise
                : (row.actual != null && row.estimate != null && row.estimate !== 0)
                  ? ((row.actual - row.estimate) / Math.abs(row.estimate)) * 100
                  : null;

              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1.1fr 0.85fr 0.9fr 1fr 1fr 0.85fr',
                  padding: '10px 14px', borderBottom: i < data.pastEarnings.length - 1 ? '1px solid #1e2d47' : 'none',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>{formatQuarter(row.quarter)}</div>
                    {row.dateReported && (
                      <div style={{ color: '#6e7d92', fontSize: '0.64rem', marginTop: '2px' }}>
                        {t.reportedOn} {row.dateReported}
                      </div>
                    )}
                  </div>

                  <div style={{ color: beat === true ? '#22c55e' : beat === false ? '#ef4444' : '#e2e8f0', fontWeight: 600, fontSize: '0.82rem' }}>
                    {row.actual != null ? `$${row.actual.toFixed(2)}` : '—'}
                  </div>

                  <div style={{ color: '#5b6b80', fontSize: '0.82rem' }}>
                    {row.estimate != null ? `$${row.estimate.toFixed(2)}` : '—'}
                  </div>

                  <div style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>
                    {row.revenueActual != null ? fmtRev(row.revenueActual) : '—'}
                  </div>

                  <div style={{ color: '#5b6b80', fontSize: '0.82rem' }}>
                    {row.revenueEstimate != null ? fmtRev(row.revenueEstimate) : '—'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {beat !== null && (
                      <span style={{
                        background: beat ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: beat ? '#22c55e' : '#ef4444',
                        border: `1px solid ${beat ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        borderRadius: '4px', padding: '1px 6px', fontSize: '0.66rem', fontWeight: 700,
                      }}>
                        {beat ? t.beat : t.miss}
                      </span>
                    )}
                    {surprise != null && (
                      <span style={{ color: surprise > 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: 600 }}>
                        {surprise > 0 ? '+' : ''}{surprise.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
