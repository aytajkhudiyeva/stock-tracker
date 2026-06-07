const TelegramBot = require('node-telegram-bot-api');

let bot = null;

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

async function sendAlert(chatId, message) {
  const b = getBot();
  if (!b) {
    console.log('[Telegram] Bot not configured. Message:', message);
    return false;
  }
  try {
    await b.sendMessage(chatId || process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' });
    return true;
  } catch (err) {
    console.error('[Telegram] Send error:', err.message);
    return false;
  }
}

module.exports = { sendAlert };
