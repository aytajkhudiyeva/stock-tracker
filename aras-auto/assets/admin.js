const adminToast = document.querySelector("#toast");
let adminToastTimer;
let adminData = null;

function toast(message) {
  if (!adminToast) return;
  adminToast.textContent = message;
  adminToast.classList.add("show");
  clearTimeout(adminToastTimer);
  adminToastTimer = setTimeout(() => adminToast.classList.remove("show"), 3000);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Sorğu tamamlanmadı.");
  return payload;
}

function money(value, suffix = "") {
  const number = Number(value || 0);
  return number ? `${number.toLocaleString("az-AZ")}${suffix}` : "-";
}

function stageTemplate() {
  return [
    { title: "Sorğu qəbul edildi", description: "Müştərinin tələbləri qeyd edildi.", state: "done" },
    { title: "Avtomobil seçimi", description: "Uyğun variantlar hazırlanır.", state: "current" },
    { title: "Ekspert yoxlaması", description: "Texniki baxış və tarixçə yoxlanışı.", state: "pending" },
    { title: "Alış və sənədlər", description: "Müqavilə, ödəniş və ixrac sənədləri.", state: "pending" },
    { title: "Liman", description: "Avtomobil liman planına daxil edilir.", state: "pending" },
    { title: "Dəniz daşınması", description: "Gəmi və tranzit marşrutu izlənir.", state: "pending" },
    { title: "Gömrük", description: "Bakı rəsmiləşməsi aparılır.", state: "pending" },
    { title: "Təhvilə hazır", description: "Son yoxlama və təhvil vaxtı razılaşdırılır.", state: "pending" },
    { title: "Tamamlandı", description: "Avtomobil müştəriyə təhvil verildi.", state: "pending" }
  ];
}

function setToday() {
  const today = new Intl.DateTimeFormat("az-AZ", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  const node = document.querySelector("#adminToday");
  if (node) node.textContent = `${today} · CANLI PANEL`;
}

function render() {
  if (!adminData) return;
  document.querySelector("#kpiLeads").textContent = adminData.leads.filter(item => item.status === "Yeni").length;
  document.querySelector("#kpiVehicles").textContent = adminData.vehicles.filter(item => item.status === "Aktiv").length;
  document.querySelector("#kpiOrders").textContent = adminData.orders.filter(item => item.status !== "Tamamlandı").length;
  document.querySelector("#kpiDeliveries").textContent = adminData.deliveries.length;

  renderLeads();
  renderVehicles();
  renderOrders();
  renderDeliveries();
  renderSettings();
}

function renderLeads() {
  const list = document.querySelector("#leadList");
  list.innerHTML = `<div class="admin-row head"><span>Müştəri</span><span>Maraq</span><span>Büdcə</span><span>Status</span><span></span></div>` +
    adminData.leads.map(item => `
      <div class="admin-row admin-row-actions">
        <b>${escapeHtml(item.name || "-")}</b>
        <span>${escapeHtml(item.interest || "-")}</span>
        <span>${escapeHtml(item.budget || "-")}</span>
        <select data-update="lead:${item.id}:status">
          ${["Yeni", "Əlaqə saxlanıldı", "Təklif göndərildi", "Müqavilə", "Bağlandı"].map(status => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        <button type="button" data-delete="lead:${item.id}">Sil</button>
      </div>`).join("");
}

function renderVehicles() {
  const list = document.querySelector("#vehicleList");
  list.innerHTML = `<div class="admin-row head"><span>Model</span><span>Qiymət</span><span>Risk</span><span>Status</span><span></span></div>` +
    adminData.vehicles.map(item => `
      <div class="admin-row admin-row-actions">
        <b contenteditable data-edit="vehicle:${item.id}:title">${escapeHtml(item.title || "-")}</b>
        <span><input data-update="vehicle:${item.id}:bakuPriceAzn" type="number" value="${item.bakuPriceAzn || 0}"></span>
        <span><input data-update="vehicle:${item.id}:riskScore" type="number" min="0" max="100" value="${item.riskScore || 0}"></span>
        <select data-update="vehicle:${item.id}:status">
          ${["Aktiv", "Yoxlanır", "Satıldı", "Gizli"].map(status => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        <button type="button" data-delete="vehicle:${item.id}">Sil</button>
      </div>`).join("");
}

function renderOrders() {
  const list = document.querySelector("#orderList");
  list.innerHTML = `<div class="admin-row head"><span>Kod</span><span>Müştəri</span><span>Mərhələ</span><span>Növbəti</span><span></span></div>` +
    adminData.orders.map(item => `
      <div class="admin-row admin-row-actions">
        <b>${item.code}</b>
        <span contenteditable data-edit="order:${item.id}:customer">${escapeHtml(item.customer || "-")}</span>
        <select data-update="order:${item.id}:currentStage">
          ${["Sorğu qəbul edildi", "Avtomobil seçimi", "Ekspert yoxlaması", "Alış və sənədlər", "Liman", "Dəniz daşınması", "Gömrük", "Təhvilə hazır", "Tamamlandı"].map(stage => `<option ${item.currentStage === stage ? "selected" : ""}>${stage}</option>`).join("")}
        </select>
        <input data-update="order:${item.id}:nextUpdate" value="${item.nextUpdate || ""}">
        <button type="button" data-delete="order:${item.id}">Sil</button>
      </div>`).join("");
}

function renderDeliveries() {
  const list = document.querySelector("#deliveryList");
  list.innerHTML = `<div class="admin-row head"><span>Başlıq</span><span>Müştəri</span><span>Tarix</span><span>Status</span><span></span></div>` +
    adminData.deliveries.map(item => `
      <div class="admin-row admin-row-actions">
        <b contenteditable data-edit="delivery:${item.id}:title">${escapeHtml(item.title || "-")}</b>
        <span>${escapeHtml(item.customer || "-")}</span>
        <input data-update="delivery:${item.id}:date" type="date" value="${item.date || ""}">
        <select data-update="delivery:${item.id}:published"><option value="true" ${item.published ? "selected" : ""}>Yayımdadır</option><option value="false" ${!item.published ? "selected" : ""}>Gizli</option></select>
        <button type="button" data-delete="delivery:${item.id}">Sil</button>
      </div>`).join("");
}

function renderSettings() {
  const form = document.querySelector("#settingsForm");
  Object.entries(adminData.settings || {}).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input) input.value = value;
  });
}

function collectionName(type) {
  return ({ lead: "leads", vehicle: "vehicles", order: "orders", delivery: "deliveries" })[type];
}

function findItem(type, id) {
  return adminData[collectionName(type)].find(item => item.id === id);
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function addItem(type, values) {
  const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;
  if (type === "lead") adminData.leads.unshift({ id, ...values, status: "Yeni", createdAt: new Date().toISOString() });
  if (type === "vehicle") adminData.vehicles.unshift({
    id,
    title: values.title,
    year: Number(values.year || new Date().getFullYear()),
    mileage: values.mileage || "",
    fuel: values.fuel || "",
    body: values.body || "",
    priceUsd: Number(values.priceUsd || 0),
    bakuPriceAzn: Number(values.bakuPriceAzn || 0),
    riskScore: Number(values.riskScore || 75),
    status: values.status || "Aktiv",
    image: values.image || "/assets/hero-v2.jpg",
    note: values.note || ""
  });
  if (type === "order") adminData.orders.unshift({
    id,
    code: values.code,
    customer: values.customer || "",
    phone: values.phone || "",
    vehicle: values.vehicle || "",
    currentStage: values.currentStage || "Sorğu qəbul edildi",
    nextUpdate: values.nextUpdate || "",
    status: "Aktiv",
    stages: stageTemplate()
  });
  if (type === "delivery") adminData.deliveries.unshift({ id, ...values, published: true });
}

function applyCurrentStage(order) {
  const names = order.stages.map(stage => stage.title);
  const index = Math.max(0, names.findIndex(name => name === order.currentStage));
  order.status = order.currentStage === "Tamamlandı" ? "Tamamlandı" : "Aktiv";
  order.stages = order.stages.map((stage, stageIndex) => ({
    ...stage,
    state: stageIndex < index ? "done" : stageIndex === index ? "current" : "pending"
  }));
}

async function save() {
  document.querySelectorAll("[data-edit]").forEach(node => {
    const [type, id, field] = node.dataset.edit.split(":");
    const item = findItem(type, id);
    if (item) item[field] = node.textContent.trim();
  });
  document.querySelectorAll("#settingsForm input").forEach(input => {
    adminData.settings[input.name] = Number(input.value || 0);
  });
  adminData.orders.forEach(applyCurrentStage);
  await api("/api/admin/data", { method: "PUT", body: JSON.stringify(adminData) });
  toast("Dəyişikliklər yadda saxlanıldı.");
  render();
}

async function loadAdmin() {
  adminData = await api("/api/admin/data");
  setToday();
  render();
}

document.querySelector("#adminLoginForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await api("/api/admin/login", { method: "POST", body: JSON.stringify(readForm(event.currentTarget)) });
    document.querySelector("#adminLogin").hidden = true;
    document.querySelector("#adminWorkspace").hidden = false;
    await loadAdmin();
  } catch (error) {
    toast(error.message);
  }
});

document.querySelector("#adminLogout")?.addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST", body: "{}" });
  location.reload();
});

document.querySelector("#saveAdminData")?.addEventListener("click", () => save().catch(error => toast(error.message)));

document.querySelector("#exportData")?.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(adminData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `aras-auto-admin-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

document.addEventListener("submit", event => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  addItem(form.dataset.form, readForm(form));
  form.reset();
  render();
  toast("Əlavə olundu. Yadda saxlamağı unutmayın.");
});

document.addEventListener("input", event => {
  const control = event.target.closest("[data-update]");
  if (!control || !adminData) return;
  const [type, id, field] = control.dataset.update.split(":");
  const item = findItem(type, id);
  if (!item) return;
  let value = control.value;
  if (control.type === "number") value = Number(value || 0);
  if (value === "true" || value === "false") value = value === "true";
  item[field] = value;
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button || !adminData) return;
  const [type, id] = button.dataset.delete.split(":");
  const name = collectionName(type);
  adminData[name] = adminData[name].filter(item => item.id !== id);
  render();
  toast("Sətir silindi. Yadda saxlamağı unutmayın.");
});

// ── PUSH BİLDİRİŞ İDARƏETMƏSİ ────────────────────────────────
async function loadPushStatus() {
  const statusEl = document.querySelector("#pushSubStatus");
  if (!statusEl) return;
  try {
    const data = await api("/api/admin/data");
    const subs = data.pushSubscriptions || [];
    const adminCount = subs.filter(s => s.role === "admin").length;
    const customerCount = subs.filter(s => s.role === "customer").length;
    statusEl.textContent = `Admin abunəlikləri: ${adminCount} · Müştəri abunəlikləri: ${customerCount}`;
  } catch {
    statusEl.textContent = "Abunəlik məlumatı yüklənmədi.";
  }
}

document.querySelector("#pushTestForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.target;
  const role = form.role.value;
  const title = form.title.value.trim() || "Aras Auto";
  const message = form.message.value.trim();
  const resultList = document.querySelector("#pushResultList");
  if (!message) return;
  try {
    const response = await api("/api/push/test", {
      method: "POST",
      body: JSON.stringify({ role, title, message })
    });
    const results = response.result || [];
    if (!results.length) {
      resultList.innerHTML = `<p class="admin-hint">Bu rol üçün heç bir abunəlik tapılmadı.</p>`;
    } else {
      resultList.innerHTML = results.map(r =>
        `<div class="admin-row"><span>${escapeHtml(r.id)}</span><span>${r.ok ? "✓ Göndərildi" : "✗ " + escapeHtml(r.error || "Xəta")}</span></div>`
      ).join("");
    }
    toast("Bildiriş göndərmə tamamlandı.");
    form.message.value = "";
  } catch (err) {
    toast(err.message || "Bildiriş göndərilmədi.");
  }
});

api("/api/admin/me").then(() => {
  document.querySelector("#adminLogin").hidden = true;
  document.querySelector("#adminWorkspace").hidden = false;
  loadPushStatus();
  return loadAdmin();
}).catch(() => {
  document.querySelector("#adminLogin").hidden = false;
});
