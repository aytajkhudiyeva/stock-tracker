import { useState, useEffect } from 'react';
import { fetchAlerts, createAlert, deleteAlert } from '../services/api';
import type { Alert } from '../types';

interface Props {
  defaultSymbol?: string;
}

export default function AlertsPanel({ defaultSymbol }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [symbol, setSymbol] = useState(defaultSymbol || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAlerts().then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    if (defaultSymbol) setSymbol(defaultSymbol);
  }, [defaultSymbol]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetPrice) return;
    setLoading(true);
    setError('');
    try {
      const alert = await createAlert({ symbol: symbol.toUpperCase(), targetPrice: parseFloat(targetPrice), condition, chatId: chatId || undefined });
      setAlerts(prev => [alert, ...prev]);
      setSuccess('Alert created! You\'ll be notified via Telegram when triggered.');
      setTargetPrice('');
      setShowForm(false);
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
            Price Alerts
          </h3>
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            {activeAlerts.length} active · sent via Telegram
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Alert'}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#22c55e', fontSize: '0.82rem' }}>
          {success}
        </div>
      )}

      {/* Telegram setup note */}
      {showForm && (
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>📱 Telegram Setup</div>
          <div>1. Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>@BotFather</a></div>
          <div>2. Add <code style={{ background: '#0a0e1a', padding: '1px 5px', borderRadius: '4px' }}>TELEGRAM_BOT_TOKEN</code> to <code style={{ background: '#0a0e1a', padding: '1px 5px', borderRadius: '4px' }}>server/.env</code></div>
          <div>3. Get your Chat ID from <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>@userinfobot</a></div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#0f1629', border: '1px solid #1e2d47', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Symbol</label>
              <input className="input-field" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="NVDA" required />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Target Price ($)</label>
              <input className="input-field" type="number" step="0.01" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="200.00" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Condition</label>
              <select
                className="input-field"
                value={condition}
                onChange={e => setCondition(e.target.value as 'above' | 'below')}
                style={{ appearance: 'none' }}
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Telegram Chat ID</label>
              <input className="input-field" value={chatId} onChange={e => setChatId(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '10px' }}>{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Alert'}
          </button>
        </form>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active ({activeAlerts.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeAlerts.map(alert => (
              <AlertRow key={alert.id} alert={alert} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Triggered alerts */}
      {triggeredAlerts.length > 0 && (
        <div>
          <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Triggered ({triggeredAlerts.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {triggeredAlerts.map(alert => (
              <AlertRow key={alert.id} alert={alert} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div style={{ fontSize: '0.85rem' }}>No alerts yet</div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Create an alert to get notified via Telegram</div>
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert, onDelete }: { alert: Alert; onDelete: (id: string) => void }) {
  return (
    <div style={{
      background: alert.triggered ? 'rgba(34,197,94,0.06)' : '#0f1629',
      border: `1px solid ${alert.triggered ? 'rgba(34,197,94,0.2)' : '#1e2d47'}`,
      borderRadius: '8px',
      padding: '10px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
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
            {alert.condition === 'above' ? '▲ Above' : '▼ Below'} ${alert.targetPrice.toFixed(2)}
          </span>
          {alert.triggered && (
            <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '0.68rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.25)' }}>
              ✓ Triggered
            </span>
          )}
        </div>
        {alert.triggeredPrice && (
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            Fired at ${alert.triggeredPrice.toFixed(2)} · {new Date(alert.triggeredAt!).toLocaleString()}
          </div>
        )}
        {!alert.triggered && (
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            Set {new Date(alert.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
      <button className="btn-danger" onClick={() => onDelete(alert.id)} style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Remove</button>
    </div>
  );
}
