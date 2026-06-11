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

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  tz: string;
  name: string;
  nameAz: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  unit: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  referenceMonth: string | null;
  dataType: string;
  released: boolean;
}

export type PivotKey = 'r3' | 'r2' | 'r1' | 'pp' | 's1' | 's2' | 's3';

export interface PivotLevels {
  pp: number;
  r1: number; r2: number; r3: number;
  s1: number; s2: number; s3: number;
  prevHigh: number; prevLow: number; prevClose: number;
  prevDate: string;
}

export interface IntradayCandle {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number;
  vwap: number | null;
}

export interface IntradayData {
  candles: IntradayCandle[];
  pivots: PivotLevels | null;
  todayOpen: number | null;
  todayHigh: number | null;
  todayLow: number | null;
  tradingDate: string | null;
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

export interface AnalystForecast {
  symbol: string;
  shortName: string | null;
  currentPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  targetMeanPrice: number | null;
  targetMedianPrice: number | null;
  upsidePercent: number | null;
  recommendationMean: number | null;
  recommendationKey: string | null;
  consensus: 'Strong Buy' | 'Moderate Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' | 'N/A';
  analystCount: number | null;
  source: string;
  sourceUrl?: string | null;
  trend: Array<{
    period: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  }>;
  upgrades: Array<{
    date: string | null;
    firm: string;
    toGrade: string;
    fromGrade: string;
    action: string;
  }>;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: string | null;
  summary: string;
  thumbnail: string | null;
}

export interface StockNews {
  symbol: string;
  items: NewsItem[];
}

export interface CorporateActivity {
  symbol: string;
  source: string;
  insiderSignal: string;
  institutionalSignal: string;
  insiderSummary: string;
  institutionalSummary: string;
  ownership: {
    institutions: number | null;
    insiders: number | null;
    publicFloat: number | null;
  };
  recentItems: Array<{
    label: string;
    value: string;
    tone: 'positive' | 'neutral' | 'watch';
  }>;
}
