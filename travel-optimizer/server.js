const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = Number(process.env.TRAVEL_OPTIMIZER_PORT || 4174);
const token = process.env.TRAVELPAYOUTS_TOKEN || "";
const bookingApiKey = process.env.BOOKING_API_KEY || "";
const bookingAffiliateId = process.env.BOOKING_AFFILIATE_ID || "";
const apiBase = "https://api.travelpayouts.com";

app.use(express.static(__dirname));

app.get("/api/flight-search/status", (_request, response) => {
  response.json({ configured: Boolean(token) });
});

app.get("/api/booking/status", (_request, response) => {
  response.json({
    configured: Boolean(bookingApiKey && bookingAffiliateId),
    mode: bookingApiKey && bookingAffiliateId ? "demand-api" : "redirect",
  });
});

function integer(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function dateNumber(value) {
  return Date.parse(`${dateOnly(value)}T12:00:00Z`);
}

function daysBetween(start, end) {
  return Math.round((dateNumber(end) - dateNumber(start)) / 86400000);
}

function monthStart(value) {
  return `${dateOnly(value).slice(0, 7)}-01`;
}

function monthsInRange(startDate, endDate) {
  const months = [];
  const cursor = new Date(`${monthStart(startDate)}T12:00:00Z`);
  const end = new Date(`${monthStart(endDate)}T12:00:00Z`);
  while (cursor <= end && months.length < 6) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

function inDateRange(value, startDate, endDate) {
  const day = dateOnly(value);
  return day >= startDate && day <= endDate;
}

function flattenData(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.values(data).flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && !("price" in value) && !("value" in value)) {
      return Object.values(value);
    }
    return [value];
  });
}

function normalizeRecord(record, currency, adults, tripType) {
  const price = Number(record.price || record.value || 0);
  const departure = record.departure_at || record.depart_date;
  const returnAt = record.return_at || record.return_date || "";
  if (!price || !departure || (tripType === "roundtrip" && !returnAt)) return null;
  return {
    origin: record.origin,
    destination: record.destination,
    departure_at: departure,
    return_at: returnAt,
    airline: record.airline || "",
    flight_number: record.flight_number || "",
    transfers: Number(record.transfers ?? record.number_of_changes ?? 0),
    duration: Number(record.duration || 0),
    gate: record.gate || "",
    price,
    adult_total: price * adults,
    currency,
    expires_at: record.expires_at || record.found_at || "",
    trip_type: tripType,
  };
}

async function travelpayouts(pathname, params) {
  const url = new URL(pathname, apiBase);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: {
      "X-Access-Token": token,
      "Accept-Encoding": "gzip, deflate",
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false || payload.error) {
    throw new Error(payload.error || `Provayder xətası (${response.status})`);
  }
  return payload;
}

async function mapWithConcurrency(items, limit, mapper) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

app.get("/api/places", async (request, response) => {
  const term = String(request.query.term || "").trim().slice(0, 80);
  if (term.length < 2) {
    response.json({ results: [] });
    return;
  }
  try {
    const url = new URL("https://autocomplete.travelpayouts.com/places2");
    url.searchParams.set("term", term);
    url.searchParams.set("locale", "az");
    url.searchParams.append("types[]", "city");
    url.searchParams.append("types[]", "airport");
    const upstream = await fetch(url);
    const places = await upstream.json();
    const results = (Array.isArray(places) ? places : []).slice(0, 8).map((place) => ({
      code: place.code,
      type: place.type,
      name: place.name,
      city_name: place.city_name || place.name,
      country_name: place.country_name,
      main_airport_name: place.main_airport_name || "",
    }));
    response.json({ results });
  } catch {
    response.status(502).json({ message: "Şəhər siyahısı hazırda yüklənmir." });
  }
});

async function roundTripSearch(search) {
  const months = monthsInRange(search.startDate, search.endDate);
  const lengths = Array.from(
    { length: search.maxNights - search.minNights + 1 },
    (_, index) => search.minNights + index,
  );
  const requests = months.flatMap((month) => lengths.map((length) => ({ month, length })));
  const payloads = await mapWithConcurrency(requests, 6, ({ month, length }) =>
    travelpayouts("/v1/prices/calendar", {
      origin: search.origin,
      destination: search.destination,
      depart_date: month,
      calendar_type: "departure_date",
      length,
      currency: search.currency,
    }),
  );

  return payloads.flatMap((payload) =>
    flattenData(payload.data)
      .map((record) =>
        normalizeRecord(record, (payload.currency || search.currency).toUpperCase(), search.adults, "roundtrip"),
      )
      .filter(Boolean),
  ).filter((record) => {
    const nights = daysBetween(record.departure_at, record.return_at);
    return inDateRange(record.departure_at, search.startDate, search.endDate) &&
      nights >= search.minNights &&
      nights <= search.maxNights;
  });
}

async function oneWaySearch(search) {
  const months = monthsInRange(search.startDate, search.endDate);
  const payloads = await mapWithConcurrency(months, 4, (month) =>
    travelpayouts("/v2/prices/latest", {
      origin: search.origin,
      destination: search.destination,
      beginning_of_period: `${month}-01`,
      period_type: "month",
      one_way: true,
      currency: search.currency,
      sorting: "price",
      limit: 1000,
      show_to_affiliates: true,
    }),
  );

  return payloads.flatMap((payload) =>
    flattenData(payload.data)
      .map((record) =>
        normalizeRecord(record, (payload.currency || search.currency).toUpperCase(), search.adults, "oneway"),
      )
      .filter(Boolean),
  ).filter((record) => inDateRange(record.departure_at, search.startDate, search.endDate));
}

app.get("/api/flight-search", async (request, response) => {
  if (!token) {
    response.status(503).json({
      message: "Canlı qiymətlər üçün travel-optimizer/.env faylına TRAVELPAYOUTS_TOKEN əlavə et.",
    });
    return;
  }

  const origin = String(request.query.origin || "").toUpperCase();
  const destination = String(request.query.destination || "").toUpperCase();
  const startDate = dateOnly(request.query.startDate);
  const endDate = dateOnly(request.query.endDate);
  const tripType = request.query.tripType === "oneway" ? "oneway" : "roundtrip";
  const minNights = integer(request.query.minNights, 5, 1, 60);
  const maxNights = integer(request.query.maxNights, 10, minNights, 60);
  const adults = integer(request.query.adults, 1, 1, 9);
  const children = integer(request.query.children, 0, 0, 6);
  const infants = integer(request.query.infants, 0, 0, 6);
  const stops = ["any", "0", "1", "2"].includes(request.query.stops) ? request.query.stops : "any";
  const baggage = ["any", "checked", "carryon"].includes(request.query.baggage)
    ? request.query.baggage
    : "any";
  const currency = "AZN";

  if (
    !/^[A-Z]{3}$/.test(origin) ||
    !/^[A-Z]{3}$/.test(destination) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    response.status(400).json({ message: "Marşrut və tarix aralığını düzgün seç." });
    return;
  }
  if (dateNumber(endDate) < dateNumber(startDate)) {
    response.status(400).json({ message: "Son tarix başlanğıc tarixdən əvvəl ola bilməz." });
    return;
  }
  if (daysBetween(startDate, endDate) > 184) {
    response.status(400).json({ message: "Bir axtarışda maksimum 6 aylıq tarix aralığı seçilə bilər." });
    return;
  }
  if (tripType === "roundtrip" && maxNights - minNights > 30) {
    response.status(400).json({ message: "Qalma müddəti intervalı maksimum 30 gün genişliyində ola bilər." });
    return;
  }
  if (infants > adults) {
    response.status(400).json({ message: "Körpə sayı böyüklərin sayından çox ola bilməz." });
    return;
  }

  try {
    const search = {
      origin,
      destination,
      startDate,
      endDate,
      tripType,
      minNights,
      maxNights,
      adults,
      children,
      infants,
      stops,
      baggage,
      currency,
    };
    const records = tripType === "oneway"
      ? await oneWaySearch(search)
      : await roundTripSearch(search);
    const filtered = records.filter((record) => stops === "any" || record.transfers === Number(stops));
    const unique = new Map();

    for (const record of filtered) {
      const key = [
        dateOnly(record.departure_at),
        dateOnly(record.return_at),
        record.transfers,
        record.airline,
        record.flight_number,
      ].join("-");
      const current = unique.get(key);
      if (!current || record.price < current.price) unique.set(key, record);
    }

    const results = [...unique.values()]
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    response.json({
      source: "Travelpayouts Data API",
      cached: true,
      search,
      scanned: {
        months: monthsInRange(startDate, endDate).length,
        stay_lengths: tripType === "roundtrip" ? maxNights - minNights + 1 : 0,
        candidates: filtered.length,
      },
      pricing_note: children || infants
        ? "Göstərilən toplam yalnız böyüklər üçündür; uşaq və körpə qiyməti Aviasales-də hesablanır."
        : "",
      baggage_note: baggage === "checked"
        ? "Baqaj seçimi Aviasales axtarışına ötürülür; keş qiymətinə daxil olması zəmanətli deyil."
        : "",
      results,
    });
  } catch (error) {
    response.status(502).json({
      message: `Qiymət provayderindən məlumat alınmadı: ${error.message}`,
    });
  }
});

app.use((_request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Uçuş Tarix Tapıcı: http://localhost:${port}`);
});
