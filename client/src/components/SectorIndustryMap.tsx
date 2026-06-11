import type { StockQuote } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import { classifySymbol } from './sectorMap';

interface Props {
  quotes: Record<string, StockQuote>;
  compact?: boolean;
}

export default function SectorIndustryMap({ quotes, compact = false }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const rows = Object.values(quotes).filter(Boolean);
  const grouped = rows.reduce<Record<string, { count: number; marketValue: number; symbols: string[] }>>((acc, quote) => {
    const { sector } = classifySymbol(quote.symbol);
    if (!acc[sector]) acc[sector] = { count: 0, marketValue: 0, symbols: [] };
    acc[sector].count += 1;
    acc[sector].marketValue += quote.marketCap || 0;
    acc[sector].symbols.push(quote.symbol);
    return acc;
  }, {});
  const total = Object.values(grouped).reduce((sum, row) => sum + row.count, 0) || 1;
  const sectors = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);
  if (!sectors.length) return null;

  return (
    <div style={{ marginBottom: compact ? 10 : 14 }}>
      <div className="section-kicker">{ui.sectorMap}</div>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20' }}>
        {sectors.map(([sector, data]) => {
          const pct = (data.count / total) * 100;
          return (
            <div key={sector} style={{ background: '#080808', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: '#f7b500', fontWeight: 900, fontSize: '0.82rem' }}>{sector}</span>
                <span style={{ color: '#f4f4ec', fontWeight: 900, fontSize: '0.82rem' }}>{((pct) ?? 0).toFixed(0)}%</span>
              </div>
              <div style={{ height: 7, background: '#15130c', border: '1px solid #2d2b20', marginTop: 8 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: '#f7b500' }} />
              </div>
              <div style={{ color: '#8b8b7a', fontSize: '0.72rem', marginTop: 8 }}>{data.symbols.join(' · ')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
