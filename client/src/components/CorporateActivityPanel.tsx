import { useEffect, useState } from 'react';
import { fetchCorporateActivity } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import type { CorporateActivity } from '../types';

interface Props { symbol: string; }

function toneColor(tone: string) {
  if (tone === 'positive') return '#16d46b';
  if (tone === 'watch') return '#ff6b00';
  return '#f7b500';
}

export default function CorporateActivityPanel({ symbol }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [data, setData] = useState<CorporateActivity | null>(null);

  useEffect(() => {
    fetchCorporateActivity(symbol).then(setData).catch(() => setData(null));
  }, [symbol]);

  if (!data) return <div style={{ color: '#8b8b7a', padding: 24 }}>{ui.loadingActivity}</div>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ border: '1px solid #2d2b20', background: '#080808', padding: 14 }}>
          <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{ui.insiderActivity}</div>
          <div style={{ color: '#f4f4ec', fontSize: '1.35rem', fontWeight: 900, marginTop: 6 }}>{data.insiderSignal}</div>
          <p style={{ color: '#b4b49f', fontSize: '0.82rem', lineHeight: 1.45 }}>{data.insiderSummary}</p>
        </div>
        <div style={{ border: '1px solid #2d2b20', background: '#080808', padding: 14 }}>
          <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{ui.institutionalActivity}</div>
          <div style={{ color: '#f4f4ec', fontSize: '1.35rem', fontWeight: 900, marginTop: 6 }}>{data.institutionalSignal}</div>
          <p style={{ color: '#b4b49f', fontSize: '0.82rem', lineHeight: 1.45 }}>{data.institutionalSummary}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#2d2b20', border: '1px solid #2d2b20' }}>
        {[
          [ui.institutions, data.ownership.institutions],
          [ui.insiders, data.ownership.insiders],
          [ui.publicFloat, data.ownership.publicFloat],
        ].map(([label, value]) => (
          <div key={label as string} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ color: '#f4f4ec', fontSize: '1.15rem', fontWeight: 900 }}>{typeof value === 'number' ? `${value.toFixed(1)}%` : '-'}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {data.recentItems.map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #2d2b20', background: '#080808', padding: '9px 12px' }}>
            <span style={{ color: '#b4b49f' }}>{item.label}</span>
            <span style={{ color: toneColor(item.tone), fontWeight: 900 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
