export interface StockQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketPreviousClose?: number;
  regularMarketVolume?: number;
  regularMarketTime?: string;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  eps?: number;
  beta?: number;
  averageVolume?: number;
  currency?: string;
  exchange?: string;
  quoteType?: string;
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  chatId?: string;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  createdAt: string;
}

export interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  typeDisp?: string;
}

export type Period = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y';

export interface EarningsPastItem {
  quarter: string;
  dateReported?: string;
  actual: number | null;
  estimate: number | null;
  surprise?: number | null;
  revenueActual?: number | null;
  revenueEstimate?: number | null;
}

export interface PortfolioEntry {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  addedAt: string;
}

export interface EarningsData {
  symbol: string;
  nextEarningsDate: string | null;
  daysUntilEarnings: number | null;
  epsEstimate: number | null;
  revenueEstimate: number | null;
  pastEarnings: EarningsPastItem[];
  source: string;
}

export interface TechnicalAnalysis {
  symbol: string;
  price: number;
  rsi: { value: number; signal: 'oversold' | 'neutral' | 'overbought' } | null;
  macd: {
    macd: number; signal: number; histogram: number;
    trend: 'bullish' | 'bearish'; crossover: 'bullish' | 'bearish' | null;
  } | null;
  bollingerBands: {
    upper: number; middle: number; lower: number;
    percentB: number; bandwidth: number;
    signal: 'near_upper' | 'near_lower' | 'neutral';
  } | null;
  movingAverages: {
    sma50: number | null; sma200: number | null;
    priceVsSma50: 'above' | 'below' | null;
    priceVsSma200: 'above' | 'below' | null;
    sma50VsSma200: 'above' | 'below' | null;
    cross: 'golden' | 'death' | null;
  };
  supportResistance: { supports: number[]; resistances: number[] };
  trend: 'strong_uptrend' | 'uptrend' | 'neutral' | 'downtrend' | 'strong_downtrend';
  signals: Array<{ name: string; signal: 'buy' | 'neutral' | 'sell'; value: string }>;
  summary: {
    signal: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
    score: number; buyCount: number; neutralCount: number; sellCount: number;
  };
}
