import { useState, useEffect } from 'react';
import { fetchEconomicCalendar } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { EconomicEvent } from '../types';

type ImpactFilter = 'all' | 'high' | 'medium';

const IMPACT_COLORS = {
  high:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  text: '#ef4444', dot: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', dot: '#f59e0b' },
  low:    { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)', text: '#22c55e', dot: '#22c55e' },
};

const DATA_ICONS: Record<string, string> = {
  cpi: '📈', unemployment: '👥', nfp: '💼', ppi: '🏭',
  retail: '🛒', gdp: '🏦', fomc: '🏛️',
};

function todayStr() {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function fmtDate(iso: string, lang: string) {
  try {
    const d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString(lang === 'az' ? 'az-AZ' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
  } catch { return iso; }
}

function groupByWeek(events: EconomicEvent[]) {
  const groups: Record<string, EconomicEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.date + 'T12:00:00Z');
    // Monday of the week
    const dow = d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - dow);
    const key = monday.toISOString().split('T')[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function weekLabel(mondayStr: string, lang: string) {
  const d = new Date(mondayStr + 'T12:00:00Z');
  const sun = new Date(d);
  sun.setUTCDate(d.getUTCDate() + 6);
  const fmt = (dd: Date) => dd.toLocaleDateString(lang === 'az' ? 'az-AZ' : 'en-US',
    { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${fmt(d)} – ${fmt(sun)}`;
}

export default function EconomicCalendar() {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ImpactFilter>('all');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchEconomicCalendar(14, 60)
      .then(d => { setEvents(d.events); setLoading(false); })
      .catch(() => { setError(t.econFailed); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', color: '#64748b' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid #1e2d47', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '12px' }} />
      {t.econLoading}
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌍</div>
      <div>{error}</div>
    </div>
  );

  const today = todayStr();
  const filtered = filter === 'all' ? events
    : filter === 'high' ? events.filter(e => e.impact === 'high')
    : events.filter(e => e.impact === 'medium' || e.impact === 'high');

  const weeks = groupByWeek(filtered);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 700 }}>
          🌍 {t.economicCalendar}
        </h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'high', 'medium'] as ImpactFilter[]).map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
                border: filter === f ? '1px solid rgba(59,130,246,0.4)' : '1px solid #1e2d47',
                color: filter === f ? '#60a5fa' : '#64748b',
              }}
            >
              {f === 'all' ? t.econAllEvents : f === 'high' ? t.econHighOnly : t.econImpactMedium + '+'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['high', 'medium', 'low'] as const).map(imp => (
          <div key={imp} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: IMPACT_COLORS[imp].dot }} />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {imp === 'high' ? t.econImpactHigh : imp === 'medium' ? t.econImpactMedium : t.econImpactLow}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} />
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.econReleased}</span>
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', fontSize: '0.88rem' }}>
          {t.econNoEvents}
        </div>
      )}

      {weeks.map(([mondayKey, weekEvents]) => (
        <div key={mondayKey} style={{ marginBottom: '24px' }}>
          {/* Week header */}
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
            color: '#475569', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1e2d47',
          }}>
            {weekLabel(mondayKey, lang)}
          </div>

          {/* Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {weekEvents.map(ev => {
              const colors = IMPACT_COLORS[ev.impact];
              const isToday = ev.date === today;
              const isPast = ev.date < today;
              const icon = DATA_ICONS[ev.dataType] || '📊';
              const name = lang === 'az' ? ev.nameAz : ev.name;

              return (
                <div key={ev.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 20px 1fr 70px 70px 80px',
                  gap: '0 12px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isToday ? 'rgba(59,130,246,0.06)' : '#0f1629',
                  border: `1px solid ${isToday ? 'rgba(59,130,246,0.25)' : '#1e2d47'}`,
                  opacity: isPast && !ev.released ? 0.6 : 1,
                }}>

                  {/* Date */}
                  <div style={{ color: isToday ? '#60a5fa' : '#64748b', fontSize: '0.72rem', fontWeight: isToday ? 700 : 400 }}>
                    {isToday
                      ? <span style={{ color: '#60a5fa', fontWeight: 700 }}>{t.econToday} {ev.time} ET</span>
                      : <>{fmtDate(ev.date, lang)}<br /><span style={{ color: '#475569' }}>{ev.time} ET</span></>
                    }
                  </div>

                  {/* Impact dot */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.dot }} />
                  </div>

                  {/* Event name + reference */}
                  <div>
                    <div style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>
                      {icon} {name}
                    </div>
                    {ev.referenceMonth && (
                      <div style={{ color: '#475569', fontSize: '0.68rem', marginTop: '1px' }}>
                        {t.econRef} {ev.referenceMonth}
                      </div>
                    )}
                  </div>

                  {/* Previous */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#475569', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '2px' }}>{t.econPrevious}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                      {ev.previous != null ? `${ev.previous}${ev.unit !== 'K' ? ev.unit : ''}` : '—'}
                    </div>
                  </div>

                  {/* Forecast */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#475569', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '2px' }}>{t.econForecast}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                      {ev.forecast != null ? `${ev.forecast}${ev.unit !== 'K' ? ev.unit : ''}` : '—'}
                    </div>
                  </div>

                  {/* Actual / Status */}
                  <div style={{ textAlign: 'right' }}>
                    {ev.released && ev.actual != null ? (
                      <>
                        <div style={{ color: '#475569', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '2px' }}>{t.econActual}</div>
                        <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>
                          {ev.actual}{ev.unit !== 'K' ? ev.unit : ''}
                        </div>
                      </>
                    ) : ev.released ? (
                      <span style={{
                        background: 'rgba(100,116,139,0.15)', border: '1px solid #1e2d47',
                        color: '#64748b', borderRadius: '4px', padding: '2px 7px', fontSize: '0.66rem',
                      }}>
                        {t.econReleased}
                      </span>
                    ) : (
                      <span style={{
                        background: isToday ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)',
                        border: `1px solid ${isToday ? 'rgba(59,130,246,0.25)' : '#1e2d47'}`,
                        color: isToday ? '#60a5fa' : '#64748b',
                        borderRadius: '4px', padding: '2px 7px', fontSize: '0.66rem',
                      }}>
                        {isToday ? t.econToday : t.econUpcoming}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ color: '#334155', fontSize: '0.68rem', textAlign: 'center', marginTop: '16px' }}>
        Data: BLS (CPI, NFP, Unemployment, PPI) · Dates are approximate (±1 week) · {t.econForecastNA}
      </div>
    </div>
  );
}
