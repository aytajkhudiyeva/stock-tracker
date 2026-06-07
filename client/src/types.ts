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
