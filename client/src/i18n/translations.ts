export type Lang = 'en' | 'az';

export interface Translations {
  // Header
  tagline: string;
  searchPlaceholder: string;
  addWatch: string;
  live: string;

  // Layout / App
  marketOverview: string;
  watchlist: string;
  updated: string;
  addStock: string;
  addToWatchlist: string;
  enterTicker: string;
  add: string;
  selectStock: string;

  // Tabs
  tabChart: string;
  tabMetrics: string;
  tabAnalysis: string;
  tabAlerts: string;

  // Stock card
  marketCap: string;
  peRatio: string;
  removeFromWatchlist: string;

  // Chart
  open: string;
  close: string;
  high: string;
  low: string;
  chartFailed: string;

  // Metrics
  financialMetrics: string;
  prevClose: string;
  dayHigh: string;
  dayLow: string;
  weekRange: string;
  volume: string;
  avgVolume: string;
  peTTM: string;
  peFwd: string;
  epsTTM: string;
  dividendYield: string;
  beta: string;
  exchange: string;
  currency: string;
  trailing12: string;
  forwardEstimate: string;
  vsSP500: string;

  // Alerts
  priceAlerts: string;
  activeSentViaTelegram: string;
  cancel: string;
  newAlert: string;
  alertCreated: string;
  telegramSetup: string;
  telegramStep1: string;
  telegramStep2: string;
  telegramStep3: string;
  symbolLabel: string;
  targetPrice: string;
  condition: string;
  telegramChatId: string;
  priceGoesAbove: string;
  priceGoesBelow: string;
  optional: string;
  creating: string;
  createAlert: string;
  active: string;
  triggered: string;
  noAlertsYet: string;
  noAlertsHint: string;
  aboveLabel: string;
  belowLabel: string;
  triggeredLabel: string;
  firedAt: string;
  setOn: string;
  remove: string;

  // Analysis — summary
  technicalSummary: string;
  trendLabel: string;
  strongUptrend: string;
  uptrend: string;
  neutral: string;
  downtrend: string;
  strongDowntrend: string;
  buyCount: string;
  neutralCount: string;
  sellCount: string;
  indicatorSignals: string;

  // Analysis — overall signal
  strongBuy: string;
  buy: string;
  sell: string;
  strongSell: string;

  // Analysis — signal pills
  pillBuy: string;
  pillNeutral: string;
  pillSell: string;

  // Analysis — RSI
  insufficientData: string;
  oversold: string;
  overbought: string;

  // Analysis — MACD
  macdLine: string;
  signalLine: string;
  histogram: string;
  bullishCrossover: string;
  bearishCrossover: string;

  // Analysis — Bollinger Bands
  nearLowerBand: string;
  nearUpperBand: string;
  midRange: string;
  widthLabel: string;
  lowerBand: string;
  middleBand: string;
  upperBand: string;

  // Analysis — Moving Averages
  movingAverages: string;
  goldenCrossAlert: string;
  deathCrossAlert: string;
  alignmentLabel: string;
  bullish: string;
  bearish: string;
  aboveMA: string;
  belowMA: string;

  // Analysis — signal table translated values
  goldenCross: string;
  deathCross: string;
  bullishAlignment: string;
  bearishAlignment: string;

  // Analysis — signal table translated names
  sigRSI: string;
  sigMACD: string;
  sigBB: string;
  sigPriceSMA50: string;
  sigPriceSMA200: string;
  sigSMA: string;

  // Analysis — Support/Resistance
  supportResistance: string;
  noSwingPoints: string;
  resistance: string;
  support: string;
  currentPrice: string;

  // Analysis — loading/error
  computingIndicators: string;
  analysisFailed: string;

  // Earnings
  tabEarnings: string;
  earningsCalendar: string;
  nextEarnings: string;
  daysUntil: string;
  tomorrow: string;
  today: string;
  epsEstimate: string;
  revEstimate: string;
  pastEarningsTitle: string;
  beat: string;
  miss: string;
  actual: string;
  estimate: string;
  surpriseLabel: string;
  earningsLoading: string;
  earningsFailed: string;
  earningsUnavailable: string;
  reportedOn: string;
  earningsIn: string;

  // Earnings table columns
  epsActualLabel: string;
  epsEstimateLabel: string;
  revenueActualLabel: string;
  revenueEstimateLabel: string;
  resultLabel: string;

  // Portfolio
  portfolio: string;
  portfolioEmpty: string;
  portfolioEmptyHint: string;
  addPosition: string;
  purchasePrice: string;
  quantity: string;
  totalValue: string;
  totalCost: string;
  totalPnl: string;
  avgCost: string;
  marketValue: string;
  pnl: string;
  shares: string;
  portfolioSummary: string;
  dashboardView: string;

  // Economic Calendar
  economicCalendar: string;
  economicCalendarView: string;
  econImpactHigh: string;
  econImpactMedium: string;
  econImpactLow: string;
  econPrevious: string;
  econForecast: string;
  econActual: string;
  econReleased: string;
  econUpcoming: string;
  econToday: string;
  econAllEvents: string;
  econHighOnly: string;
  econLoading: string;
  econFailed: string;
  econNoEvents: string;
  econRef: string;
  econForecastNA: string;
  econUS: string;
}

const en: Translations = {
  tagline: 'Real-time market data',
  searchPlaceholder: 'Search stocks (NVDA, Apple, etc.)',
  addWatch: '+ Watch',
  live: 'Live',

  marketOverview: 'Market Overview',
  watchlist: 'Watchlist',
  updated: 'Updated',
  addStock: '+ Add Stock',
  addToWatchlist: '+ Add to Watchlist',
  enterTicker: 'Enter ticker...',
  add: 'Add',
  selectStock: 'Select a stock to view details',

  tabChart: '📈 Chart',
  tabMetrics: '📊 Metrics',
  tabAnalysis: '🔬 Analysis',
  tabAlerts: '🔔 Alerts',

  marketCap: 'Market Cap',
  peRatio: 'P/E Ratio',
  removeFromWatchlist: 'Remove from watchlist',

  open: 'Open',
  close: 'Close',
  high: 'High',
  low: 'Low',
  chartFailed: 'Failed to load chart data',

  financialMetrics: 'Financial Metrics',
  prevClose: 'Prev Close',
  dayHigh: 'Day High',
  dayLow: 'Day Low',
  weekRange: '52-Week Range',
  volume: 'Volume',
  avgVolume: 'Avg Volume',
  peTTM: 'P/E Ratio (TTM)',
  peFwd: 'P/E Ratio (Fwd)',
  epsTTM: 'EPS (TTM)',
  dividendYield: 'Dividend Yield',
  beta: 'Beta',
  exchange: 'Exchange',
  currency: 'Currency',
  trailing12: 'Trailing 12 months',
  forwardEstimate: 'Forward estimate',
  vsSP500: 'vs S&P 500',

  priceAlerts: 'Price Alerts',
  activeSentViaTelegram: 'active · sent via Telegram',
  cancel: 'Cancel',
  newAlert: '+ New Alert',
  alertCreated: "Alert created! You'll be notified via Telegram when triggered.",
  telegramSetup: '📱 Telegram Setup',
  telegramStep1: '1. Create a bot via @BotFather',
  telegramStep2: '2. Add TELEGRAM_BOT_TOKEN to server/.env',
  telegramStep3: '3. Get your Chat ID from @userinfobot',
  symbolLabel: 'Symbol',
  targetPrice: 'Target Price ($)',
  condition: 'Condition',
  telegramChatId: 'Telegram Chat ID',
  priceGoesAbove: 'Price goes above',
  priceGoesBelow: 'Price goes below',
  optional: 'Optional',
  creating: 'Creating...',
  createAlert: 'Create Alert',
  active: 'Active',
  triggered: 'Triggered',
  noAlertsYet: 'No alerts yet',
  noAlertsHint: 'Create an alert to get notified via Telegram',
  aboveLabel: '▲ Above',
  belowLabel: '▼ Below',
  triggeredLabel: '✓ Triggered',
  firedAt: 'Fired at',
  setOn: 'Set',
  remove: 'Remove',

  technicalSummary: 'Technical Summary',
  trendLabel: 'Trend',
  strongUptrend: 'Strong Uptrend',
  uptrend: 'Uptrend',
  neutral: 'Neutral',
  downtrend: 'Downtrend',
  strongDowntrend: 'Strong Downtrend',
  buyCount: 'Buy',
  neutralCount: 'Neutral',
  sellCount: 'Sell',
  indicatorSignals: 'Indicator Signals',

  strongBuy: 'Strong Buy',
  buy: 'Buy',
  sell: 'Sell',
  strongSell: 'Strong Sell',

  pillBuy: '▲ Buy',
  pillNeutral: '— Neutral',
  pillSell: '▼ Sell',

  insufficientData: 'Insufficient data',
  oversold: 'Oversold',
  overbought: 'Overbought',

  macdLine: 'MACD Line',
  signalLine: 'Signal Line',
  histogram: 'Histogram',
  bullishCrossover: 'Bullish Crossover',
  bearishCrossover: 'Bearish Crossover',

  nearLowerBand: 'Near Lower Band',
  nearUpperBand: 'Near Upper Band',
  midRange: 'Mid Range',
  widthLabel: 'Width',
  lowerBand: 'Lower',
  middleBand: 'Middle',
  upperBand: 'Upper',

  movingAverages: 'Moving Averages',
  goldenCrossAlert: 'Golden Cross Detected',
  deathCrossAlert: 'Death Cross Detected',
  alignmentLabel: 'Alignment',
  bullish: 'Bullish',
  bearish: 'Bearish',
  aboveMA: 'Above',
  belowMA: 'Below',

  goldenCross: 'Golden Cross',
  deathCross: 'Death Cross',
  bullishAlignment: 'Bullish Alignment',
  bearishAlignment: 'Bearish Alignment',

  sigRSI: 'RSI (14)',
  sigMACD: 'MACD (12,26,9)',
  sigBB: 'Bollinger Bands',
  sigPriceSMA50: 'Price vs SMA 50',
  sigPriceSMA200: 'Price vs SMA 200',
  sigSMA: 'SMA 50 / 200',

  supportResistance: 'Support & Resistance',
  noSwingPoints: 'No clear swing points detected',
  resistance: 'Resistance',
  support: 'Support',
  currentPrice: 'Current Price',

  computingIndicators: 'Computing technical indicators…',
  analysisFailed: 'Failed to load technical analysis',

  tabEarnings: '📅 Earnings',
  earningsCalendar: 'Earnings Calendar',
  nextEarnings: 'Next Earnings',
  daysUntil: 'days away',
  tomorrow: 'Tomorrow',
  today: 'Today',
  epsEstimate: 'EPS Estimate',
  revEstimate: 'Revenue Estimate',
  pastEarningsTitle: 'Past Earnings (Last 4 Quarters)',
  beat: 'Beat',
  miss: 'Miss',
  actual: 'Actual',
  estimate: 'Estimate',
  surpriseLabel: 'Surprise',
  earningsLoading: 'Loading earnings data…',
  earningsFailed: 'Could not load earnings data',
  earningsUnavailable: 'Earnings data unavailable for this symbol',
  reportedOn: 'Reported',
  earningsIn: 'Earnings in',

  epsActualLabel: 'EPS Actual',
  epsEstimateLabel: 'EPS Est.',
  revenueActualLabel: 'Rev. Actual',
  revenueEstimateLabel: 'Rev. Est.',
  resultLabel: 'Result',

  portfolio: '💼 Portfolio',
  portfolioEmpty: 'No positions yet',
  portfolioEmptyHint: 'Add stocks to track your portfolio',
  addPosition: '+ Add Position',
  purchasePrice: 'Purchase Price ($)',
  quantity: 'Quantity',
  totalValue: 'Total Value',
  totalCost: 'Cost Basis',
  totalPnl: 'Total P&L',
  avgCost: 'Avg Cost',
  marketValue: 'Mkt Value',
  pnl: 'P&L',
  shares: 'Qty',
  portfolioSummary: 'Portfolio Summary',
  dashboardView: '📈 Dashboard',

  economicCalendar: 'Economic Calendar',
  economicCalendarView: '🌍 Economy',
  econImpactHigh: 'High',
  econImpactMedium: 'Medium',
  econImpactLow: 'Low',
  econPrevious: 'Prev',
  econForecast: 'Forecast',
  econActual: 'Actual',
  econReleased: 'Released',
  econUpcoming: 'Upcoming',
  econToday: 'Today',
  econAllEvents: 'All Events',
  econHighOnly: 'High Impact',
  econLoading: 'Loading economic calendar…',
  econFailed: 'Failed to load economic calendar',
  econNoEvents: 'No events in this period',
  econRef: 'Ref.',
  econForecastNA: 'Consensus N/A',
  econUS: 'United States',
};

const az: Translations = {
  tagline: 'Real vaxt bazar məlumatları',
  searchPlaceholder: 'Səhmlər axtar (NVDA, Apple, v.s.)',
  addWatch: '+ İzlə',
  live: 'Canlı',

  marketOverview: 'Bazar İcmalı',
  watchlist: 'İzləmə Siyahısı',
  updated: 'Yeniləndi',
  addStock: '+ Səhm Əlavə Et',
  addToWatchlist: '+ İzləmə Siyahısına Əlavə Et',
  enterTicker: 'Tikker daxil edin...',
  add: 'Əlavə Et',
  selectStock: 'Detalları görmək üçün səhm seçin',

  tabChart: '📈 Qrafik',
  tabMetrics: '📊 Göstəricilər',
  tabAnalysis: '🔬 Analiz',
  tabAlerts: '🔔 Xəbərdarlıqlar',

  marketCap: 'Bazar Kap.',
  peRatio: 'P/E Əmsalı',
  removeFromWatchlist: 'İzləmə siyahısından sil',

  open: 'Açılış',
  close: 'Bağlanış',
  high: 'Yüksək',
  low: 'Aşağı',
  chartFailed: 'Qrafik məlumatları yüklənmədi',

  financialMetrics: 'Maliyyə Göstəriciləri',
  prevClose: 'Əvv. Bağlanış',
  dayHigh: 'Gün Zirvəsi',
  dayLow: 'Gün Dibi',
  weekRange: '52 Həftəlik Diapazon',
  volume: 'Həcm',
  avgVolume: 'Ort. Həcm',
  peTTM: 'P/E Əmsalı (TTM)',
  peFwd: 'P/E Əmsalı (İrəli)',
  epsTTM: 'EPS (TTM)',
  dividendYield: 'Dividend Gəliri',
  beta: 'Beta',
  exchange: 'Birja',
  currency: 'Valyuta',
  trailing12: 'Son 12 ay',
  forwardEstimate: 'Gözlənilən qiymət',
  vsSP500: 'S&P 500 ilə müq.',

  priceAlerts: 'Qiymət Xəbərdarlıqları',
  activeSentViaTelegram: 'aktiv · Telegram vasitəsilə',
  cancel: 'Ləğv Et',
  newAlert: '+ Yeni Xəbərdarlıq',
  alertCreated: 'Xəbərdarlıq yaradıldı! Tetiklendikdə Telegram vasitəsilə bildiriş alacaqsınız.',
  telegramSetup: '📱 Telegram Quraşdırması',
  telegramStep1: '1. @BotFather vasitəsilə bot yaradın',
  telegramStep2: '2. TELEGRAM_BOT_TOKEN-i server/.env-ə əlavə edin',
  telegramStep3: '3. Chat ID-ni @userinfobot-dan alın',
  symbolLabel: 'Simvol',
  targetPrice: 'Hədəf Qiymət ($)',
  condition: 'Şərt',
  telegramChatId: 'Telegram Chat ID',
  priceGoesAbove: 'Qiymət yuxarı keçdikdə',
  priceGoesBelow: 'Qiymət aşağı keçdikdə',
  optional: 'İstəyə bağlı',
  creating: 'Yaradılır...',
  createAlert: 'Xəbərdarlıq Yarat',
  active: 'Aktiv',
  triggered: 'Tetiklənmiş',
  noAlertsYet: 'Hələ xəbərdarlıq yoxdur',
  noAlertsHint: 'Telegram bildirişi almaq üçün xəbərdarlıq yaradın',
  aboveLabel: '▲ Yuxarı',
  belowLabel: '▼ Aşağı',
  triggeredLabel: '✓ Tetikləndi',
  firedAt: 'Tetikləndi',
  setOn: 'Yaradılıb',
  remove: 'Sil',

  technicalSummary: 'Texniki Xülasə',
  trendLabel: 'Trend',
  strongUptrend: 'Güclü Yüksəliş Trendi',
  uptrend: 'Yüksəliş Trendi',
  neutral: 'Neytral',
  downtrend: 'Düşüş Trendi',
  strongDowntrend: 'Güclü Düşüş Trendi',
  buyCount: 'Alış',
  neutralCount: 'Neytral',
  sellCount: 'Satış',
  indicatorSignals: 'İndikator Siqnalları',

  strongBuy: 'Güclü Alış',
  buy: 'Alış',
  sell: 'Satış',
  strongSell: 'Güclü Satış',

  pillBuy: '▲ Alış',
  pillNeutral: '— Neytral',
  pillSell: '▼ Satış',

  insufficientData: 'Məlumat kifayət etmir',
  oversold: 'Həddən artıq satılmış',
  overbought: 'Həddən artıq alınmış',

  macdLine: 'MACD Xətti',
  signalLine: 'Siqnal Xətti',
  histogram: 'Histoqram',
  bullishCrossover: 'Yüksəliş Kəsişməsi',
  bearishCrossover: 'Düşüş Kəsişməsi',

  nearLowerBand: 'Alt Banta Yaxın',
  nearUpperBand: 'Üst Banta Yaxın',
  midRange: 'Orta Diapazon',
  widthLabel: 'Genişlik',
  lowerBand: 'Alt',
  middleBand: 'Orta',
  upperBand: 'Üst',

  movingAverages: 'Hərəkət Ortalamaları',
  goldenCrossAlert: 'Qızıl Kəsişmə Aşkarlandı',
  deathCrossAlert: 'Ölüm Kəsişməsi Aşkarlandı',
  alignmentLabel: 'Uyğunluq',
  bullish: 'Yüksəliş',
  bearish: 'Düşüş',
  aboveMA: 'Yuxarı',
  belowMA: 'Aşağı',

  goldenCross: 'Qızıl Kəsişmə',
  deathCross: 'Ölüm Kəsişməsi',
  bullishAlignment: 'Yüksəliş Uyğunluğu',
  bearishAlignment: 'Düşüş Uyğunluğu',

  sigRSI: 'RSI (14)',
  sigMACD: 'MACD (12,26,9)',
  sigBB: 'Bollinger Bantları',
  sigPriceSMA50: 'Qiymət / SMA 50',
  sigPriceSMA200: 'Qiymət / SMA 200',
  sigSMA: 'SMA 50 / 200',

  supportResistance: 'Dəstək & Müqavimət',
  noSwingPoints: 'Aydın sveyq nöqtəsi aşkarlanmadı',
  resistance: 'Müqavimət',
  support: 'Dəstək',
  currentPrice: 'Cari Qiymət',

  computingIndicators: 'Texniki göstəricilər hesablanır…',
  analysisFailed: 'Texniki analiz yüklənmədi',

  tabEarnings: '📅 Hesabat',
  earningsCalendar: 'Hesabat Təqvimi',
  nextEarnings: 'Növbəti Hesabat',
  daysUntil: 'gün sonra',
  tomorrow: 'Sabah',
  today: 'Bu gün',
  epsEstimate: 'Gözlənilən EPS',
  revEstimate: 'Gözlənilən Gəlir',
  pastEarningsTitle: 'Keçmiş Hesabatlar (Son 4 Rüb)',
  beat: 'Keçdi',
  miss: 'Keçirdi',
  actual: 'Həqiqi',
  estimate: 'Gözlənilən',
  surpriseLabel: 'Sürpriz',
  earningsLoading: 'Hesabat məlumatları yüklənir…',
  earningsFailed: 'Hesabat məlumatları yüklənmədi',
  earningsUnavailable: 'Bu simvol üçün hesabat məlumatı yoxdur',
  reportedOn: 'Açıqlandı',
  earningsIn: 'Hesabat',

  epsActualLabel: 'EPS Həqiqi',
  epsEstimateLabel: 'EPS Gözlənilən',
  revenueActualLabel: 'Gəlir Həqiqi',
  revenueEstimateLabel: 'Gəlir Gözlənilən',
  resultLabel: 'Nəticə',

  portfolio: '💼 Portfel',
  portfolioEmpty: 'Hələ mövqe yoxdur',
  portfolioEmptyHint: 'Portfelinizi izləmək üçün səhm əlavə edin',
  addPosition: '+ Mövqe Əlavə Et',
  purchasePrice: 'Alış Qiyməti ($)',
  quantity: 'Miqdar',
  totalValue: 'Ümumi Dəyər',
  totalCost: 'Maya Dəyəri',
  totalPnl: 'Ümumi M/Z',
  avgCost: 'Ort. Maya',
  marketValue: 'Bazar Dəyəri',
  pnl: 'M/Z',
  shares: 'Miqdar',
  portfolioSummary: 'Portfel Xülasəsi',
  dashboardView: '📈 İdarə Paneli',

  economicCalendar: 'İqtisadi Təqvim',
  economicCalendarView: '🌍 İqtisadiyyat',
  econImpactHigh: 'Yüksək',
  econImpactMedium: 'Orta',
  econImpactLow: 'Aşağı',
  econPrevious: 'Əvv.',
  econForecast: 'Gözlənilən',
  econActual: 'Faktiki',
  econReleased: 'Açıqlandı',
  econUpcoming: 'Gözlənilir',
  econToday: 'Bu gün',
  econAllEvents: 'Bütün Hadisələr',
  econHighOnly: 'Yüksək Təsir',
  econLoading: 'İqtisadi təqvim yüklənir…',
  econFailed: 'İqtisadi təqvim yüklənmədi',
  econNoEvents: 'Bu dövrdə hadisə yoxdur',
  econRef: 'İstinad',
  econForecastNA: 'Konsensus mövcud deyil',
  econUS: 'Birləşmiş Ştatlar',
};

export const translations: Record<Lang, Translations> = { en, az };
