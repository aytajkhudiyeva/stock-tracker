import { useEffect, useMemo, useState } from 'react';
import { fetchAnalystForecast } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { AnalystForecast } from '../types';

interface Props {
  symbol: string;
}

function fmt(n: number | null | undefined, digits = 2, prefix = '') {
  if (n == null) return '-';
  return `${prefix}${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return '-';
  return `${n >= 0 ? '+' : ''}${((n) ?? 0).toFixed(1)}%`;
}

function consensusColor(consensus: AnalystForecast['consensus']) {
  if (consensus === 'Strong Buy' || consensus === 'Moderate Buy' || consensus === 'Buy') return '#16d46b';
  if (consensus === 'Sell' || consensus === 'Strong Sell') return '#ff3b30';
  if (consensus === 'Hold') return '#f7b500';
  return '#8b8b7a';
}

function translateConsensus(consensus: AnalystForecast['consensus'], labels: {
  strongBuy: string; moderateBuy: string; buy: string; hold: string; sell: string; strongSell: string;
}) {
  const map = {
    'Strong Buy': labels.strongBuy,
    'Moderate Buy': labels.moderateBuy,
    Buy: labels.buy,
    Hold: labels.hold,
    Sell: labels.sell,
    'Strong Sell': labels.strongSell,
    'N/A': 'N/A',
  } as const;
  return map[consensus] ?? consensus;
}

function normaliseAction(action: string) {
  if (!action) return '-';
  return action.replace(/_/g, ' ').replace(/\b\w/g, ch => ((ch) ?? '').toUpperCase());
}

export default function AnalystForecastPanel({ symbol }: Props) {
  const { t } = useLanguage();
  const [forecast, setForecast] = useState<AnalystForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchAnalystForecast(symbol)
      .then(data => { setForecast(data); setLoading(false); })
      .catch(e => { setError(e.message || 'Failed'); setLoading(false); });
  }, [symbol]);

  const latestTrend = forecast?.trend?.[0] || null;
  const ratingRows = useMemo(() => {
    if (!latestTrend) return [];
    return [
      { key: 'strongBuy', label: t.strongBuyLabel, value: latestTrend.strongBuy, color: '#16d46b' },
      { key: 'buy', label: t.buyLabel, value: latestTrend.buy, color: '#3cff8f' },
      { key: 'hold', label: t.holdLabel, value: latestTrend.hold, color: '#f7b500' },
      { key: 'sell', label: t.sellLabel, value: latestTrend.sell, color: '#ff6b00' },
      { key: 'strongSell', label: t.strongSellLabel, value: latestTrend.strongSell, color: '#ff3b30' },
    ];
  }, [latestTrend, t]);
  const totalRatings = ratingRows.reduce((sum, row) => sum + row.value, 0);

  if (loading) {
    return (
      <div style={{ height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#8b8b7a' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #2d2b20', borderTopColor: '#f7b500', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.82rem' }}>{t.forecastLoading}</span>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8b7a', fontSize: '0.85rem' }}>
        {t.forecastFailed}
      </div>
    );
  }

  const hasTargets = forecast.targetMeanPrice != null || forecast.targetHighPrice != null || forecast.targetLowPrice != null;
  if (!hasTargets && !totalRatings) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8b7a', fontSize: '0.85rem' }}>
        {t.noForecastData}
      </div>
    );
  }

  const consensus = translateConsensus(forecast.consensus, {
    strongBuy: t.strongBuyLabel,
    moderateBuy: t.moderateBuyLabel,
    buy: t.buyLabel,
    hold: t.holdLabel,
    sell: t.sellLabel,
    strongSell: t.strongSellLabel,
  });
  const cColor = consensusColor(forecast.consensus);
  const upsideColor = forecast.upsidePercent == null ? '#8b8b7a' : forecast.upsidePercent >= 0 ? '#16d46b' : '#ff3b30';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.9fr) minmax(260px, 1.1fr)',
        gap: 10,
      }}>
        <div style={{ background: '#080808', border: '1px solid #2d2b20', borderRadius: 2, padding: 16 }}>
          <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
            {t.analystConsensus}
          </div>
          <div style={{ color: cColor, fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.05 }}>
            {consensus}
          </div>
          <div style={{ marginTop: 8, color: '#8b8b7a', fontSize: '0.78rem' }}>
            {forecast.analystCount != null ? `${t.basedOnAnalysts}: ${forecast.analystCount}` : t.basedOnAnalysts}
          </div>
          {forecast.recommendationMean != null && (
            <div style={{ marginTop: 10, display: 'inline-flex', border: '1px solid #2d2b20', background: '#050505', color: '#b4b49f', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 800 }}>
              Score {((forecast.recommendationMean) ?? 0).toFixed(2)}
            </div>
          )}
        </div>

        <div style={{ background: '#080808', border: '1px solid #2d2b20', borderRadius: 2, padding: 16 }}>
          <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
            {t.analystPriceTarget}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ color: '#f4f4ec', fontSize: '2rem', fontWeight: 900 }}>
              {fmt(forecast.targetMeanPrice, 2, '$')}
            </span>
            <span style={{ color: upsideColor, fontSize: '1rem', fontWeight: 900 }}>
              {fmtPct(forecast.upsidePercent)}
            </span>
          </div>
          <div style={{ color: '#8b8b7a', fontSize: '0.75rem', marginTop: 4 }}>
            {t.currentPrice}: {fmt(forecast.currentPrice, 2, '$')} · {t.sourceLabel}: {forecast.source}
            {forecast.sourceUrl && (
              <>
                {' · '}
                <a href={forecast.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#f7b500', fontWeight: 800 }}>
                  TipRanks
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 1, border: '1px solid #2d2b20', background: '#2d2b20' }}>
        {[
          { label: t.lowTarget, value: forecast.targetLowPrice },
          { label: t.averageTarget, value: forecast.targetMeanPrice },
          { label: t.medianTarget, value: forecast.targetMedianPrice },
          { label: t.highTarget, value: forecast.targetHighPrice },
        ].map(item => (
          <div key={item.label} style={{ background: '#080808', padding: 12 }}>
            <div style={{ color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 5 }}>
              {item.label}
            </div>
            <div style={{ color: '#f4f4ec', fontSize: '1rem', fontWeight: 900 }}>
              {fmt(item.value, 2, '$')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#080808', border: '1px solid #2d2b20', borderRadius: 2, padding: 14 }}>
        <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>
          {t.ratingBreakdown}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {ratingRows.map(row => {
            const pct = totalRatings ? (row.value / totalRatings) * 100 : 0;
            return (
              <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 44px', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#b4b49f', fontSize: '0.78rem', fontWeight: 800 }}>{row.label}</div>
                <div style={{ height: 8, background: '#15130c', border: '1px solid #2d2b20' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: row.color }} />
                </div>
                <div style={{ color: row.color, textAlign: 'right', fontWeight: 900, fontSize: '0.8rem' }}>{row.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {forecast.upgrades.length > 0 && (
        <div style={{ border: '1px solid #2d2b20', borderRadius: 2, overflowX: 'auto' }}>
          <div style={{ color: '#f7b500', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', padding: '10px 12px', background: '#151108', borderBottom: '1px solid #2d2b20' }}>
            {t.recentRatings}
          </div>
          <div style={{ minWidth: 680 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1.2fr 1fr 1fr 1fr', padding: '8px 12px', color: '#8b8b7a', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid #2d2b20' }}>
              <div>{t.dateLabel}</div>
              <div>{t.firmLabel}</div>
              <div>{t.actionLabel}</div>
              <div>{t.ratingLabel}</div>
              <div>{t.fromLabel}</div>
            </div>
            {forecast.upgrades.map((item, index) => (
              <div key={`${item.firm}-${item.date}-${index}`} style={{ display: 'grid', gridTemplateColumns: '120px 1.2fr 1fr 1fr 1fr', padding: '9px 12px', color: '#b4b49f', fontSize: '0.78rem', borderBottom: index < forecast.upgrades.length - 1 ? '1px solid #1b1a13' : 'none' }}>
                <div>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</div>
                <div style={{ color: '#f4f4ec', fontWeight: 800 }}>{item.firm || '-'}</div>
                <div>{normaliseAction(item.action)}</div>
                <div style={{ color: '#f7b500', fontWeight: 800 }}>{item.toGrade || '-'}</div>
                <div>{item.fromGrade || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
