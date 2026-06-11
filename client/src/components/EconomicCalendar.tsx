import { useState, useEffect } from 'react';
import { fetchEconomicCalendar, sendWhatsappTest, subscribeEconomicWhatsapp } from '../services/api';
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

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function startOfWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const dow = d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1;
  d.setUTCDate(d.getUTCDate() - dow);
  return toDateStr(d);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return toDateStr(d);
}

function fmtDate(iso: string, lang: string) {
  try {
    const d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString(lang === 'az' ? 'az-AZ' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
  } catch { return iso; }
}

function groupByDay(events: EconomicEvent[]) {
  const groups: Record<string, EconomicEvent[]> = {};
  for (const ev of events) {
    if (!groups[ev.date]) groups[ev.date] = [];
    groups[ev.date].push(ev);
  }
  return groups;
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
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchEconomicCalendar(21, 60)
      .then(d => { setEvents(d.events); setLoading(false); })
      .catch(() => { setError(t.econFailed); setLoading(false); });
  }, []);

  const normalisedWhatsappPhone = whatsappPhone.trim().replace(/[\s()-]/g, '');

  const validateWhatsappPhone = () => /^\+?[1-9]\d{7,14}$/.test(normalisedWhatsappPhone);

  const handleWhatsappSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateWhatsappPhone()) {
      setWhatsappStatus('error');
      setWhatsappMessage(t.econWhatsappInvalid);
      return;
    }
    setWhatsappStatus('loading');
    setWhatsappMessage('');
    try {
      const result = await subscribeEconomicWhatsapp(whatsappPhone);
      setWhatsappPhone(result.phone);
      setWhatsappStatus('success');
      setWhatsappMessage(result.configured ? t.econWhatsappSuccess : t.econWhatsappDevMode);
    } catch {
      setWhatsappStatus('error');
      setWhatsappMessage(t.econWhatsappFailed);
    }
  };

  const handleWhatsappTest = async () => {
    if (!validateWhatsappPhone()) {
      setWhatsappStatus('error');
      setWhatsappMessage(t.econWhatsappInvalid);
      return;
    }
    setWhatsappStatus('loading');
    setWhatsappMessage('');
    try {
      const result = await sendWhatsappTest(whatsappPhone);
      setWhatsappStatus(result.configured ? 'success' : 'error');
      setWhatsappMessage(result.configured ? t.econWhatsappTestSent : t.econWhatsappTestNotConfigured);
    } catch {
      setWhatsappStatus('error');
      setWhatsappMessage(t.econWhatsappFailed);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', color: '#6e7d92' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid #1e2d47', borderTopColor: '#0092bc', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '12px' }} />
      {t.econLoading}
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '64px', color: '#6e7d92' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌍</div>
      <div>{error}</div>
    </div>
  );

  const today = todayStr();
  const filtered = filter === 'all' ? events
    : filter === 'high' ? events.filter(e => e.impact === 'high')
    : events.filter(e => e.impact === 'medium' || e.impact === 'high');

  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEvents = filtered.filter(e => e.date >= weekStart && e.date <= weekEnd);
  const eventsByDay = groupByDay(weekEvents);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#1a2433', fontSize: '1.2rem', fontWeight: 700 }}>
          🌍 {t.economicCalendar}
        </h2>
        <div className="econ-toolbar">
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-secondary" onClick={() => setWeekStart(addDays(weekStart, -7))} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
              ← {t.previousWeek}
            </button>
            <button className="btn-secondary" onClick={() => setWeekStart(startOfWeek())} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
              {t.currentWeek}
            </button>
            <button className="btn-secondary" onClick={() => setWeekStart(addDays(weekStart, 7))} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
              {t.nextWeek} →
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'high', 'medium'] as ImpactFilter[]).map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`view-tab ${filter === f ? 'view-tab-active' : ''}`}
                style={{ padding: '5px 14px', fontSize: '0.75rem' }}
              >
                {f === 'all' ? t.econAllEvents : f === 'high' ? t.econHighOnly : t.econImpactMedium + '+'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleWhatsappSubscribe} className="econ-whatsapp-panel">
        <div>
          <div style={{ color: '#1a2433', fontSize: '0.86rem', fontWeight: 700 }}>{t.econWhatsappTitle}</div>
          {whatsappMessage && (
            <div style={{ color: whatsappStatus === 'success' ? '#22c55e' : '#ef4444', fontSize: '0.72rem', marginTop: '4px' }}>
              {whatsappMessage}
            </div>
          )}
        </div>
        <div className="econ-whatsapp-controls">
          <input
            className="input-field"
            value={whatsappPhone}
            onChange={e => { setWhatsappPhone(e.target.value); setWhatsappStatus('idle'); setWhatsappMessage(''); }}
            placeholder={t.econWhatsappPhonePlaceholder}
            inputMode="tel"
          />
          <button className="btn-secondary" type="button" disabled={whatsappStatus === 'loading'} onClick={handleWhatsappTest} style={{ whiteSpace: 'nowrap' }}>
            {whatsappStatus === 'loading' ? t.econWhatsappSaving : t.econWhatsappTest}
          </button>
          <button className="btn-primary" type="submit" disabled={whatsappStatus === 'loading'} style={{ whiteSpace: 'nowrap' }}>
            {whatsappStatus === 'loading' ? t.econWhatsappSaving : t.econWhatsappSubscribe}
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20', marginBottom: 18 }}>
        {[
          { event: 'CPI above forecast', map: 'Rate-sensitive growth risk flag: AI chips / EV volatility can rise; banks mixed.' },
          { event: 'Fed hawkish tone', map: 'Long-duration tech sentiment can cool; cash-flow defensives may hold steadier.' },
          { event: 'NFP hot print', map: 'Yields can reprice; mega-cap growth and small caps may see different sensitivity.' },
          { event: 'Retail sales weak', map: 'Consumer tech and discretionary demand flags become more visible.' },
        ].map(item => (
          <div key={item.event} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{item.event}</div>
            <div style={{ color: '#b4b49f', fontSize: '0.78rem', marginTop: 6, lineHeight: 1.4 }}>{item.map}</div>
          </div>
        ))}
      </div>

      <div className="econ-week-title">{weekLabel(weekStart, lang)}</div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['high', 'medium', 'low'] as const).map(imp => (
          <div key={imp} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: IMPACT_COLORS[imp].dot }} />
            <span style={{ fontSize: '0.72rem', color: '#6e7d92' }}>
              {imp === 'high' ? t.econImpactHigh : imp === 'medium' ? t.econImpactMedium : t.econImpactLow}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0092bc' }} />
          <span style={{ fontSize: '0.72rem', color: '#6e7d92' }}>{t.econReleased}</span>
        </div>
      </div>

      {weekEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6e7d92', fontSize: '0.88rem' }}>
          {t.econNoEvents}
        </div>
      )}

      {weekDays.map(day => {
        const dayEvents = eventsByDay[day] || [];
        return (
        <div key={day} style={{ marginBottom: '18px' }}>
          <div className="econ-day-header">
            <span>{fmtDate(day, lang)}</span>
            <span>{dayEvents.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {dayEvents.length === 0 && (
              <div className="econ-empty-day">{t.noEventsThisDay}</div>
            )}
            {dayEvents.map(ev => {
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
                  <div style={{ color: isToday ? '#0092bc' : '#6e7d92', fontSize: '0.72rem', fontWeight: isToday ? 700 : 400 }}>
                    {isToday
                      ? <span style={{ color: '#0092bc', fontWeight: 700 }}>{t.econToday} {ev.time} ET</span>
                      : <>{fmtDate(ev.date, lang)}<br /><span style={{ color: '##8b99ad' }}>{ev.time} ET</span></>
                    }
                  </div>

                  {/* Impact dot */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.dot }} />
                  </div>

                  {/* Event name + reference */}
                  <div>
                    <div style={{ color: '#1a2433', fontSize: '0.85rem', fontWeight: 600 }}>
                      {icon} {name}
                    </div>
                    {ev.referenceMonth && (
                      <div style={{ color: '##8b99ad', fontSize: '0.68rem', marginTop: '1px' }}>
                        {t.econRef} {ev.referenceMonth}
                      </div>
                    )}
                  </div>

                  {/* Previous */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '##8b99ad', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '2px' }}>{t.econPrevious}</div>
                    <div style={{ color: '#5b6b80', fontSize: '0.8rem', fontWeight: 500 }}>
                      {ev.previous != null ? `${ev.previous}${ev.unit !== 'K' ? ev.unit : ''}` : '—'}
                    </div>
                  </div>

                  {/* Forecast */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '##8b99ad', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '2px' }}>{t.econForecast}</div>
                    <div style={{ color: '#5b6b80', fontSize: '0.8rem', fontWeight: 500 }}>
                      {ev.forecast != null ? `${ev.forecast}${ev.unit !== 'K' ? ev.unit : ''}` : '—'}
                    </div>
                  </div>

                  {/* Actual / Status */}
                  <div style={{ textAlign: 'right' }}>
                    {ev.released && ev.actual != null ? (
                      <>
                        <div style={{ color: '##8b99ad', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '2px' }}>{t.econActual}</div>
                        <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>
                          {ev.actual}{ev.unit !== 'K' ? ev.unit : ''}
                        </div>
                      </>
                    ) : ev.released ? (
                      <span style={{
                        background: 'rgba(100,116,139,0.15)', border: '1px solid #1e2d47',
                        color: '#6e7d92', borderRadius: '4px', padding: '2px 7px', fontSize: '0.66rem',
                      }}>
                        {t.econReleased}
                      </span>
                    ) : (
                      <span style={{
                        background: isToday ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)',
                        border: `1px solid ${isToday ? 'rgba(59,130,246,0.25)' : '#1e2d47'}`,
                        color: isToday ? '#0092bc' : '#6e7d92',
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
      )})}

      <div style={{ color: '#dce3ed', fontSize: '0.68rem', textAlign: 'center', marginTop: '16px' }}>
        Data: BLS (CPI, NFP, Unemployment, PPI) · Dates are approximate (±1 week) · {t.econForecastNA}
      </div>
    </div>
  );
}
