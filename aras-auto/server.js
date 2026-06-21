const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const publicIndexing = process.env.PUBLIC_INDEXING === "true";
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const dataFile = path.join(dataDir, "admin-data.json");
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const adminSecret = process.env.ADMIN_SECRET || "aras-auto-demo-secret-change-me";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const candidate = path.resolve(root, relativePath);
  if (!candidate.startsWith(root + path.sep) && candidate !== path.join(root, "index.html")) return null;

  try {
    if (fs.statSync(candidate).isDirectory()) return path.join(candidate, "index.html");
  } catch {}

  return candidate;
}

const defaultData = {
  vehicles: [
    {
      id: "veh-001",
      title: "Premium Family SUV",
      year: 2022,
      fuel: "Hibrid",
      body: "SUV",
      mileage: "42 000 km",
      priceUsd: 19400,
      bakuPriceAzn: 45300,
      status: "Aktiv",
      riskScore: 86,
      image: "/assets/hero-v2.jpg",
      note: "Ailə istifadəsi üçün uyğun, əlavə ekspert baxışı tövsiyə olunur."
    },
    {
      id: "veh-002",
      title: "Executive Hybrid Sedan",
      year: 2023,
      fuel: "Hibrid",
      body: "Sedan",
      mileage: "18 000 km",
      priceUsd: 20700,
      bakuPriceAzn: 48000,
      status: "Yoxlanır",
      riskScore: 91,
      image: "/assets/sedan.jpg",
      note: "Az yürüşlü nümunə, tarixçə təsdiqi gözləyir."
    }
  ],
  orders: [
    {
      id: "ord-001",
      code: "AA-NUMUNE-2406",
      customer: "Nümunə Müştəri",
      phone: "+994 50 000 00 00",
      vehicle: "Premium SUV · 2022",
      currentStage: "Dəniz daşınması",
      nextUpdate: "22 iyun",
      status: "Aktiv",
      stages: [
        { title: "Avtomobil yoxlanıldı", description: "Ekspert hesabatı və materiallar əlavə edildi.", state: "done" },
        { title: "Müqavilə və alış tamamlandı", description: "Ödəniş və ixrac sənədləri təsdiqləndi.", state: "done" },
        { title: "Incheon limanına qəbul edildi", description: "Konteyner planına daxil edildi.", state: "done" },
        { title: "Dəniz daşınması", description: "Gəmi tranzit marşrutundadır.", state: "current" },
        { title: "Gömrük rəsmiləşdirilməsi", description: "Gəlişdən sonra sənədlər təqdim ediləcək.", state: "pending" },
        { title: "Bakı təhvili", description: "Son yoxlama və təhvil aktı.", state: "pending" }
      ]
    }
  ],
  leads: [
    { id: "lead-001", name: "Nigar Məmmədova", phone: "+994 50 000 00 00", interest: "Hibrid SUV", budget: "45 000 AZN", status: "Yeni", createdAt: "2026-06-19T10:00:00.000Z" }
  ],
  deliveries: [
    { id: "del-001", title: "Premium SUV təhvili", customer: "Nümunə müştəri", date: "2026-06-19", summary: "Yoxlama, alış və təhvil mərhələləri tamamlandı.", image: "/assets/hero-v2.jpg", published: true }
  ],
  settings: {
    exchangeRate: 1.7,
    localLogisticsUsd: 350,
    shippingUsd: 1900,
    inspectionFeeUsd: 300,
    serviceFeeUsd: 800,
    insuranceFeeUsd: 250,
    customsReserveAzn: 6500
  }
};

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) writeData(defaultData);
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeData(data) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const tmpFile = `${dataFile}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, dataFile);
}

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function makeToken() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url");
  const signature = crypto.createHmac("sha256", adminSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", adminSecret).update(payload).digest("base64url");
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return parsed.role === "admin" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function getCookie(request, name) {
  return (request.headers.cookie || "").split(";").map(item => item.trim()).find(item => item.startsWith(`${name}=`))?.slice(name.length + 1);
}

function requireAdmin(request, response) {
  if (verifyToken(getCookie(request, "aras_admin"))) return true;
  sendJson(response, 401, { error: "Admin girişi tələb olunur." });
  return false;
}

function adminCookie(value, request, maxAge) {
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `aras_admin=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function normalizeId(prefix, value) {
  return String(value || `${prefix}-${crypto.randomUUID().slice(0, 8)}`);
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/public/vehicles") {
    const data = readData();
    sendJson(response, 200, { vehicles: data.vehicles.filter(vehicle => vehicle.status !== "Gizli") });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/public/settings") {
    sendJson(response, 200, { settings: readData().settings });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/public/deliveries") {
    const data = readData();
    sendJson(response, 200, { deliveries: data.deliveries.filter(delivery => delivery.published !== false) });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/leads") {
    const body = await readBody(request);
    const data = readData();
    const lead = {
      id: normalizeId("lead"),
      name: String(body.name || "").trim(),
      phone: String(body.phone || "").trim(),
      interest: String(body.type || body.interest || body.message || "Seçim sorğusu").trim(),
      budget: String(body.budget || "").trim(),
      message: String(body.message || "").trim(),
      status: "Yeni",
      createdAt: new Date().toISOString()
    };
    data.leads.unshift(lead);
    writeData(data);
    sendJson(response, 201, { lead });
    return true;
  }

  if (request.method === "GET" && pathname.startsWith("/api/track/")) {
    const code = decodeURIComponent(pathname.replace("/api/track/", "")).trim().toUpperCase();
    const order = readData().orders.find(item => String(item.code).toUpperCase() === code);
    if (!order) sendJson(response, 404, { error: "Bu kodla sifariş tapılmadı." });
    else sendJson(response, 200, { order });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/admin/login") {
    const body = await readBody(request);
    if (String(body.password || "") !== adminPassword) {
      sendJson(response, 401, { error: "Parol yanlışdır." });
      return true;
    }
    sendJson(response, 200, { ok: true }, {
      "Set-Cookie": adminCookie(makeToken(), request, 43200)
    });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/admin/logout") {
    sendJson(response, 200, { ok: true }, { "Set-Cookie": adminCookie("", request, 0) });
    return true;
  }

  if (pathname === "/api/admin/me") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (pathname === "/api/admin/data") {
    if (!requireAdmin(request, response)) return true;
    if (request.method === "GET") sendJson(response, 200, readData());
    else if (request.method === "PUT") {
      const incoming = await readBody(request);
      writeData({
        vehicles: Array.isArray(incoming.vehicles) ? incoming.vehicles : [],
        orders: Array.isArray(incoming.orders) ? incoming.orders : [],
        leads: Array.isArray(incoming.leads) ? incoming.leads : [],
        deliveries: Array.isArray(incoming.deliveries) ? incoming.deliveries : [],
        settings: incoming.settings && typeof incoming.settings === "object" ? incoming.settings : defaultData.settings
      });
      sendJson(response, 200, { ok: true });
    } else sendJson(response, 405, { error: "Method not allowed" });
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  try {
    if (pathname.startsWith("/api/")) {
      if (await handleApi(request, response, pathname)) return;
      if (await handleExtraApi(request, response, pathname)) return;
    }
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server xətası" });
    return;
  }

  if (pathname === "/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok", service: "aras-auto" }));
    return;
  }

  const filePath = resolveRequestPath(request.url || "/");
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("404 — Səhifə tapılmadı");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "public, max-age=0, must-revalidate" : "public, max-age=604800",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  };

  if (!publicIndexing) headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";

  response.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Aras Auto is running on port ${port}`);
  console.log(`Search indexing: ${publicIndexing ? "enabled" : "disabled"}`);
});

// ── REFERRAL SİSTEMİ ─────────────────────────────────────────
async function sendWhatsApp(phone, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return { ok: false, note: "WhatsApp konfiqurasiyası yoxdur." };
  const cleanPhone = phone.replace(/\D/g, "");
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: cleanPhone, type: "text", text: { body: message } })
    });
    const json = await res.json();
    if (res.ok) return { ok: true, messageId: json.messages?.[0]?.id };
    return { ok: false, error: json.error?.message };
  } catch (err) { return { ok: false, error: err.message }; }
}

// ── API ENDPOINTS — handleApi funksiyasının xaricindədir ──────
// Bu endpoint-lər server.js-dəki mövcud handleApi-yə əlavə kimi işləyir
// server.createServer içindəki try blokuna əlavə et
// Aşağıdakı funksiyalar isə müstəqil işləyir:

async function handleExtraApi(request, response, pathname) {

  // REFERRAL: yarat
  if (request.method === "POST" && pathname === "/api/referral/generate") {
    const body = await readBody(request);
    const data = readData();
    if (!data.referrals) data.referrals = [];
    const phone = String(body.phone || "").trim();
    const name  = String(body.name  || "").trim();
    if (!phone) { sendJson(response, 400, { error: "Telefon tələb olunur." }); return true; }
    const existing = data.referrals.find(r => r.phone === phone);
    if (existing) { sendJson(response, 200, { referral: existing }); return true; }
    const initials = name.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2) || "AA";
    const suffix   = phone.replace(/\D/g, "").slice(-4);
    const code     = `${initials}-${suffix}`;
    const referral = { id: normalizeId("ref"), phone, name, code, url: `https://arasauto.az/ref/${code}`, discount: 300, friends: [], earned: 0, createdAt: new Date().toISOString() };
    data.referrals.push(referral);
    writeData(data);
    sendJson(response, 201, { referral });
    return true;
  }

  // REFERRAL: oxu
  if (request.method === "GET" && pathname.startsWith("/api/referral/")) {
    const code = decodeURIComponent(pathname.replace("/api/referral/", "")).trim().toUpperCase();
    const data = readData();
    if (!data.referrals) { sendJson(response, 404, { error: "Tapılmadı." }); return true; }
    const ref = data.referrals.find(r => r.code.toUpperCase() === code);
    if (!ref) { sendJson(response, 404, { error: "Tapılmadı." }); return true; }
    sendJson(response, 200, { referral: ref });
    return true;
  }

  // REFERRAL: istifadə et
  if (request.method === "POST" && pathname === "/api/referral/use") {
    const body = await readBody(request);
    const data = readData();
    if (!data.referrals) data.referrals = [];
    const refCode  = String(body.refCode || "").trim().toUpperCase();
    const newPhone = String(body.phone   || "").trim();
    const newName  = String(body.name    || "").trim();
    const ref = data.referrals.find(r => r.code.toUpperCase() === refCode);
    if (!ref) { sendJson(response, 404, { error: "Referral tapılmadı." }); return true; }
    if (ref.friends.some(f => f.phone === newPhone)) { sendJson(response, 409, { error: "Artıq istifadə edilib." }); return true; }
    ref.friends.push({ name: newName, phone: newPhone, date: new Date().toISOString(), status: "Gözlənilir" });
    writeData(data);
    sendJson(response, 200, { ok: true });
    return true;
  }

  // REFERRAL: admin təsdiqlə
  if (request.method === "POST" && pathname === "/api/referral/confirm") {
    if (!requireAdmin(request, response)) return true;
    const body  = await readBody(request);
    const data  = readData();
    if (!data.referrals) data.referrals = [];
    const ref = data.referrals.find(r => r.code.toUpperCase() === String(body.refCode || "").toUpperCase());
    if (!ref) { sendJson(response, 404, { error: "Tapılmadı." }); return true; }
    const friend = ref.friends.find(f => f.phone === String(body.phone || "").trim());
    if (!friend) { sendJson(response, 404, { error: "Dost tapılmadı." }); return true; }
    if (friend.status !== "Gözlənilir") { sendJson(response, 409, { error: "Artıq təsdiqlənib." }); return true; }
    friend.status = "Təsdiqləndi";
    ref.earned += ref.discount;
    writeData(data);
    sendJson(response, 200, { ok: true, earned: ref.earned });
    return true;
  }

  // SƏNƏDLƏR: siyahı
  if (request.method === "GET" && pathname.startsWith("/api/docs/list/")) {
    const code  = decodeURIComponent(pathname.replace("/api/docs/list/", "")).trim().toUpperCase();
    const data  = readData();
    const order = data.orders.find(o => String(o.code).toUpperCase() === code);
    if (!order) { sendJson(response, 404, { error: "Sifariş tapılmadı." }); return true; }
    sendJson(response, 200, { documents: order.documents || [] });
    return true;
  }

  // SƏNƏDLƏR: yüklə
  if (request.method === "GET" && pathname.startsWith("/api/docs/download/")) {
    const parts     = pathname.replace("/api/docs/download/", "").split("/");
    const orderCode = (parts[0] || "").toUpperCase();
    const filename  = path.basename(parts.slice(1).join("/"));
    if (!filename) { sendJson(response, 400, { error: "Fayl adı yanlışdır." }); return true; }
    const data  = readData();
    const order = data.orders.find(o => String(o.code).toUpperCase() === orderCode);
    if (!order) { sendJson(response, 404, { error: "Sifariş tapılmadı." }); return true; }
    if (!(order.documents || []).find(d => d.filename === filename)) { sendJson(response, 404, { error: "Sənəd tapılmadı." }); return true; }
    const docsDir  = path.join(dataDir, "docs", orderCode);
    const filePath = path.join(docsDir, filename);
    if (!filePath.startsWith(docsDir) || !fs.existsSync(filePath)) { sendJson(response, 404, { error: "Fayl tapılmadı." }); return true; }
    const stat = fs.statSync(filePath);
    response.writeHead(200, { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Content-Length": stat.size, "Cache-Control": "private, no-store" });
    fs.createReadStream(filePath).pipe(response);
    return true;
  }

  // SƏNƏDLƏR: admin yüklə
  if (request.method === "POST" && pathname === "/api/admin/docs/upload") {
    if (!requireAdmin(request, response)) return true;
    const body      = await readBody(request);
    const orderCode = String(body.orderCode || "").trim().toUpperCase();
    const filename  = path.basename(String(body.filename || "").trim());
    const base64    = String(body.base64 || "").trim();
    const label     = String(body.label  || filename).trim();
    if (!orderCode || !filename || !base64) { sendJson(response, 400, { error: "orderCode, filename, base64 tələb olunur." }); return true; }
    if (!filename.endsWith(".pdf")) { sendJson(response, 400, { error: "Yalnız PDF." }); return true; }
    const data  = readData();
    const order = data.orders.find(o => String(o.code).toUpperCase() === orderCode);
    if (!order) { sendJson(response, 404, { error: "Sifariş tapılmadı." }); return true; }
    const docsDir = path.join(dataDir, "docs", orderCode);
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(path.join(docsDir, filename), buffer);
    if (!order.documents) order.documents = [];
    const idx = order.documents.findIndex(d => d.filename === filename);
    const doc = { filename, label, sizeMb: (buffer.length / 1_048_576).toFixed(1), addedAt: new Date().toISOString() };
    if (idx >= 0) order.documents[idx] = doc; else order.documents.push(doc);
    writeData(data);
    sendJson(response, 201, { ok: true, document: doc });
    return true;
  }

  // BİLDİRİŞ: tənzimləmə saxla
  if (request.method === "POST" && pathname === "/api/notifications/settings") {
    const body      = await readBody(request);
    const orderCode = String(body.orderCode || "").trim().toUpperCase();
    const data      = readData();
    const order     = data.orders.find(o => String(o.code).toUpperCase() === orderCode);
    if (!order) { sendJson(response, 404, { error: "Sifariş tapılmadı." }); return true; }
    order.notificationSettings = { channels: body.channels || ["whatsapp"], events: body.events || ["port","ship","document","manager"], updatedAt: new Date().toISOString() };
    writeData(data);
    sendJson(response, 200, { ok: true });
    return true;
  }

  // BİLDİRİŞ: göndər
  if (request.method === "POST" && pathname === "/api/notifications/send") {
    if (!requireAdmin(request, response)) return true;
    const body      = await readBody(request);
    const orderCode = String(body.orderCode || "").trim().toUpperCase();
    const eventType = String(body.event     || "").trim();
    const message   = String(body.message   || "").trim();
    const data      = readData();
    const order     = data.orders.find(o => String(o.code).toUpperCase() === orderCode);
    if (!order) { sendJson(response, 404, { error: "Sifariş tapılmadı." }); return true; }
    const settings  = order.notificationSettings || { channels: ["whatsapp"], events: ["port","ship","document","manager"] };
    if (!settings.events.includes(eventType)) { sendJson(response, 200, { ok: true, sent: false, reason: "Müştəri bu hadisə üçün bildiriş istəmir." }); return true; }
    const fullMsg   = `Aras Auto · ${orderCode}\n${message}\nKabinet: https://arasauto.az/kabinet`;
    const results   = [];
    for (const ch of settings.channels) {
      if (ch === "whatsapp") results.push({ channel: "whatsapp", ...(await sendWhatsApp(order.phone, fullMsg)) });
    }
    if (!order.notificationLog) order.notificationLog = [];
    order.notificationLog.push({ event: eventType, message, sentAt: new Date().toISOString(), results });
    writeData(data);
    sendJson(response, 200, { ok: true, sent: true, results });
    return true;
  }

  return false;
}
