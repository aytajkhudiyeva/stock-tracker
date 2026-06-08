const { buildCalendar } = require('./economicCalendar');

let bot = null;
try {
  const TelegramBot = require('node-telegram-bot-api');
  if (process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }
} catch {}

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Track sent notifications: key = "type:eventId:date"
const sent = new Set();

function nowET() {
  const s = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(s);
}

function etMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function todayET() {
  const d = nowET();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtValue(v, unit) {
  if (v == null) return null;
  return unit === 'K' ? v : `${v}${unit}`;
}

function buildReleaseMsg(ev) {
  const actualFmt = fmtValue(ev.actual, ev.unit);
  const prevFmt = fmtValue(ev.previous, ev.unit);
  let msg = `📊 <b>ABŞ ${ev.nameAz}</b> açıqlandı`;
  if (ev.referenceMonth) msg += ` (${ev.referenceMonth})`;
  msg += '\n';
  if (actualFmt) msg += `Faktiki: <b>${actualFmt}</b>`;
  if (ev.forecast) msg += ` | Gözlənilən: ${fmtValue(ev.forecast, ev.unit)}`;
  if (prevFmt) msg += ` | Əvvəlki: ${prevFmt}`;
  return msg;
}

function buildReminderMsg(ev, minutesUntil) {
  const prevFmt = fmtValue(ev.previous, ev.unit);
  const when = minutesUntil <= 65 ? '1 saat sonra' : `${Math.round(minutesUntil / 60)} saat sonra`;
  let msg = `⏰ <b>${when}</b>: ABŞ ${ev.nameAz} açıqlanacaq`;
  if (ev.referenceMonth) msg += ` (${ev.referenceMonth})`;
  if (prevFmt) msg += `\nƏvvəlki: ${prevFmt}`;
  if (ev.forecast) msg += ` | Gözlənilən: ${fmtValue(ev.forecast, ev.unit)}`;
  return msg;
}

async function sendMsg(text) {
  if (!bot || !CHAT_ID) return;
  try {
    await bot.sendMessage(CHAT_ID, text, { parse_mode: 'HTML' });
  } catch (e) {
    console.error('[EconChecker] Telegram error:', e.message);
  }
}

async function checkEconomicNotifications() {
  if (!bot || !CHAT_ID) return;

  let events;
  try {
    events = await buildCalendar(1, 3); // look 1 day back, 3 days ahead
  } catch (e) {
    console.error('[EconChecker] calendar error:', e.message);
    return;
  }

  const today = todayET();
  const etNow = nowET();
  const nowMins = etNow.getHours() * 60 + etNow.getMinutes();

  for (const ev of events) {
    if (ev.impact !== 'high') continue;

    // ── Release notification (event is today, time has passed, has actual value) ──
    if (ev.date === today && ev.released && ev.actual != null) {
      const releaseKey = `released:${ev.id}:${today}`;
      if (!sent.has(releaseKey)) {
        const evMins = etMinutes(ev.time);
        if (nowMins >= evMins) {
          sent.add(releaseKey);
          await sendMsg(buildReleaseMsg(ev));
        }
      }
    }

    // ── 1-hour reminder (event is today, 45-75 mins before release) ──────────
    if (ev.date === today && !ev.released) {
      const reminderKey = `reminder:${ev.id}:${today}`;
      if (!sent.has(reminderKey)) {
        const evMins = etMinutes(ev.time);
        const minsUntil = evMins - nowMins;
        if (minsUntil >= 45 && minsUntil <= 75) {
          sent.add(reminderKey);
          await sendMsg(buildReminderMsg(ev, minsUntil));
        }
      }
    }
  }
}

module.exports = { checkEconomicNotifications };
