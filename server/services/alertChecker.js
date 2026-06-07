const yahooFinance = require('./yf');
const { getAlerts, updateAlert } = require('./alertStore');
const { sendAlert } = require('./telegram');

async function checkAlerts() {
  const alerts = getAlerts().filter(a => !a.triggered);
  if (alerts.length === 0) return;

  const symbols = [...new Set(alerts.map(a => a.symbol))];
  const quotes = await Promise.all(
    symbols.map(sym => yahooFinance.quote(sym).catch(() => null))
  );
  const priceMap = {};
  symbols.forEach((sym, i) => {
    if (quotes[i]) priceMap[sym] = quotes[i].regularMarketPrice;
  });

  for (const alert of alerts) {
    const price = priceMap[alert.symbol];
    if (price === undefined) continue;

    const triggered =
      (alert.condition === 'above' && price >= alert.targetPrice) ||
      (alert.condition === 'below' && price <= alert.targetPrice);

    if (triggered) {
      updateAlert(alert.id, { triggered: true, triggeredAt: new Date().toISOString(), triggeredPrice: price });

      const emoji = alert.condition === 'above' ? '📈' : '📉';
      const msg = `${emoji} <b>Price Alert Triggered!</b>\n\n<b>${alert.symbol}</b> is now <b>$${price.toFixed(2)}</b>\n\nTarget: ${alert.condition} $${alert.targetPrice.toFixed(2)}`;
      await sendAlert(alert.chatId, msg);
      console.log(`[Alert] ${alert.symbol} triggered at $${price}`);
    }
  }
}

module.exports = { checkAlerts };
