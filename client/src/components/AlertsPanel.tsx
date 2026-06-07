import { useState, useEffect } from 'react';
import { fetchAlerts, createAlert, deleteAlert } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { Alert } from '../types';

interface Props { defaultSymbol?: string; }

export default function AlertsPanel({ defaultSymbol }: Props) {
  const { t, lang } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [symbol, setSymbol] = useState(defaultSymbol || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchAlerts().then(setAlerts).catch(() => {}); }, []);
  useEffect(() => { if (defaultSymbol) setSymbol(defaultSymbol); }, [defaultSymbol]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetPrice) return;
    setLoading(true); setError('');
    try {
      const alert = await createAlert({ symbol: symbol.toUpperCase(), targetPrice: parseFloat(targetPrice), condition, chatId: chatId || undefined });
      setAlerts(prev => [alert, ...prev]);
      setSuccess(t.alertCreated);
      setTargetPrice(''); setShowForm(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAlert(id).catch(() => {});
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);
  const locale = lang === 'az' ? 'az-AZ' : 'en-US';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
            {t.priceAlerts}
          </h3>
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            {activeAlerts.length} {t.activeSentViaTelegram}
          </div>
        </div>
        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? t.cancel : t.newAlert}
        </button>
      </div>

      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#22c55e', fontSize: '0.82rem' }}>
          {success}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>{t.telegramSetup}</div>
          <div>{t.telegramStep1.replace('@BotFather', '')}
            <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>@BotFather</a>
          </div>
          <div>{t.telegramStep2}</div>
          <div>{t.telegramStep3.replace('@userinfobot', '')}
            <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>@userinfobot</a>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>{t.symbolLabel}</label>
              <input className="input-field" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="NVDA" required />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>{t.targetPrice}</label>
              <input className="input-field" type="number" step="0.01" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="200.00" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>{t.condition}</label>
              <select className="input-field" value={condition} onChange={e => setCondition(e.target.value as 'above' | 'below')} style={{ appearance: 'none' }}>
                <option value="above">{t.priceGoesAbove}</option>
                <option value="below">{t.priceGoesBelow}</option>
              </select>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>{t.telegramChatId}</label>
              <input className="input-field" value={chatId} onChange={e => setChatId(e.target.value)} placeholder={t.optional} />
            </div>
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '10px' }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? t.creating : t.createAlert}
          </button>
        </form>
      )}

      {activeAlerts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t.active} ({activeAlerts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeAlerts.map(alert => <AlertRow key={alert.id} alert={alert} onDelete={handleDelete} locale={locale} />)}
          </div>
        </div>
      )}

      {triggeredAlerts.length > 0 && (
        <div>
          <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t.triggered} ({triggeredAlerts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {triggeredAlerts.map(alert => <AlertRow key={alert.id} alert={alert} onDelete={handleDelete} locale={locale} />)}
          </div>
        </div>
      )}

      {alerts.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{ fontSize: '0.85rem' }}>{t.noAlertsYet}</div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>{t.noAlertsHint}</div>
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert, onDelete, locale }: { alert: Alert; onDelete: (id: string) => void; locale: string }) {
  const { t } = useLanguage();
  return (
    <div style={{
      background: alert.triggered ? 'rgba(34,197,94,0.06)' : '#0f1629',
      border: `1px solid ${alert.triggered ? 'rgba(34,197,94,0.2)' : '#1e2d47'}`,
      borderRadius: '8px', padding: '10px 12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.88rem' }}>{alert.symbol}</span>
          <span style={{
            background: alert.condition === 'above' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: alert.condition === 'above' ? '#22c55e' : '#ef4444',
            border: `1px solid ${alert.condition === 'above' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            fontSize: '0.68rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
          }}>
            {alert.condition === 'above' ? t.aboveLabel : t.belowLabel} ${alert.targetPrice.toFixed(2)}
          </span>
          {alert.triggered && (
            <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '0.68rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.25)' }}>
              {t.triggeredLabel}
            </span>
          )}
        </div>
        {alert.triggeredPrice && (
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            {t.firedAt} ${alert.triggeredPrice.toFixed(2)} · {new Date(alert.triggeredAt!).toLocaleString(locale)}
          </div>
        )}
        {!alert.triggered && (
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            {t.setOn} {new Date(alert.createdAt).toLocaleDateString(locale)}
          </div>
        )}
      </div>
      <button className="btn-danger" onClick={() => onDelete(alert.id)} style={{ padding: '4px 8px', fontSize: '0.72rem' }}>{t.remove}</button>
    </div>
  );
}
