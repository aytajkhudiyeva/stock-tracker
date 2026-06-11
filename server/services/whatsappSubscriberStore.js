const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'whatsappSubscribers.json');

function normalisePhone(phone) {
  const compact = String(phone || '').replace(/[\s()-]/g, '');
  const withoutPlus = compact.startsWith('+') ? compact.slice(1) : compact;
  if (!/^[1-9]\d{7,14}$/.test(withoutPlus)) return null;
  return withoutPlus;
}

function readSubscribers() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubscribers(subscribers) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));
}

function addWhatsappSubscriber(phone) {
  const normalized = normalisePhone(phone);
  if (!normalized) return null;

  const subscribers = readSubscribers();
  const existing = subscribers.find(s => s.phone === normalized);
  if (existing) {
    existing.active = true;
    existing.updatedAt = new Date().toISOString();
    writeSubscribers(subscribers);
    return existing;
  }

  const subscriber = {
    phone: normalized,
    active: true,
    createdAt: new Date().toISOString(),
  };
  subscribers.push(subscriber);
  writeSubscribers(subscribers);
  return subscriber;
}

function getActiveWhatsappPhones() {
  return readSubscribers().filter(s => s.active).map(s => s.phone);
}

function getWhatsappSubscribers() {
  return readSubscribers();
}

module.exports = {
  addWhatsappSubscriber,
  getActiveWhatsappPhones,
  getWhatsappSubscribers,
  normalisePhone,
};
