import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';

interface Entry {
  id: string;
  symbol: string;
  thesis: string;
  entry: string;
  target: string;
  stop: string;
  outcome: string;
  lesson: string;
  createdAt: string;
}

const KEY = 'stockaz-journal';

function load(): Entry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export default function TradingJournal() {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [entries, setEntries] = useState<Entry[]>(load);
  const [form, setForm] = useState({ symbol: '', thesis: '', entry: '', target: '', stop: '', outcome: '', lesson: '' });
  const save = (next: Entry[]) => { setEntries(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol.trim()) return;
    save([{ id: `${Date.now()}`, createdAt: new Date().toISOString(), ...form, symbol: form.symbol.toUpperCase() }, ...entries]);
    setForm({ symbol: '', thesis: '', entry: '', target: '', stop: '', outcome: '', lesson: '' });
  };
  return (
    <div className="card page-panel">
      <div className="section-kicker">{ui.tradingJournal}</div>
      <div style={{ color: '#8b8b7a', fontSize: '0.75rem', marginBottom: 10 }}>{ui.journalDisclaimer}</div>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
        {(['symbol', 'entry', 'target', 'stop'] as const).map(k => <input key={k} className="input-field" placeholder={k.toUpperCase()} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}
        <input className="input-field" style={{ gridColumn: 'span 2' }} placeholder={ui.whyContext} value={form.thesis} onChange={e => setForm({ ...form, thesis: e.target.value })} />
        <input className="input-field" placeholder={ui.outcome} value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} />
        <input className="input-field" placeholder={ui.lesson} value={form.lesson} onChange={e => setForm({ ...form, lesson: e.target.value })} />
        <button className="btn-primary" type="submit">{ui.saveNote}</button>
      </form>
      <div style={{ display: 'grid', gap: 6 }}>
        {entries.map(entry => (
          <div key={entry.id} style={{ border: '1px solid #2d2b20', background: '#080808', padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b style={{ color: '#f7b500' }}>{entry.symbol}</b><span className="text-muted">{new Date(entry.createdAt).toLocaleDateString()}</span></div>
            <div style={{ color: '#b4b49f', fontSize: '0.82rem', marginTop: 6 }}>{entry.thesis || '-'}</div>
            <div style={{ color: '#8b8b7a', fontSize: '0.75rem', marginTop: 5 }}>{ui.entry} {entry.entry || '-'} · {ui.target} {entry.target || '-'} · {ui.stop} {entry.stop || '-'} · {ui.outcome} {entry.outcome || '-'} · {ui.lesson} {entry.lesson || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
