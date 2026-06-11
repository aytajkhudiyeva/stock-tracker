import { useEffect, useState } from 'react';
import { fetchAnalysis, fetchAnalystForecast, fetchStockNews } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { uiLabels } from '../i18n/uiLabels';
import type { AnalystForecast, StockNews, StockQuote, TechnicalAnalysis } from '../types';

interface Props {
  quote: StockQuote;
}

function fmt(n: number | null | undefined, d = 2) {
  if (n == null) return '-';
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function toneColor(tone: 'positive' | 'neutral' | 'negative' | 'watch') {
  if (tone === 'positive') return '#16d46b';
  if (tone === 'negative') return '#ff3b30';
  if (tone === 'watch') return '#ff6b00';
  return '#f7b500';
}

function displayConsensus(consensus: string | undefined, lang: 'en' | 'az') {
  const map: Record<string, string> = {
    'Strong Buy': lang === 'az' ? 'Güclü yüksəliş' : 'Strong Bullish',
    'Moderate Buy': lang === 'az' ? 'Orta yüksəliş' : 'Moderately Bullish',
    Buy: lang === 'az' ? 'Yüksəliş' : 'Bullish',
    Hold: lang === 'az' ? 'Neytral' : 'Neutral',
    Sell: lang === 'az' ? 'Düşüş' : 'Bearish',
    'Strong Sell': lang === 'az' ? 'Güclü düşüş' : 'Strong Bearish',
  };
  return consensus ? (map[consensus] || consensus) : 'N/A';
}

function sentimentFor(text: string) {
  const positive = ['beat', 'growth', 'upgrade', 'raises', 'strong', 'bullish', 'record', 'surge', 'profit'];
  const negative = ['miss', 'cut', 'downgrade', 'weak', 'bearish', 'probe', 'falls', 'drop', 'risk'];
  const haystack = ((text) ?? '').toLowerCase();
  const p = positive.filter(word => haystack.includes(word)).length;
  const n = negative.filter(word => haystack.includes(word)).length;
  if (p > n) return 'positive';
  if (n > p) return 'negative';
  return 'neutral';
}

export default function AiStockSummaryPanel({ quote }: Props) {
  const { lang } = useLanguage();
  const ui = uiLabels(lang);
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [forecast, setForecast] = useState<AnalystForecast | null>(null);
  const [news, setNews] = useState<StockNews | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchAnalysis(quote.symbol),
      fetchAnalystForecast(quote.symbol),
      fetchStockNews(quote.symbol),
    ]).then(results => {
      if (!active) return;
      if (results[0].status === 'fulfilled') setAnalysis(results[0].value);
      if (results[1].status === 'fulfilled') setForecast(results[1].value);
      if (results[2].status === 'fulfilled') setNews(results[2].value);
    });
    return () => { active = false; };
  }, [quote.symbol]);

  const isUp = quote.regularMarketChange >= 0;
  const upside = forecast?.upsidePercent;
  const safeUpside = upside != null && upside !== undefined ? upside : null;
  const newsTone = sentimentFor((news?.items || []).slice(0, 5).map(item => item.title).join(' ')) as 'positive' | 'neutral' | 'negative';
  const riskTone = !isUp || analysis?.summary.signal.includes('Sell') ? 'watch' : 'positive';

  const bullets = lang === 'az'
    ? [
        `${quote.symbol} $${fmt(quote.regularMarketPrice)} qiymətindədir və günlük hərəkət ${isUp ? 'müsbət' : 'mənfi'}: ${fmt(quote.regularMarketChangePercent)}%.`,
        forecast?.targetMeanPrice
          ? `Analitik hədəfi $${fmt(forecast.targetMeanPrice)}; ${safeUpside != null ? `${safeUpside >= 0 ? '+' : ''}${((safeUpside) ?? 0).toFixed(1)}% gözlənilən hərəkət` : 'hərəkət datası məhduddur'}. Üçüncü tərəf sentimenti: ${displayConsensus(forecast.consensus, lang)}.`
          : 'Analitik hədəf datası məhduddur.',
        analysis ? `Texniki model: ${analysis.summary.signal}; trend: ${analysis.trend.replace(/_/g, ' ')}.` : 'Texniki model hələ yüklənir və ya əlçatan deyil.',
        news?.items?.length ? `Son ${Math.min(news.items.length, 5)} başlıq üzrə xəbər tonu ${newsTone === 'positive' ? 'müsbət' : newsTone === 'negative' ? 'mənfi' : 'neytral'} görünür.` : 'Son xəbər axını hazırda əlçatan deyil.',
      ]
    : [
        `${quote.symbol} is trading at $${fmt(quote.regularMarketPrice)} with a ${isUp ? 'positive' : 'negative'} daily move of ${fmt(quote.regularMarketChangePercent)}%.`,
        forecast?.targetMeanPrice
          ? `Analyst target is $${fmt(forecast.targetMeanPrice)} with ${safeUpside != null ? `${safeUpside >= 0 ? '+' : ''}${((safeUpside) ?? 0).toFixed(1)}% implied move` : 'limited move data'}. Third-party sentiment: ${displayConsensus(forecast.consensus, lang)}.`
          : 'Analyst target data is limited for this symbol.',
        analysis ? `Technical model is ${analysis.summary.signal}; trend is ${analysis.trend.replace(/_/g, ' ')}.` : 'Technical model is still loading or unavailable.',
        news?.items?.length ? `Latest news tone looks ${newsTone} across ${Math.min(news.items.length, 5)} recent headlines.` : 'Recent headline feed is unavailable right now.',
      ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 10 }}>
      <div style={{ background: '#080808', border: '1px solid #2d2b20', borderRadius: 2, padding: 14 }}>
        <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 10 }}>{ui.aiStockSummary}</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {bullets.map((line, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 8, color: '#b4b49f', fontSize: '0.84rem', lineHeight: 1.45 }}>
              <span style={{ color: '#f7b500', fontWeight: 900 }}>{index + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20' }}>
        {[
          { label: ui.priceAction, value: isUp ? ui.positive : ui.negative, tone: isUp ? 'positive' : 'negative' },
          { label: ui.analystSentiment, value: displayConsensus(forecast?.consensus, lang), tone: safeUpside != null && safeUpside > 10 ? 'positive' : safeUpside != null && safeUpside < 0 ? 'negative' : 'neutral' },
          { label: ui.newsTone, value: newsTone === 'positive' ? ui.positive : newsTone === 'negative' ? ui.negative : ui.neutral, tone: newsTone },
          { label: ui.riskFlag, value: riskTone === 'watch' ? ui.watch : ui.normal, tone: riskTone },
        ].map(row => (
          <div key={row.label} style={{ background: '#080808', padding: 10 }}>
            <div style={{ color: '#8b8b7a', fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase' }}>{row.label}</div>
            <div style={{ color: toneColor(row.tone as any), fontSize: '0.9rem', fontWeight: 900, marginTop: 3 }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
