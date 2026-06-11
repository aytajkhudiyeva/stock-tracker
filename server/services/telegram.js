const TelegramBot = require('node-telegram-bot-api');

let bot = null;

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

function getDefaultChatIds() {
  const ids = [];
  if (process.env.TELEGRAM_CHAT_ID) ids.push(process.env.TELEGRAM_CHAT_ID);
  if (process.env.TELEGRAM_CHAT_IDS) {
    ids.push(...process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim()).filter(Boolean));
  }
  return [...new Set(ids)];
}

async function sendAlert(chatId, message) {
  const b = getBot();
  if (!b) {
    console.log('[Telegram] Bot not configured. Message:', message);
    return false;
  }
  const targetChatId = chatId || getDefaultChatIds()[0];
  if (!targetChatId) {
    console.log('[Telegram] No chat id configured. Message:', message);
    return false;
  }
  try {
    await b.sendMessage(targetChatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (err) {
    console.error('[Telegram] Send error:', err.message);
    return false;
  }
}

async function sendBroadcast(message, chatIds = getDefaultChatIds()) {
  const uniqueChatIds = [...new Set(chatIds.filter(Boolean))];
  if (!uniqueChatIds.length) return false;
  const results = await Promise.all(uniqueChatIds.map(chatId => sendAlert(chatId, message)));
  return results.some(Boolean);
}

module.exports = { getDefaultChatIds, sendAlert, sendBroadcast };
