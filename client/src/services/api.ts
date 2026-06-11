import axios from 'axios';
import type { StockQuote, HistoryPoint, Alert, SearchResult, Period, TechnicalAnalysis, EarningsData, EconomicEvent, IntradayData, AnalystForecast, StockNews, CorporateActivity } from '../types';

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

export const fetchAnalystForecast = (symbol: string): Promise<AnalystForecast> =>
  api.get(`/stocks/forecast/${symbol}`).then(r => r.data);

export const fetchStockNews = (symbol: string): Promise<StockNews> =>
  api.get(`/stocks/news/${symbol}`).then(r => r.data);

export const fetchCorporateActivity = (symbol: string): Promise<CorporateActivity> =>
  api.get(`/stocks/activity/${symbol}`).then(r => r.data);

export const fetchEarnings = (symbol: string): Promise<EarningsData> =>
  api.get(`/stocks/earnings/${symbol}`).then(r => r.data);

export const fetchEconomicCalendar = (daysBack = 14, daysAhead = 60): Promise<{ events: EconomicEvent[] }> =>
  api.get(`/economic/calendar?daysBack=${daysBack}&daysAhead=${daysAhead}`).then(r => r.data);

export const subscribeEconomicWhatsapp = (phone: string): Promise<{ success: boolean; phone: string; configured: boolean; reason?: string }> =>
  api.post('/economic/whatsapp-subscriptions', { phone }).then(r => r.data);

export const sendWhatsappTest = (phone: string): Promise<{ success: boolean; configured: boolean; reason?: string }> =>
  api.post('/economic/whatsapp-test', { phone }).then(r => r.data);

export const fetchIntraday = (symbol: string): Promise<IntradayData> =>
  api.get(`/stocks/intraday/${symbol}`).then(r => r.data);
