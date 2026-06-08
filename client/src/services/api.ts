import axios from 'axios';
import type { StockQuote, HistoryPoint, Alert, SearchResult, Period, TechnicalAnalysis, EarningsData, EconomicEvent } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export const fetchQuote = (symbol: string): Promise<StockQuote> =>
  api.get(`/stocks/quote/${symbol}`).then(r => r.data);

export const fetchQuotes = (symbols: string[]): Promise<Record<string, StockQuote>> =>
  api.get(`/stocks/quotes?symbols=${symbols.join(',')}`).then(r => r.data);

export const fetchHistory = (symbol: string, period: Period = '1mo'): Promise<HistoryPoint[]> =>
  api.get(`/stocks/history/${symbol}?period=${period}`).then(r => r.data);

export const searchStocks = (query: string): Promise<SearchResult[]> =>
  api.get(`/stocks/search/${encodeURIComponent(query)}`).then(r => r.data);

export const fetchAlerts = (): Promise<Alert[]> =>
  api.get('/alerts').then(r => r.data);

export const createAlert = (data: Omit<Alert, 'id' | 'createdAt' | 'triggered'>): Promise<Alert> =>
  api.post('/alerts', data).then(r => r.data);

export const deleteAlert = (id: string): Promise<void> =>
  api.delete(`/alerts/${id}`).then(r => r.data);

export const fetchAnalysis = (symbol: string): Promise<TechnicalAnalysis> =>
  api.get(`/stocks/analysis/${symbol}`).then(r => r.data);

export const fetchEarnings = (symbol: string): Promise<EarningsData> =>
  api.get(`/stocks/earnings/${symbol}`).then(r => r.data);

export const fetchEconomicCalendar = (daysBack = 14, daysAhead = 60): Promise<{ events: EconomicEvent[] }> =>
  api.get(`/economic/calendar?daysBack=${daysBack}&daysAhead=${daysAhead}`).then(r => r.data);
