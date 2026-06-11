import type { StockQuote } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';

interface Props { quote: StockQuote; }

export default function OptionsSentimentPanel({ quote }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const move = Math.abs(quote.regularMarketChangePercent || 0);
  const ivProxy = Math.min(95, Math.max(18, move * 7 + (quote.beta || 1) * 18));
  const callPutTone = quote.regularMarketChangePercent >= 1 ? ui.callLeaning : quote.regularMarketChangePercent <= -1 ? ui.putLeaning : ui.balanced;
  const unusual = move > 4 || (quote.regularMarketVolume && quote.averageVolume && quote.regularMarketVolume > quote.averageVolume * 1.8);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ border: '1px solid #2d2b20', background: '#080808', padding: 14 }}>
        <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{ui.optionsSentiment}</div>
        <div style={{ color: '#8b8b7a', fontSize: '0.75rem', marginTop: 6 }}>
          {ui.optionsProxyNote}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20' }}>
        {[
          [ui.callPutTone, callPutTone, callPutTone === ui.callLeaning ? '#16d46b' : callPutTone === ui.putLeaning ? '#ff3b30' : '#f7b500'],
          [ui.ivProxy, `${((ivProxy) ?? 0).toFixed(1)}%`, ivProxy > 55 ? '#ff6b00' : '#f7b500'],
          [ui.unusualActivity, unusual ? ui.flagged : ui.normal, unusual ? '#ff6b00' : '#16d46b'],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ color, fontWeight: 900, fontSize: '1rem', marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
