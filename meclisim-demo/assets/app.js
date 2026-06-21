const saved = new Set(JSON.parse(localStorage.getItem("meclisim-saved") || "[]"));
const countNodes = document.querySelectorAll(".saved-count");
const toast = document.querySelector(".toast");

function updateSavedUI() {
  countNodes.forEach((node) => {
    node.textContent = saved.size;
  });
  document.querySelectorAll(".save-button").forEach((button) => {
    const isSaved = saved.has(button.dataset.id);
    button.classList.toggle("is-saved", isSaved);
    if (button.classList.contains("save-profile")) {
      button.textContent = isSaved ? "♥ Yadda saxlanılıb" : "♡ Yadda saxla";
    } else {
      button.textContent = isSaved ? "♥" : "♡";
    }
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

document.addEventListener("click", (event) => {
  const saveButton = event.target.closest(".save-button");
  if (saveButton) {
    event.preventDefault();
    const id = saveButton.dataset.id;
    if (saved.has(id)) {
      saved.delete(id);
      showToast("Sevimlilərdən çıxarıldı");
    } else {
      saved.add(id);
      showToast("Sevimlilərə əlavə edildi");
    }
    localStorage.setItem("meclisim-saved", JSON.stringify([...saved]));
    updateSavedUI();
  }

  const mobileMenu = event.target.closest(".mobile-menu");
  if (mobileMenu) document.body.classList.toggle("menu-open");
});

const cardsContainer = document.querySelector(".listing-grid");
const searchInput = document.querySelector(".live-search");
const priceFilter = document.querySelector(".price-filter");
const sortFilter = document.querySelector(".sort-filter");

function filterCards() {
  if (!cardsContainer) return;
  const search = (searchInput?.value || "").toLocaleLowerCase("az");
  const maxPrice = Number(priceFilter?.value || Infinity);
  const cards = [...cardsContainer.querySelectorAll(".provider-card")];

  cards.forEach((card) => {
    const matchesSearch = card.textContent.toLocaleLowerCase("az").includes(search);
    const matchesPrice = Number(card.dataset.price) <= maxPrice;
    card.hidden = !(matchesSearch && matchesPrice);
  });

  if (sortFilter?.value === "price") {
    cards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
  } else {
    cards.sort((a, b) => Number(b.dataset.rating) - Number(a.dataset.rating));
  }
  cards.forEach((card) => cardsContainer.appendChild(card));
}

[searchInput, priceFilter, sortFilter].forEach((input) => input?.addEventListener("input", filterCards));

document.querySelectorAll(".quote-form, .planner-form, .subscribe-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast(form.classList.contains("subscribe-form") ? "Abunəliyiniz qeydə alındı" : "Sorğunuz qəbul edildi — tezliklə əlaqə saxlanılacaq");
    form.reset();
  });
});

updateSavedUI();
