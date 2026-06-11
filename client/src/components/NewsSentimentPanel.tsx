import { useEffect, useMemo, useState } from 'react';
import { fetchStockNews } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels, type UiLabels } from '../i18n/uiLabels';
import type { NewsItem } from '../types';

interface Props { symbol: string; }

function sentiment(title: string) {
  const s = ((title) ?? '').toLowerCase();
  const pos = ['upgrade', 'beats', 'beat', 'rally', 'surge', 'growth', 'strong', 'raises', 'record'];
  const neg = ['downgrade', 'miss', 'falls', 'drop', 'weak', 'risk', 'probe', 'cuts', 'bear'];
  const p = pos.filter(w => s.includes(w)).length;
  const n = neg.filter(w => s.includes(w)).length;
  if (p > n) return 'Positive';
  if (n > p) return 'Negative';
  return 'Neutral';
}

function localSentiment(label: string, ui: UiLabels) {
  if (label === 'Positive') return ui.positive;
  if (label === 'Negative') return ui.negative;
  return ui.neutral;
}

function color(label: string) {
  if (label === 'Positive') return '#16d46b';
  if (label === 'Negative') return '#ff3b30';
  return '#f7b500';
}

export default function NewsSentimentPanel({ symbol }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStockNews(symbol)
      .then(data => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  const score = useMemo(() => {
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    items.forEach(item => { counts[sentiment(item.title)] += 1; });
    return counts;
  }, [items]);

  if (loading) return <div style={{ color: '#8b8b7a', padding: 30 }}>{ui.loadingNews}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20' }}>
        {Object.entries(score).map(([label, value]) => (
          <div key={label} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{localSentiment(label, ui)}</div>
            <div style={{ color: color(label), fontWeight: 900, fontSize: '1.35rem' }}>{value}</div>
          </div>
        ))}
      </div>
      {items.length === 0 ? (
        <div style={{ color: '#8b8b7a', padding: 20, border: '1px solid #2d2b20' }}>{ui.noRecentNews}</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.slice(0, 8).map(item => {
            const s = sentiment(item.title);
            return (
              <a key={item.link || item.title} href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', border: '1px solid #2d2b20', background: '#080808', padding: 12, display: 'grid', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ color: '#f4f4ec', fontSize: '0.88rem', fontWeight: 800 }}>{item.title}</span>
                  <span style={{ color: color(s), fontSize: '0.68rem', fontWeight: 900 }}>{localSentiment(s, ui)}</span>
                </div>
                <div style={{ color: '#8b8b7a', fontSize: '0.72rem' }}>{item.publisher} {item.providerPublishTime ? `· ${new Date(item.providerPublishTime).toLocaleDateString()}` : ''}</div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
