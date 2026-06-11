export const SECTOR_MAP: Record<string, { sector: string; industry: string }> = {
  NVDA: { sector: 'AI Chips', industry: 'Semiconductors' },
  AMD: { sector: 'AI Chips', industry: 'Semiconductors' },
  AVGO: { sector: 'AI Chips', industry: 'Semiconductors' },
  INTC: { sector: 'AI Chips', industry: 'Semiconductors' },
  MSFT: { sector: 'Software', industry: 'Cloud & AI' },
  AAPL: { sector: 'Consumer Tech', industry: 'Devices & Services' },
  META: { sector: 'Digital Ads', industry: 'Social Platforms' },
  TSLA: { sector: 'EV', industry: 'Auto & Energy' },
  JPM: { sector: 'Banks', industry: 'Money Center Banks' },
  BAC: { sector: 'Banks', industry: 'Money Center Banks' },
  XOM: { sector: 'Energy', industry: 'Integrated Oil' },
};

export function classifySymbol(symbol: string) {
  return SECTOR_MAP[symbol.toUpperCase()] || { sector: 'Other', industry: 'Unclassified' };
}
