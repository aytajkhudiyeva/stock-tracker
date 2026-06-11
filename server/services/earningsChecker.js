const { getAlerts } = require('./alertStore');
const { getEarnings } = require('./earnings');
const { getDefaultChatIds, sendAlert } = require('./telegram');

// Track which notifications have already been sent today
const sentToday = new Set(); // key: `${symbol}:${daysUntil}:${date}`

async function checkEarningsNotifications() {
  const alerts = getAlerts();
  const symbols = [...new Set(alerts.map(a => a.symbol))];
  const uniqueChatIds = [...new Set([...alerts.map(a => a.chatId).filter(Boolean), ...getDefaultChatIds()])];
  if (!symbols.length || !uniqueChatIds.length) return;

  const today = new Date().toISOString().split('T')[0];

  for (const symbol of symbols) {
    try {
      const data = await getEarnings(symbol);
      if (!data?.nextEarningsDate) continue;

      const earningsDate = new Date(data.nextEarningsDate);
      const now = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysUntil = Math.round((earningsDate.getTime() - now.getTime()) / msPerDay);

      if (daysUntil !== 7 && daysUntil !== 1) continue;

      const sentKey = `${symbol}:${daysUntil}:${today}`;
      if (sentToday.has(sentKey)) continue;
      sentToday.add(sentKey);

      const dateStr = earningsDate.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
      const epsLine = data.epsEstimate != null ? `\nGözlənilən EPS: <b>$${data.epsEstimate.toFixed(2)}</b>` : '';
      const revLine = data.revenueEstimate != null ? `\nGözlənilən Gəlir: <b>${fmtRev(data.revenueEstimate)}</b>` : '';

      let msg;
      if (daysUntil === 7) {
        msg = `📅 <b>${symbol}</b> hesabatı <b>7 gün sonra</b> (${dateStr})${epsLine}${revLine}`;
      } else {
        msg = `⚠️ <b>${symbol}</b> hesabatı <b>sabah</b> (${dateStr})!${epsLine}${revLine}`;
      }

      for (const chatId of uniqueChatIds) {
        await sendAlert(chatId, msg);
      }
      console.log(`[Earnings] Notified ${daysUntil}d alert for ${symbol}`);
    } catch (err) {
      console.error(`[Earnings] Check error for ${symbol}:`, err.message);
    }
  }
}

function fmtRev(n) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

module.exports = { checkEarningsNotifications };
