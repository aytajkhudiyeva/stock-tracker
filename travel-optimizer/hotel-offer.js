const hotelParams = new URLSearchParams(window.location.search);

function hotelText(name, fallback = "") {
  return hotelParams.get(name) || fallback;
}

function hotelMoney(amount) {
  return new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency: "AZN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

const hotel = {
  name: hotelText("name", "Hotel"),
  destination: hotelText("destination"),
  checkin: hotelText("checkin"),
  checkout: hotelText("checkout"),
  adults: hotelText("adults", "1"),
  stars: hotelText("stars", "4"),
  board: hotelText("board", "Səhər yeməyi"),
  area: hotelText("area", "mərkəz"),
  score: hotelText("score", "8.5"),
  room: hotelText("room", "Standard double"),
  price: hotelText("price", "0"),
  cancel: hotelText("cancel", "Təsdiq olunur"),
};

document.querySelector("#hotelName").textContent = hotel.name;
document.querySelector("#hotelDates").textContent = `${hotel.destination} · ${hotel.checkin} giriş · ${hotel.checkout} çıxış · ${hotel.adults} nəfər`;
document.querySelector("#hotelPrice").textContent = hotelMoney(hotel.price);
document.querySelector("#hotelStars").textContent = `${hotel.stars} ulduz`;
document.querySelector("#hotelBoard").textContent = hotel.board;
document.querySelector("#hotelArea").textContent = hotel.area;
document.querySelector("#hotelScore").textContent = `Reytinq ${hotel.score}`;
document.querySelector("#hotelRoom").textContent = `Otaq tipi: ${hotel.room}`;
document.querySelector("#hotelCancel").textContent = `Ləğv/ödəniş: ${hotel.cancel}`;

document.querySelector("#hotelReserveButton").addEventListener("click", () => {
  const message = [
    "Rezerv üçün seçilmiş hotel:",
    hotel.name,
    `${hotel.destination}, ${hotel.checkin} - ${hotel.checkout}`,
    `${hotel.stars} ulduz, ${hotel.board}, ${hotel.room}`,
    `Qiymət: ${hotelMoney(hotel.price)}`,
  ].join("\n");
  navigator.clipboard.writeText(message);
  document.querySelector("#hotelReserveButton").textContent = "Hotel məlumatı kopyalandı";
});
