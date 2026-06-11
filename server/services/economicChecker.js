const { buildCalendar } = require('./economicCalendar');
const { getDefaultChatIds, sendBroadcast } = require('./telegram');
const { getActiveWhatsappPhones } = require('./whatsappSubscriberStore');
const { sendWhatsappBroadcast } = require('./whatsapp');

// Track sent notifications: key = "type:eventId:date"
const sent = new Set();
const NOTIFY_IMPACTS = new Set((process.env.ECONOMIC_NOTIFY_IMPACTS || 'high,medium').split(',').map(s => s.trim()).filter(Boolean));
const REMINDER_MINUTES = (process.env.ECONOMIC_REMINDER_MINUTES || '60')
  .split(',')
  .map(v => parseInt(v.trim(), 10))
  .filter(v => Number.isFinite(v) && v > 0)
  .sort((a, b) => b - a);

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
  const when = minutesUntil >= 60
    ? `${Math.round(minutesUntil / 60)} saat sonra`
    : `${minutesUntil} dəqiqə sonra`;
  let msg = `⏰ <b>${when}</b>: ABŞ ${ev.nameAz} açıqlanacaq`;
  if (ev.referenceMonth) msg += ` (${ev.referenceMonth})`;
  if (prevFmt) msg += `\nƏvvəlki: ${prevFmt}`;
  if (ev.forecast) msg += ` | Gözlənilən: ${fmtValue(ev.forecast, ev.unit)}`;
  return msg;
}

async function sendMsg(text) {
  await sendBroadcast(text);
  await sendWhatsappBroadcast(text);
}

async function checkEconomicNotifications() {
  if (getDefaultChatIds().length === 0 && getActiveWhatsappPhones().length === 0) return;

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
    if (!NOTIFY_IMPACTS.has(ev.impact)) continue;

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

    // ── Scheduled reminders before release ───────────────────────────────────
    if (ev.date === today && !ev.released) {
      const evMins = etMinutes(ev.time);
      const minsUntil = evMins - nowMins;
      for (const reminderMinute of REMINDER_MINUTES) {
        const reminderKey = `reminder:${reminderMinute}:${ev.id}:${today}`;
        if (!sent.has(reminderKey)) {
          const windowStart = reminderMinute - 5;
          const windowEnd = reminderMinute + 5;
          if (minsUntil >= windowStart && minsUntil <= windowEnd) {
            sent.add(reminderKey);
            await sendMsg(buildReminderMsg(ev, reminderMinute));
          }
        }
      }
    }
  }
}

module.exports = { checkEconomicNotifications };
