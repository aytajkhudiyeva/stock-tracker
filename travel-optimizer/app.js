const airlineNames = {
  J2: "Azerbaijan Airlines",
  CZ: "China Southern",
  CA: "Air China",
  TK: "Turkish Airlines",
  QR: "Qatar Airways",
  EK: "Emirates",
  KC: "Air Astana",
  HY: "Uzbekistan Airways",
  SU: "Aeroflot",
};

const form = document.querySelector("#searchForm");
const resultsNode = document.querySelector("#results");
const statusPanel = document.querySelector("#statusPanel");
const searchSummary = document.querySelector("#searchSummary");
const resultCount = document.querySelector("#resultCount");
const resultSubtitle = document.querySelector("#resultSubtitle");
const searchButton = document.querySelector("#searchButton");
const apiState = document.querySelector("#apiState");
const tripType = document.querySelector("#tripType");
const stayBlock = document.querySelector("#stayBlock");
const minNights = document.querySelector("#minNights");
const maxNights = document.querySelector("#maxNights");
const minNightsValue = document.querySelector("#minNightsValue");
const maxNightsValue = document.querySelector("#maxNightsValue");
const hotelForm = document.querySelector("#hotelForm");
const bookingApiState = document.querySelector("#bookingApiState");
const packageSummary = document.querySelector("#packageSummary");
const packageMessage = document.querySelector("#packageMessage");
const packageState = document.querySelector("#packageState");

let currentFlightResults = [];
let currentQuery = null;
let selectedFlight = null;
let selectedHotel = null;

const placeFields = {
  origin: {
    input: document.querySelector("#origin"),
    value: document.querySelector("#originValue"),
    code: document.querySelector("#originCode"),
    suggestions: document.querySelector("#originSuggestions"),
  },
  destination: {
    input: document.querySelector("#destination"),
    value: document.querySelector("#destinationValue"),
    code: document.querySelector("#destinationCode"),
    suggestions: document.querySelector("#destinationSuggestions"),
  },
};

function isoLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 2);
  document.querySelector("#startDate").value = isoLocal(start);
  document.querySelector("#endDate").value = isoLocal(end);
  document.querySelector("#startDate").min = isoLocal(new Date());
  document.querySelector("#endDate").min = isoLocal(new Date());
  document.querySelector("#hotelCheckin").value = isoLocal(start);
  const hotelCheckout = new Date(start);
  hotelCheckout.setDate(hotelCheckout.getDate() + 7);
  document.querySelector("#hotelCheckout").value = isoLocal(hotelCheckout);
}

function parseDateOnly(value) {
  return new Date(`${String(value).slice(0, 10)}T12:00:00`);
}

function formatDate(value) {
  if (!value) return "—";
  const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
  const weekdays = ["bazar", "bazar ertəsi", "çərşənbə axşamı", "çərşənbə", "cümə axşamı", "cümə", "şənbə"];
  const date = parseDateOnly(value);
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(value) {
  if (!value || !String(value).includes("T")) return "Saat Aviasales-də görünəcək";
  const match = String(value).match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "Saat Aviasales-də görünəcək";
}

function formatMoney(amount, currency = "AZN") {
  return new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.round((parseDateOnly(end) - parseDateOnly(start)) / 86400000);
}

function formatDuration(minutes) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} saat${rest ? ` ${rest} dəq` : ""}`;
}

function syncNights(changed) {
  let min = Number(minNights.value);
  let max = Number(maxNights.value);
  if (min > max) {
    if (changed === "min") {
      max = min;
      maxNights.value = String(max);
    } else {
      min = max;
      minNights.value = String(min);
    }
  }
  minNightsValue.textContent = min;
  maxNightsValue.textContent = max;
}

function showStatus(kind, title, message) {
  const icons = { idle: "↗", loading: "⌛", error: "!", setup: "⚿", empty: "○" };
  statusPanel.className = `status-panel ${kind}`;
  statusPanel.hidden = false;
  statusPanel.innerHTML = `
    <div class="status-icon">${icons[kind] || "↗"}</div>
    <div><strong>${title}</strong><p>${message}</p></div>
  `;
  resultsNode.hidden = true;
  searchSummary.hidden = true;
}

function debounce(callback, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function placeTitle(place) {
  if (place.type === "airport") return `${place.city_name} — ${place.name}`;
  return place.name;
}

function closeSuggestions(field) {
  field.suggestions.hidden = true;
  field.input.setAttribute("aria-expanded", "false");
}

function selectPlace(field, place) {
  field.input.value = placeTitle(place);
  field.value.value = place.code;
  field.code.textContent = place.code;
  closeSuggestions(field);
}

async function loadSuggestions(field) {
  const term = field.input.value.trim();
  field.value.value = "";
  field.code.textContent = "•••";
  if (term.length < 2) {
    closeSuggestions(field);
    return;
  }
  try {
    const response = await fetch(`/api/places?term=${encodeURIComponent(term)}`);
    const data = await response.json();
    if (!data.results?.length) {
      field.suggestions.innerHTML = '<div class="suggestion-empty">Nəticə tapılmadı</div>';
    } else {
      field.suggestions.innerHTML = data.results.map((place, index) => `
        <button type="button" class="suggestion-item" data-place-index="${index}">
          <span class="place-icon">${place.type === "airport" ? "✈" : "●"}</span>
          <span>
            <strong>${escapeHtml(placeTitle(place))}</strong>
            <small>${escapeHtml(place.country_name)}${place.type === "city" && place.main_airport_name ? ` · ${escapeHtml(place.main_airport_name)}` : ""}</small>
          </span>
          <b>${escapeHtml(place.code)}</b>
        </button>
      `).join("");
      field.suggestions.querySelectorAll("[data-place-index]").forEach((button) => {
        button.addEventListener("click", () => selectPlace(field, data.results[Number(button.dataset.placeIndex)]));
      });
    }
    field.suggestions.hidden = false;
    field.input.setAttribute("aria-expanded", "true");
  } catch {
    closeSuggestions(field);
  }
}

Object.values(placeFields).forEach((field) => {
  const runAutocomplete = debounce(() => loadSuggestions(field));
  field.input.addEventListener("input", runAutocomplete);
  field.input.addEventListener("focus", () => {
    if (field.input.value.trim().length >= 2) loadSuggestions(field);
  });
});

document.addEventListener("click", (event) => {
  Object.values(placeFields).forEach((field) => {
    if (!field.input.parentElement.parentElement.contains(event.target)) closeSuggestions(field);
  });
});

document.querySelector("#swapRoute").addEventListener("click", () => {
  const left = {
    label: placeFields.origin.input.value,
    value: placeFields.origin.value.value,
    code: placeFields.origin.code.textContent,
  };
  placeFields.origin.input.value = placeFields.destination.input.value;
  placeFields.origin.value.value = placeFields.destination.value.value;
  placeFields.origin.code.textContent = placeFields.destination.code.textContent;
  placeFields.destination.input.value = left.label;
  placeFields.destination.value.value = left.value;
  placeFields.destination.code.textContent = left.code;
});

document.querySelectorAll("[data-trip-type]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-trip-type]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    tripType.value = button.dataset.tripType;
    stayBlock.hidden = tripType.value === "oneway";
  });
});

document.querySelectorAll(".counter").forEach((counter) => {
  counter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const name = counter.dataset.counter;
    const input = counter.querySelector("input");
    const output = counter.querySelector("b");
    const minimum = name === "adults" ? 1 : 0;
    const maximum = name === "adults" ? 9 : 6;
    let value = Number(input.value);
    value += button.dataset.action === "plus" ? 1 : -1;
    value = Math.min(maximum, Math.max(minimum, value));
    if (name === "infants") value = Math.min(value, Number(document.querySelector("#adults").value));
    input.value = String(value);
    output.textContent = String(value);
    if (name === "adults") {
      const infants = document.querySelector("#infants");
      if (Number(infants.value) > value) {
        infants.value = String(value);
        document.querySelector("#infantsValue").textContent = String(value);
      }
    }
  });
});

function aviasalesDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}${month}`;
}

function buildAviasalesUrl(item, query) {
  const adults = Math.max(1, query.adults);
  const departure = aviasalesDate(item.departure_at);
  const route = query.tripType === "roundtrip"
    ? `${query.origin}${departure}${query.destination}${aviasalesDate(item.return_at)}${adults}`
    : `${query.origin}${departure}${query.destination}${adults}`;
  const params = new URLSearchParams({
    currency: "azn",
    locale: "az",
    children: String(query.children),
    infants: String(query.infants),
  });
  if (query.stops === "0") params.set("direct", "true");
  if (query.baggage === "checked") params.set("with_baggage", "true");
  return `https://www.aviasales.az/search/${route}?${params}`;
}

function stopLabel(transfers) {
  if (transfers === 0) return "Birbaşa uçuş";
  return `${transfers} transfer`;
}

function renderResults(data, query) {
  const items = data.results;
  currentFlightResults = items;
  currentQuery = query;
  statusPanel.hidden = true;
  resultsNode.hidden = false;
  resultCount.textContent = `${items.length} variant`;
  resultSubtitle.textContent =
    `${placeFields.origin.input.value} → ${placeFields.destination.input.value} · ${query.startDate}–${query.endDate}`;

  const notes = [data.pricing_note, data.baggage_note].filter(Boolean);
  searchSummary.hidden = false;
  searchSummary.innerHTML = `
    <strong>${data.scanned.months} ay üzrə ${data.scanned.candidates} uyğun qiymət tapıldı.</strong>
    <span>${data.scanned.stay_lengths ? `${data.scanned.stay_lengths} fərqli qalma müddəti yoxlanıldı.` : "Tək istiqamətli tarixlər yoxlanıldı."}</span>
    ${notes.map((note) => `<small>${note}</small>`).join("")}
  `;

  const lowest = items[0]?.price;
  resultsNode.innerHTML = items.map((item, index) => {
    const nights = item.trip_type === "roundtrip" ? daysBetween(item.departure_at, item.return_at) : 0;
    const airline = airlineNames[item.airline] || item.airline || item.gate || "Aviaşirkət canlı axtarışda";
    const difference = item.price - lowest;
    const aviasalesUrl = buildAviasalesUrl(item, query);
    return `
      <article class="flight-card ${index === 0 ? "best" : ""}" data-url="${aviasalesUrl}" tabindex="0">
        <div class="rank-column">
          <span class="rank">${String(index + 1).padStart(2, "0")}</span>
          ${index === 0 ? '<span class="best-label">ƏN UCUZ</span>' : ""}
        </div>
        <div class="flight-main">
          <div class="date-line">
            <div>
              <small>GEDİŞ</small>
              <strong>${formatDate(item.departure_at)}</strong>
              <span>${formatTime(item.departure_at)}</span>
            </div>
            <div class="route-visual">
              <span>${item.origin || query.origin}</span><i></i><b>✈</b><i></i><span>${item.destination || query.destination}</span>
            </div>
            ${item.trip_type === "roundtrip" ? `
              <div>
                <small>DÖNÜŞ</small>
                <strong>${formatDate(item.return_at)}</strong>
                <span>${formatTime(item.return_at)}</span>
              </div>
            ` : `
              <div>
                <small>SƏFƏR</small>
                <strong>Yalnız gediş</strong>
                <span>${formatDuration(item.duration) || "Müddət canlı axtarışda"}</span>
              </div>
            `}
          </div>
          <div class="flight-meta">
            <span>${airline}${item.flight_number ? ` · ${item.airline}${item.flight_number}` : ""}</span>
            <span>${stopLabel(item.transfers)}</span>
            ${nights ? `<span>${nights} gecə</span>` : ""}
            ${item.duration ? `<span>${formatDuration(item.duration)}</span>` : ""}
            <span>${query.baggage === "checked" ? "Baqajlı axtarış" : query.baggage === "carryon" ? "Əl yükü seçimi" : "Baqaj fərqsiz"}</span>
          </div>
          <p class="card-note">Kartı seçdikdə eyni marşrut və dəqiq tarix Aviasales-də açılacaq.</p>
        </div>
        <div class="price-column">
          ${difference > 0 ? `<small>ən ucuzdan +${formatMoney(difference, item.currency)}</small>` : "<small>1 böyük üçün keş qiyməti</small>"}
          <strong>${formatMoney(item.price, item.currency)}</strong>
          ${query.adults > 1 ? `<span>${query.adults} böyük üçün: ${formatMoney(item.adult_total, item.currency)}</span>` : ""}
          ${query.children || query.infants ? "<span>Uşaq/körpə qiyməti Aviasales-də</span>" : ""}
          <a href="${aviasalesUrl}" target="_blank" rel="noreferrer">Aviasales-də aç <b>↗</b></a>
          <button class="add-flight-button" type="button" data-add-flight="${index}">Paketə əlavə et</button>
        </div>
      </article>
    `;
  }).join("");

  resultsNode.querySelectorAll("[data-add-flight]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectFlight(Number(button.dataset.addFlight));
    });
  });

  resultsNode.querySelectorAll(".flight-card").forEach((card) => {
    const open = () => window.open(card.dataset.url, "_blank", "noopener,noreferrer");
    card.addEventListener("click", (event) => {
      if (!event.target.closest("a")) open();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") open();
    });
  });
}

function selectFlight(index) {
  selectedFlight = {
    ...currentFlightResults[index],
    query: { ...currentQuery },
    confirmedTotal: currentFlightResults[index].adult_total,
  };
  document.querySelectorAll("[data-add-flight]").forEach((button) => {
    button.textContent = Number(button.dataset.addFlight) === index ? "Paketə əlavə edildi ✓" : "Paketə əlavə et";
    button.classList.toggle("selected", Number(button.dataset.addFlight) === index);
  });

  if (selectedFlight.trip_type === "roundtrip") {
    document.querySelector("#hotelCheckin").value = String(selectedFlight.departure_at).slice(0, 10);
    document.querySelector("#hotelCheckout").value = String(selectedFlight.return_at).slice(0, 10);
  }
  document.querySelector("#hotelDestination").value = placeFields.destination.input.value;
  document.querySelector("#bookingSection").scrollIntoView({ behavior: "smooth", block: "start" });
  renderPackage();
}

function bookingSearchUrl() {
  const params = new URLSearchParams({
    ss: document.querySelector("#hotelDestination").value.trim(),
    checkin: document.querySelector("#hotelCheckin").value,
    checkout: document.querySelector("#hotelCheckout").value,
    group_adults: document.querySelector("#adults").value,
    group_children: String(
      Number(document.querySelector("#children").value) + Number(document.querySelector("#infants").value),
    ),
    no_rooms: document.querySelector("#hotelRooms").value,
    selected_currency: "AZN",
  });
  return `https://www.booking.com/searchresults.html?${params}`;
}

hotelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  window.open(bookingSearchUrl(), "_blank", "noopener,noreferrer");
});

document.querySelector("#addHotelButton").addEventListener("click", () => {
  const name = document.querySelector("#selectedHotelName").value.trim();
  const price = Number(document.querySelector("#selectedHotelPrice").value);
  if (!name || !price) {
    document.querySelector("#selectedHotelName").focus();
    document.querySelector("#addHotelButton").textContent = "Hotel adı və real qiyməti daxil et";
    setTimeout(() => {
      document.querySelector("#addHotelButton").textContent = "Hoteli paketə əlavə et";
    }, 1800);
    return;
  }
  selectedHotel = {
    name,
    price,
    stars: document.querySelector("#selectedHotelStars").value,
    board: document.querySelector("#selectedHotelBoard").value,
    url: document.querySelector("#selectedHotelUrl").value.trim(),
    checkin: document.querySelector("#hotelCheckin").value,
    checkout: document.querySelector("#hotelCheckout").value,
    rooms: Number(document.querySelector("#hotelRooms").value),
    destination: document.querySelector("#hotelDestination").value.trim(),
  };
  document.querySelector("#addHotelButton").textContent = "Paketə əlavə edildi ✓";
  renderPackage();
  document.querySelector("#packageSection").scrollIntoView({ behavior: "smooth", block: "start" });
});

function passengerText(query) {
  const parts = [`${query.adults} böyük`];
  if (query.children) parts.push(`${query.children} uşaq`);
  if (query.infants) parts.push(`${query.infants} körpə`);
  return parts.join(", ");
}

function buildPackageMessage() {
  if (!selectedFlight || !selectedHotel) return "Paket yaratmaq üçün uçuş və hotel seç.";
  const customer = document.querySelector("#customerName").value.trim();
  const greeting = customer ? `Salam ${customer},` : "Salam,";
  const flightTotal = Number(selectedFlight.confirmedTotal || selectedFlight.adult_total);
  const total = flightTotal + selectedHotel.price;
  const airline = airlineNames[selectedFlight.airline] || selectedFlight.airline || selectedFlight.gate || "Aviaşirkət";
  const returnLine = selectedFlight.trip_type === "roundtrip"
    ? `Dönüş: ${formatDate(selectedFlight.return_at)}, saat ${formatTime(selectedFlight.return_at)}`
    : "Səfər tipi: yalnız gediş";
  const hotelLink = selectedHotel.url ? `\nHotel linki: ${selectedHotel.url}` : "";
  const flightLink = buildAviasalesUrl(selectedFlight, selectedFlight.query);
  return `${greeting}

Sizin üçün ${placeFields.destination.input.value} üzrə tur paket:

✈️ UÇUŞ
Marşrut: ${selectedFlight.origin} → ${selectedFlight.destination}
Gediş: ${formatDate(selectedFlight.departure_at)}, saat ${formatTime(selectedFlight.departure_at)}
${returnLine}
Aviaşirkət: ${airline}${selectedFlight.flight_number ? ` ${selectedFlight.airline}${selectedFlight.flight_number}` : ""}
Uçuş: ${stopLabel(selectedFlight.transfers)}
Baqaj seçimi: ${selectedFlight.query.baggage === "checked" ? "qeydiyyat baqajı" : selectedFlight.query.baggage === "carryon" ? "əl yükü" : "tarifə görə"}
Sərnişinlər: ${passengerText(selectedFlight.query)}
Uçuş qiyməti: ${formatMoney(flightTotal, selectedFlight.currency)}

🏨 HOTEL
Hotel: ${selectedHotel.name}${selectedHotel.stars ? `, ${selectedHotel.stars}★` : ""}
Tarix: ${formatDate(selectedHotel.checkin)} – ${formatDate(selectedHotel.checkout)}
Müddət: ${daysBetween(selectedHotel.checkin, selectedHotel.checkout)} gecə
Otaq: ${selectedHotel.rooms}
Qidalanma: ${selectedHotel.board}
Hotel qiyməti: ${formatMoney(selectedHotel.price)}

💰 PAKETİN YEKUN QİYMƏTİ: ${formatMoney(total)}

Uçuşu yoxla: ${flightLink}${hotelLink}

Qeyd: Qiymətlər mövcudluğa görə dəyişə bilər. Rezervasiyadan əvvəl son qiymət yenidən təsdiqlənir.`;
}

function renderPackage() {
  if (!selectedFlight && !selectedHotel) {
    packageState.textContent = "Hazır deyil";
    packageMessage.value = "Paket yaratmaq üçün uçuş və hotel seç.";
    return;
  }

  const flightTotal = Number(selectedFlight?.confirmedTotal || selectedFlight?.adult_total || 0);
  const hotelTotal = Number(selectedHotel?.price || 0);
  const total = flightTotal + hotelTotal;
  packageState.textContent = selectedFlight && selectedHotel ? "Paket hazırdır" : "1 seçim qalıb";
  packageSummary.innerHTML = `
    <div class="package-line ${selectedFlight ? "complete" : ""}">
      <span class="package-icon">✈</span>
      <div>
        <small>UÇUŞ</small>
        <strong>${selectedFlight ? `${selectedFlight.origin} → ${selectedFlight.destination}` : "Uçuş seçilməyib"}</strong>
        ${selectedFlight ? `<span>${formatDate(selectedFlight.departure_at)}${selectedFlight.return_at ? ` – ${formatDate(selectedFlight.return_at)}` : ""}</span>` : ""}
      </div>
      ${selectedFlight ? `<b>${formatMoney(flightTotal, selectedFlight.currency)}</b>` : ""}
    </div>
    ${selectedFlight ? `
      <label class="confirmed-price">
        <span>Aviasales-də təsdiqlənmiş uçuş toplamı (AZN)</span>
        <input id="confirmedFlightTotal" type="number" min="0" value="${flightTotal}" />
      </label>
    ` : ""}
    <div class="package-line ${selectedHotel ? "complete" : ""}">
      <span class="package-icon">⌂</span>
      <div>
        <small>HOTEL</small>
        <strong>${selectedHotel ? escapeHtml(selectedHotel.name) : "Hotel seçilməyib"}</strong>
        ${selectedHotel ? `<span>${daysBetween(selectedHotel.checkin, selectedHotel.checkout)} gecə · ${escapeHtml(selectedHotel.board)}</span>` : ""}
      </div>
      ${selectedHotel ? `<b>${formatMoney(hotelTotal)}</b>` : ""}
    </div>
    <div class="package-total">
      <span>Yekun paket qiyməti</span>
      <strong>${formatMoney(total)}</strong>
    </div>
  `;
  const confirmedInput = document.querySelector("#confirmedFlightTotal");
  if (confirmedInput) {
    confirmedInput.addEventListener("change", () => {
      selectedFlight.confirmedTotal = Number(confirmedInput.value || 0);
      renderPackage();
    });
  }
  packageMessage.value = buildPackageMessage();
}

document.querySelector("#customerName").addEventListener("input", () => {
  packageMessage.value = buildPackageMessage();
});

document.querySelector("#copyPackageMessage").addEventListener("click", async () => {
  await navigator.clipboard.writeText(packageMessage.value);
  document.querySelector("#copyPackageMessage").textContent = "Kopyalandı ✓";
  setTimeout(() => {
    document.querySelector("#copyPackageMessage").textContent = "Kopyala";
  }, 1400);
});

async function checkBookingApi() {
  try {
    const response = await fetch("/api/booking/status");
    const data = await response.json();
    bookingApiState.textContent = data.configured ? "Booking API hazırdır" : "Booking keçid rejimi";
    bookingApiState.classList.toggle("booking-ready", data.configured);
    if (data.configured) {
      document.querySelector("#bookingModeNote").textContent =
        "Booking Demand API açarları tanındı; canlı hotel axtarışı üçün tərəfdaş girişindən istifadə ediləcək.";
    }
  } catch {
    bookingApiState.textContent = "Booking bağlantısı yoxdur";
  }
}

async function checkApi() {
  try {
    const response = await fetch("/api/flight-search/status");
    const data = await response.json();
    apiState.textContent = data.configured ? "API hazırdır" : "Token lazımdır";
    apiState.classList.toggle("ready", data.configured);
  } catch {
    apiState.textContent = "Server yoxdur";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = {
    origin: placeFields.origin.value.value,
    destination: placeFields.destination.value.value,
    startDate: document.querySelector("#startDate").value,
    endDate: document.querySelector("#endDate").value,
    tripType: tripType.value,
    minNights: Number(minNights.value),
    maxNights: Number(maxNights.value),
    stops: document.querySelector("#stops").value,
    baggage: document.querySelector("#baggage").value,
    adults: Number(document.querySelector("#adults").value),
    children: Number(document.querySelector("#children").value),
    infants: Number(document.querySelector("#infants").value),
  };

  if (!query.origin || !query.destination) {
    showStatus("error", "Şəhəri siyahıdan seç", "Adı yazdıqdan sonra açılan şəhər və ya hava limanının üzərinə kliklə.");
    return;
  }

  searchButton.disabled = true;
  searchButton.querySelector("span").textContent = "Tarixlər yoxlanılır...";
  resultCount.textContent = "Axtarılır";
  showStatus(
    "loading",
    "Seçilən interval tam yoxlanılır",
    query.tripType === "roundtrip"
      ? `${query.minNights}–${query.maxNights} gecəlik kombinasiyalar qiymətə görə müqayisə edilir.`
      : "Seçilən aralıqdakı tək istiqamətli uçuş tarixləri müqayisə edilir.",
  );

  try {
    const response = await fetch(`/api/flight-search?${new URLSearchParams({
      origin: query.origin,
      destination: query.destination,
      startDate: query.startDate,
      endDate: query.endDate,
      tripType: query.tripType,
      minNights: String(query.minNights),
      maxNights: String(query.maxNights),
      stops: query.stops,
      baggage: query.baggage,
      adults: String(query.adults),
      children: String(query.children),
      infants: String(query.infants),
    })}`);
    const data = await response.json();
    if (!response.ok) {
      showStatus(response.status === 503 ? "setup" : "error", "Axtarış tamamlanmadı", data.message || "Bir az sonra yenidən yoxla.");
      resultCount.textContent = "0 variant";
      return;
    }
    if (!data.results.length) {
      showStatus("empty", "Bu filtrlərlə nəticə tapılmadı", "Tarix aralığını genişləndir və ya transfer filtrini dəyiş.");
      resultCount.textContent = "0 variant";
      return;
    }
    renderResults(data, query);
  } catch {
    showStatus("error", "Serverə qoşulmaq mümkün olmadı", "Tətbiqin serverini yenidən başladıb bir daha yoxla.");
    resultCount.textContent = "0 variant";
  } finally {
    searchButton.disabled = false;
    searchButton.querySelector("span").textContent = "Bütün tarixləri yoxla";
  }
});

minNights.addEventListener("input", () => syncNights("min"));
maxNights.addEventListener("input", () => syncNights("max"));
setDefaultDates();
syncNights();
checkApi();
checkBookingApi();
