const params = new URLSearchParams(window.location.search);

function text(name, fallback = "") {
  return params.get(name) || fallback;
}

function money(amount) {
  return new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency: "AZN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

const route = text("route", "Seçilmiş uçuş");
const depart = text("depart");
const inbound = text("return");
const origin = text("origin");
const destination = text("destination");
const adults = text("adults", "1");
const baggage = text("baggage", "Baqajlı");
const price = text("price", "0");
const legs = text("legs").split("||").filter(Boolean);
const bookingUrl = text("bookingUrl");
let flightLegs = [];

try {
  flightLegs = JSON.parse(text("flightLegs", "[]"));
} catch {
  flightLegs = [];
}

document.querySelector("#offerRoute").textContent = route;
document.querySelector("#offerDates").textContent = `${depart} gediş · ${inbound} dönüş`;
document.querySelector("#offerPrice").textContent = money(price);
document.querySelector("#offerPassengers").textContent = `${adults} sərnişin`;
document.querySelector("#offerBaggage").textContent = baggage;
document.querySelector("#legList").innerHTML = (flightLegs.length ? flightLegs : legs)
  .map((leg, index) => {
    if (typeof leg === "string") {
      return `<div class="leg-row"><strong>${index + 1}</strong><span>${leg}</span></div>`;
    }
    return `
      <div class="leg-row detailed">
        <strong>${index + 1}</strong>
        <span>
          <b>${leg.departTime} - ${leg.arriveTime}</b> ${leg.from} → ${leg.to}<br>
          ${leg.airline} ${leg.flightNo} · ${leg.duration} · ${leg.stops}<br>
          ${leg.bagRule} · ${money(leg.price)}
        </span>
      </div>
    `;
  })
  .join("");

const providerBooking = document.querySelector("#providerBooking");
if (bookingUrl) {
  providerBooking.href = bookingUrl;
  providerBooking.hidden = false;
}

document.querySelector("#reserveButton").addEventListener("click", () => {
  const message = [
    "Rezerv üçün seçilmiş uçuş:",
    route,
    `${depart} - ${inbound}`,
    `${adults} sərnişin, ${baggage}`,
    `Qiymət: ${money(price)}`,
    ...(flightLegs.length ? flightLegs.map((leg) => `${leg.date} ${leg.departTime}-${leg.arriveTime} ${leg.from} → ${leg.to}, ${leg.airline} ${leg.flightNo}`) : legs),
  ].join("\n");
  navigator.clipboard.writeText(message);
  document.querySelector("#reserveButton").textContent = "Rezerv məlumatı kopyalandı";
});
