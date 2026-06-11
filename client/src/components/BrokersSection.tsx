import { useState } from 'react';

interface Broker {
  id: string;
  name: string;
  type: string;
  domain: string;
  description: string;
  registerUrl: string;
  logoUrl?: string;
  tags: string[];
  initials: string;
  bgColor: string;
  textColor: string;
}

const BROKERS: Broker[] = [
  {
    id: 'investaz',
    name: 'InvestAZ',
    type: 'İnvestisiya Şirkəti',
    domain: 'investaz.az',
    description: 'Azərbaycanın aparıcı investisiya şirkəti. Qlobal bazarlara CFD ticarəti imkanı.',
    registerUrl: 'https://www.investaz.az/real-hesab-acma-emeliyyatlari',
    tags: ['MB Lisenziya', 'MT5', 'CFD', 'Forex'],
    initials: 'IA',
    bgColor: '#1e3a5f',
    textColor: '#0092bc',
  },
  {
    id: 'pashacapital',
    name: 'PASHA Capital',
    type: 'İnvestisiya Şirkəti',
    domain: 'pashacapital.az',
    description: 'PASHA Holding-in investisiya qolu. BFB-də ən böyük broker, 3000+ alət.',
    registerUrl: 'https://www.pashacapital.az/trading/broker-hesabi-ac',
    logoUrl: 'https://www.google.com/s2/favicons?domain=pashacapital.az&sz=128',
    tags: ['MB Lisenziya', 'BFB', 'Fond Bazarı'],
    initials: 'PC',
    bgColor: '#064e3b',
    textColor: '#34d399',
  },
  {
    id: 'birbank',
    name: 'Birbank Invest',
    type: 'Bank Broker (Kapital Bank)',
    domain: 'birbankinvest.az',
    description: 'Kapital Bank-ın rəqəmsal investisiya xidməti. ABŞ səhmlərinə çıxış.',
    registerUrl: 'https://birbankinvest.az',
    logoUrl: 'https://www.google.com/s2/favicons?domain=birbankinvest.az&sz=128',
    tags: ['MB Lisenziya', 'Bank', 'ABŞ Səhmləri'],
    initials: 'BI',
    bgColor: '#052e16',
    textColor: '#4ade80',
  },
  {
    id: 'unicapital',
    name: 'Unicapital',
    type: 'İnvestisiya Şirkəti',
    domain: 'unicapital.az',
    description: 'Bakı Fond Birjasında yerli qiymətli kağızlar üzrə əməliyyatlar.',
    registerUrl: 'https://unicapital.az',
    tags: ['MB Lisenziya', 'BFB', 'Yerli Bazar'],
    initials: 'UC',
    bgColor: '#2e1065',
    textColor: '#a78bfa',
  },
  {
    id: 'cfi',
    name: 'CFI Azerbaijan',
    type: 'Beynəlxalq Broker',
    domain: 'cfi.trade',
    description: 'Qlobal broker CFI-nin Bakı ofisi. Səhm, valyuta, əmtəə ticarəti.',
    registerUrl: 'https://cfi.trade/az',
    tags: ['MB Lisenziya', 'MT5', 'Qlobal'],
    initials: 'CF',
    bgColor: '#450a0a',
    textColor: '#f87171',
  },
  {
    id: 'abbinvest',
    name: 'ABB-İnvest',
    type: 'Bank Broker (ABB)',
    domain: 'abbinvest.az',
    description: 'Azərbaycan Beynəlxalq Bankının broker şirkəti. ABŞ səhmləri, ETF və istiqrazlara çıxış.',
    registerUrl: 'https://www.abbinvest.az/az/xarici-bazar',
    logoUrl: 'https://www.google.com/s2/favicons?domain=abbinvest.az&sz=128',
    tags: ['MB Lisenziya', 'Bank', 'ABŞ Səhmləri', 'ETF'],
    initials: 'AB',
    bgColor: '#1e3a8a',
    textColor: '#93c5fd',
  },
  {
    id: 'mfx',
    name: 'MFX-Trading',
    type: 'İnvestisiya Şirkəti',
    domain: 'mfx.az',
    description: 'Yerli və xarici birjalarda səhm ticarəti. Apple, Microsoft kimi qlobal şirkətlərə çıxış.',
    registerUrl: 'https://www.mfx.az',
    logoUrl: 'https://www.google.com/s2/favicons?domain=mfx.az&sz=128',
    tags: ['MB Lisenziya', 'Xarici Birjalar', 'Portfel'],
    initials: 'MF',
    bgColor: '#3f2d04',
    textColor: '#fbbf24',
  },
];

function BrokerLogo({ broker }: { broker: Broker }) {
  const [srcIndex, setSrcIndex] = useState(0);

  const sources = [
    broker.logoUrl,
    `https://logo.clearbit.com/${broker.domain}`,
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${broker.domain}&size=128`,
    `https://www.google.com/s2/favicons?domain=${broker.domain}&sz=128`,
  ].filter((s): s is string => Boolean(s));

  if (srcIndex < sources.length) {
    return (
      <img
        src={sources[srcIndex]}
        alt={broker.name}
        onError={() => setSrcIndex(i => i + 1)}
        style={{
          width: 48, height: 48,
          borderRadius: 2,
          objectFit: 'contain',
          background: '#f4f4ec',
          padding: 5,
          flexShrink: 0,
          border: '1px solid #5f4a10',
        }}
      />
    );
  }

  return (
    <div style={{
      width: 48, height: 48,
      borderRadius: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 14,
      flexShrink: 0,
      background: broker.bgColor,
      color: broker.textColor,
    }}>
      {broker.initials}
    </div>
  );
}

function BrokerCard({ broker }: { broker: Broker }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={broker.registerUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: hovered ? '#17130a' : '#080808',
        border: `1px solid ${hovered ? '#f7b500' : '#2d2b20'}`,
        borderRadius: 2,
        padding: '1.25rem 1rem',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BrokerLogo broker={broker} />
        <div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#f7b500' }}>
            {broker.name}
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#6e7d92' }}>
            {broker.type}
          </p>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#5b6b80', lineHeight: 1.55, flex: 1 }}>
        {broker.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {broker.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '0.6875rem', fontWeight: 700,
            padding: '2px 7px', borderRadius: 2,
            background: '#10100d', color: '#b4b49f',
            border: '1px solid #2d2b20',
          }}>
            {tag}
          </span>
        ))}
      </div>

      <p style={{
        margin: 0,
        fontSize: '0.75rem',
        color: hovered ? '#f7b500' : '#8b8b7a',
        transition: 'color 0.15s',
      }}>
        {broker.domain} →
      </p>
    </a>
  );
}

export default function BrokersSection() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 900, color: '#f7b500', textTransform: 'uppercase' }}>
            Yerli Brokerlər
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#5b6b80' }}>
            Azərbaycanda lisenziyalı investisiya şirkətləri
          </p>
        </div>
        <span style={{
          flexShrink: 0, fontSize: '0.75rem', fontWeight: 500,
          background: '#050505', color: '#f7b500',
          padding: '4px 12px', borderRadius: 2,
          border: '1px solid #5f4a10',
        }}>
          {BROKERS.length} şirkət
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '1rem',
      }}>
        {BROKERS.map(broker => (
          <BrokerCard key={broker.id} broker={broker} />
        ))}
      </div>

      <p style={{ fontSize: '0.75rem', color: '#8b8b7a', marginTop: '1.25rem', textAlign: 'center' }}>
        Bu siyahı yalnız məlumat məqsədilə hazırlanmışdır. İnvestisiya tövsiyəsi deyil.
      </p>
    </section>
  );
}
