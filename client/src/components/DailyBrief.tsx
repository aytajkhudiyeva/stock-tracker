import { useEffect, useState } from 'react';
import { fetchEarnings, fetchEconomicCalendar, fetchStockNews } from '../services/api';
import { usePortfolio } from '../hooks/usePortfolio';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import type { EconomicEvent, StockQuote } from '../types';
import SectorIndustryMap from './SectorIndustryMap';

interface Props { quotes: Record<string, StockQuote>; }

export default function DailyBrief({ quotes }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const { portfolio } = usePortfolio();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [earnings, setEarnings] = useState<Array<{ symbol: string; days: number | null }>>([]);
  const [newsRisk, setNewsRisk] = useState<string[]>([]);
  const rows = Object.values(quotes);

  useEffect(() => {
    fetchEconomicCalendar(0, 2).then(d => setEvents(d.events.filter(e => e.impact !== 'low').slice(0, 6))).catch(() => {});
    Promise.allSettled(rows.slice(0, 8).map(q => fetchEarnings(q.symbol))).then(results => {
      setEarnings(results.map((r, i) => r.status === 'fulfilled' ? { symbol: rows[i].symbol, days: r.value.daysUntilEarnings } : null).filter(Boolean) as any);
    });
    Promise.allSettled(rows.slice(0, 4).map(q => fetchStockNews(q.symbol))).then(results => {
      const risks: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value.items.some(item => /risk|falls|drop|war|probe|weak/i.test(item.title))) risks.push(rows[i].symbol);
      });
      setNewsRisk(risks);
    });
  }, [rows.map(r => r.symbol).join(',')]);

  const sorted = [...rows].sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();
  const value = portfolio.reduce((sum, p) => sum + p.quantity * (quotes[p.symbol]?.regularMarketPrice || p.purchasePrice), 0);

  return (
    <div className="card page-panel">
      <div className="section-kicker">{ui.dailyBrief}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <Panel title={ui.portfolioState}>{value ? `${ui.estimatedValue}: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : ui.noPortfolioPositions}</Panel>
        <Panel title={ui.topMovers}>{[...gainers, ...losers].map(q => `${q.symbol} ${q.regularMarketChangePercent >= 0 ? '+' : ''}${(q.regularMarketChangePercent ?? 0).toFixed(1)}%`).join(' · ')}</Panel>
        <Panel title={ui.economicEvents}>{events.length ? events.map(e => `${e.name} ${e.time} ET`).join(' · ') : ui.noBriefEvents}</Panel>
        <Panel title={ui.earningsNearby}>{earnings.filter(e => e.days != null && e.days >= 0 && e.days <= 14).map(e => `${e.symbol} ${e.days}d`).join(' · ') || ui.noNearbyEarnings}</Panel>
        <Panel title={ui.newsRiskFlags}>{newsRisk.length ? newsRisk.join(' · ') : ui.noNewsRisk}</Panel>
        <SectorIndustryMap quotes={quotes} compact />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #2d2b20', background: '#080808', padding: 12 }}>
      <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 6 }}>{title}</div>
      <div style={{ color: '#b4b49f', fontSize: '0.84rem', lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}
