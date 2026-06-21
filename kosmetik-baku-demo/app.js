const IMG = {
  skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85",
  serum: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85",
  makeup: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85",
  hair: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=85",
  clean: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=85",
  perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85",
  lipstick: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85",
  dropper: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=85"
};

const PRODUCTS = [
  { id: 1, brand: "Rhode", name: "Pocket Blush Krem Ənlik", category: "Makiyaj", price: 68, badge: "🔥 YENİ VİRAL", viral: true, image: IMG.makeup },
  { id: 2, brand: "Rhode", name: "Glazing Milk Essence", category: "Dəriyə qulluq", price: 72, badge: "🔥 2026 TREND", viral: true, image: IMG.serum },
  { id: 3, brand: "Rhode", name: "Peptide Lip Tint — Honey Mango", category: "Dodaq", price: 46, badge: "VİRAL", viral: true, image: IMG.lipstick },
  { id: 4, brand: "Rare Beauty", name: "Soft Pinch Maye Ənlik", category: "Makiyaj", price: 54, badge: "TIKTOK FAVORİTİ", viral: true, image: IMG.makeup },
  { id: 5, brand: "e.l.f.", name: "Halo Glow Liquid Filter", category: "Makiyaj", price: 35, badge: "VİRAL GLOW", viral: true, image: IMG.makeup },
  { id: 6, brand: "Byoma", name: "Phyto Mucin Glow Serum", category: "Dəriyə qulluq", price: 42, badge: "YENİ VİRAL", viral: true, image: IMG.serum },
  { id: 7, brand: "Byoma", name: "Balancing Face Mist", category: "Dəriyə qulluq", price: 32, badge: "SUMMER TREND", viral: true, image: IMG.skincare },
  { id: 8, brand: "COSRX", name: "Advanced Snail 96 Mucin Essence", category: "Dəriyə qulluq", price: 39, badge: "K-BEAUTY VİRAL", viral: true, image: IMG.clean },
  { id: 9, brand: "Sol de Janeiro", name: "Cheirosa 62 Ətirli Bədən Spreyi", category: "Ətir", price: 59, badge: "VİRAL QOXU", viral: true, image: IMG.perfume },
  { id: 10, brand: "Laneige", name: "Lip Sleeping Mask — Berry", category: "Dodaq", price: 38, badge: "GECƏ RUTİNİ", viral: true, image: IMG.lipstick },
  { id: 11, brand: "Saie", name: "Glow Sculpt Multi-Use Blush", category: "Makiyaj", price: 52, badge: "GLOW TREND", viral: true, image: IMG.makeup },
  { id: 12, brand: "By Terry", name: "Tea to Tan Hydra Bronze Mist", category: "Makiyaj", price: 89, badge: "İNDİ VİRAL", viral: true, image: IMG.skincare },
  { id: 13, brand: "Beauty of Joseon", name: "Relief Sun SPF50+ Günəş Kremi", category: "Dəriyə qulluq", price: 34, oldPrice: 39, badge: "BESTSELLER", viral: true, image: IMG.skincare },
  { id: 14, brand: "Anua", name: "Heartleaf 77% Sakitləşdirici Tonik", category: "Dəriyə qulluq", price: 41, badge: "K-BEAUTY TOP", viral: true, image: IMG.serum },
  { id: 15, brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", category: "Dəriyə qulluq", price: 26, badge: "TOP SEÇİM", image: IMG.dropper },
  { id: 16, brand: "The Ordinary", name: "UV Filters SPF 45 Serum", category: "Dəriyə qulluq", price: 36, badge: "2026 YENİ", viral: true, image: IMG.serum },
  { id: 17, brand: "Charlotte Tilbury", name: "Pillow Talk Matte Pomada", category: "Dodaq", price: 62, badge: "İKONİK", image: IMG.lipstick },
  { id: 18, brand: "Dior", name: "Addict Lip Glow Oil", category: "Dodaq", price: 78, badge: "LUXE FAVORİT", viral: true, image: IMG.lipstick },
  { id: 19, brand: "Fenty Beauty", name: "Gloss Bomb Universal Lip Luminizer", category: "Dodaq", price: 55, badge: "BESTSELLER", image: IMG.lipstick },
  { id: 20, brand: "Maybelline", name: "Lifter Gloss + Hyaluronic Acid", category: "Dodaq", price: 22, oldPrice: 27, badge: "BÜDCƏ DOSTU", image: IMG.lipstick },
  { id: 21, brand: "Yves Saint Laurent", name: "Libre Eau de Parfum 90 ml", category: "Ətir", price: 229, badge: "PREMİUM", image: IMG.perfume },
  { id: 22, brand: "Kayali", name: "Vanilla 28 Eau de Parfum", category: "Ətir", price: 195, badge: "VİRAL ƏTİR", viral: true, image: IMG.perfume },
  { id: 23, brand: "Burberry", name: "Goddess Eau de Parfum", category: "Ətir", price: 214, badge: "ÇOX SEVİLƏN", image: IMG.perfume },
  { id: 24, brand: "Carolina Herrera", name: "Good Girl Blush Elixir", category: "Ətir", price: 248, badge: "LUXE", image: IMG.perfume },
  { id: 25, brand: "Kérastase", name: "Elixir Ultime Saç Yağı", category: "Saç baxımı", price: 76, oldPrice: 84, badge: "−10%", image: IMG.hair },
  { id: 26, brand: "Ouai", name: "Detox Shampoo", category: "Saç baxımı", price: 59, badge: "SUMMER RESET", viral: true, image: IMG.hair },
  { id: 27, brand: "Olaplex", name: "No.7 Bonding Oil", category: "Saç baxımı", price: 61, badge: "SALON FAVORİTİ", image: IMG.hair },
  { id: 28, brand: "Color Wow", name: "Dream Coat Supernatural Spray", category: "Saç baxımı", price: 72, badge: "VİRAL SAÇ", viral: true, image: IMG.hair },
  { id: 29, brand: "TIRTIR", name: "Mask Fit Red Cushion SPF40", category: "Makiyaj", price: 47, badge: "K-BEAUTY VİRAL", viral: true, image: IMG.makeup },
  { id: 30, brand: "Huda Beauty", name: "Easy Bake Loose Powder", category: "Makiyaj", price: 67, badge: "BAKING FAVORİTİ", image: IMG.makeup },
  { id: 31, brand: "Milk Makeup", name: "Hydro Grip Primer", category: "Makiyaj", price: 64, badge: "UZUNMÜDDƏTLİ", image: IMG.makeup },
  { id: 32, brand: "One/Size", name: "On 'Til Dawn Setting Spray", category: "Makiyaj", price: 71, badge: "VİRAL FİKSATOR", viral: true, image: IMG.skincare },
  { id: 33, brand: "CeraVe", name: "Hydrating Facial Cleanser", category: "Dəriyə qulluq", price: 31, badge: "DERMA FAVORİT", image: IMG.clean },
  { id: 34, brand: "La Roche-Posay", name: "Cicaplast Baume B5+", category: "Dəriyə qulluq", price: 37, badge: "BARRIER CARE", image: IMG.skincare },
  { id: 35, brand: "Medicube", name: "Age-R Booster Pro", category: "Dəriyə qulluq", price: 489, badge: "VİRAL BEAUTY TECH", viral: true, image: IMG.clean },
  { id: 36, brand: "Dyson", name: "Airwrap Multi-Styler Complete", category: "Saç baxımı", price: 1499, badge: "18 AY KREDİT", image: IMG.hair },
  { id: 37, brand: "NARS", name: "Light Reflecting Foundation", category: "Makiyaj", price: 86, badge: "İPƏK KİMİ DƏRİ", viral: true, image: IMG.makeup },
  { id: 38, brand: "Hourglass", name: "Ambient Lighting Palette", category: "Makiyaj", price: 139, badge: "LUXE GLOW", image: IMG.makeup },
  { id: 39, brand: "Patrick Ta", name: "Major Headlines Blush Duo", category: "Makiyaj", price: 82, badge: "VİRAL DUO", viral: true, image: IMG.makeup },
  { id: 40, brand: "Summer Fridays", name: "Lip Butter Balm", category: "Dodaq", price: 49, badge: "VİRAL BALM", viral: true, image: IMG.lipstick },
  { id: 41, brand: "Drunk Elephant", name: "D-Bronzi Bronzing Drops", category: "Dəriyə qulluq", price: 69, badge: "TIKTOK VİRAL", viral: true, image: IMG.serum },
  { id: 42, brand: "Glow Recipe", name: "Watermelon Glow Dew Drops", category: "Dəriyə qulluq", price: 64, badge: "GLASS SKIN", viral: true, image: IMG.serum },
  { id: 43, brand: "K18", name: "Leave-In Molecular Repair Mask", category: "Saç baxımı", price: 109, badge: "SAÇ XİLASI", viral: true, image: IMG.hair },
  { id: 44, brand: "Gisou", name: "Honey Infused Hair Oil", category: "Saç baxımı", price: 78, badge: "VİRAL PARLAQLIQ", viral: true, image: IMG.hair },
  { id: 45, brand: "Giorgio Armani", name: "Sì Eau de Parfum", category: "Ətir", price: 245, badge: "İKONİK ƏTİR", image: IMG.perfume },
  { id: 46, brand: "Valentino", name: "Donna Born In Roma", category: "Ətir", price: 239, badge: "ÇOX SEVİLƏN", image: IMG.perfume },
  { id: 47, brand: "Ole Henriksen", name: "Pout Preserve Peptide Lip Treatment", category: "Dodaq", price: 39, badge: "VİRAL PEPTİD", viral: true, image: IMG.lipstick },
  { id: 48, brand: "Tower 28", name: "LipSoftie Tinted Lip Treatment", category: "Dodaq", price: 36, badge: "YUMŞAQ DODAQ", viral: true, image: IMG.lipstick }
];

const PRODUCT_SLUGS = [
  "rhode-pocket-blush", "rhode-glazing-milk", "rhode-peptide-lip-tint", "rare-beauty-soft-pinch",
  "elf-halo-glow", "byoma-phyto-mucin", "byoma-face-mist", "cosrx-snail-essence",
  "sol-de-janeiro-62", "laneige-lip-mask", "saie-glow-sculpt", "by-terry-tea-to-tan",
  "beauty-of-joseon-relief-sun", "anua-heartleaf-toner", "ordinary-niacinamide", "ordinary-uv-serum",
  "charlotte-tilbury-pillow-talk", "dior-lip-glow-oil", "fenty-gloss-bomb", "maybelline-lifter-gloss",
  "ysl-libre", "kayali-vanilla-28", "burberry-goddess", "good-girl-blush",
  "kerastase-elixir", "ouai-detox-shampoo", "olaplex-no7", "color-wow-dream-coat",
  "tirtir-red-cushion", "huda-easy-bake", "milk-hydro-grip", "one-size-setting-spray",
  "cerave-hydrating-cleanser", "lrp-cicaplast", "medicube-booster-pro", "dyson-airwrap",
  "nars-light-reflecting", "hourglass-ambient-palette", "patrick-ta-blush-duo", "summer-fridays-lip-butter",
  "drunk-elephant-bronzi", "glow-recipe-dew-drops", "k18-leave-in-mask", "gisou-hair-oil",
  "armani-si", "valentino-born-in-roma", "ole-henriksen-pout-preserve", "tower28-lipsoftie"
];

PRODUCTS.forEach((product, index) => {
  const slug = PRODUCT_SLUGS[index];
  const catalog = window.PRODUCT_IMAGES?.[slug];
  product.slug = slug;
  if (!catalog) return;
  product.image = catalog.image;
  product.name = catalog.matchedName;
  product.brand = catalog.brand;
  product.rating = catalog.rating;
  product.reviews = catalog.reviews;
  product.source = catalog.source;
});

const state = {
  category: "Hamısı",
  query: "",
  visible: 12,
  cart: JSON.parse(localStorage.getItem("kb-cart") || "{}")
};

const BUNDLES = {
  glow: {
    title: "Glass Skin Glow Set",
    tag: "🔥 TikTok viral",
    vibe: "glass",
    slugs: ["rhode-glazing-milk", "glow-recipe-dew-drops", "beauty-of-joseon-relief-sun", "laneige-lip-mask"],
    note: "Parlaq, canlı və baxımlı dəri effekti üçün səhər/axşam rutin."
  },
  luxe: {
    title: "Luxe Gift Set",
    tag: "Premium hədiyyə",
    vibe: "dark",
    slugs: ["ysl-libre", "dior-lip-glow-oil", "hourglass-ambient-palette"],
    note: "Ətir, dodaq parlaqlığı və luxe glow — hədiyyə üçün hazır kombin."
  },
  barrier: {
    title: "Clean Barrier Routine",
    tag: "Sızanaq / bariyer",
    vibe: "soft",
    slugs: ["cerave-hydrating-cleanser", "anua-heartleaf-toner", "lrp-cicaplast", "byoma-face-mist"],
    note: "Həssas, qızarmış və bariyeri zəifləmiş dəri üçün sakit rutin."
  },
  thinHair: {
    title: "Nazik Saçlar üçün Həcm Seti",
    tag: "Saç baxımı",
    vibe: "hair",
    slugs: ["ouai-detox-shampoo", "color-wow-dream-coat", "gisou-hair-oil", "olaplex-no7"],
    note: "Ağırlaşdırmadan parıltı, həcm və daha baxımlı saç görünüşü."
  },
  makeupBag: {
    title: "Bir Qızın Makiyaj Çantası",
    tag: "Daily makeup",
    vibe: "makeup",
    slugs: ["rare-beauty-soft-pinch", "charlotte-tilbury-pillow-talk", "milk-hydro-grip", "one-size-setting-spray", "fenty-gloss-bomb"],
    note: "Gündəlik çantada lazım olan primer, ənlik, dodaq və fiksator kombini."
  },
  dateNight: {
    title: "Date Night Glow Set",
    tag: "Gecə görünüşü",
    vibe: "date",
    slugs: ["kayali-vanilla-28", "dior-lip-glow-oil", "patrick-ta-blush-duo", "nars-light-reflecting"],
    note: "Qoxu, parıltı və yumşaq glam görünüşü üçün romantik seçim."
  },
  miniSpa: {
    title: "Ev Spa Rutin Seti",
    tag: "Self-care",
    vibe: "spa",
    slugs: ["laneige-lip-mask", "cosrx-snail-essence", "lrp-cicaplast", "k18-leave-in-mask"],
    note: "Axşam özünə qulluq ritualı: dodaq, dəri və saç baxımı bir yerdə."
  },
  summerBag: {
    title: "Yay Çantası Seti",
    tag: "Summer essentials",
    vibe: "summer",
    slugs: ["beauty-of-joseon-relief-sun", "sol-de-janeiro-62", "tower28-lipsoftie", "by-terry-tea-to-tan"],
    note: "SPF, bədən qoxusu, dodaq baxımı və yay glow-u üçün mini çanta seti."
  }
};

const grid = document.querySelector("#productGrid");
const emptyState = document.querySelector(".empty-state");
const drawer = document.querySelector(".cart-drawer");
const overlay = document.querySelector(".overlay");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartSummary = document.querySelector(".cart-summary");
const toast = document.querySelector(".toast");

function formatPrice(value) {
  return `${value.toFixed(0)} ₼`;
}

function productBySlug(slug) {
  return PRODUCTS.find(product => product.slug === slug);
}

function bundleProducts(bundle) {
  return bundle.slugs.map(productBySlug).filter(Boolean);
}

function bundleTotal(bundle) {
  return bundleProducts(bundle).reduce((sum, product) => sum + product.price, 0);
}

function productMiniHtml(product) {
  return `
    <figure class="mini-product">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <figcaption>
        <b>${product.brand}</b>
        <span>${product.name}</span>
      </figcaption>
    </figure>
  `;
}

function renderBundleCard(key, compact = false) {
  const bundle = BUNDLES[key];
  const products = bundleProducts(bundle);
  const total = bundleTotal(bundle);
  const monthly = total / 18;
  return `
    <article class="bundle-card ${bundle.vibe === "dark" ? "dark" : ""} vibe-${bundle.vibe}">
      <div class="bundle-3d" aria-hidden="true"><i></i><i></i><i></i></div>
      <span>${bundle.tag}</span>
      <h3>${bundle.title}</h3>
      <p>${bundle.note}</p>
      <div class="bundle-products ${compact ? "compact" : ""}">
        ${products.map(productMiniHtml).join("")}
      </div>
      <div class="bundle-price">
        <small>Aylıq ödəniş</small>
        <strong>${monthly.toFixed(2)} ₼</strong>
        <em>18 ay · ümumi ${formatPrice(total)}</em>
      </div>
      <div class="bundle-actions">
        <button data-bundle-add="${key}">Səbətə əlavə et</button>
        <button data-bundle-whatsapp="${key}">WhatsApp-la soruş</button>
      </div>
    </article>
  `;
}

function renderBundles() {
  const mainGrid = document.querySelector("#bundleGrid");
  const lifestyleGrid = document.querySelector("#lifestyleBundleGrid");
  if (mainGrid) mainGrid.innerHTML = ["glow", "luxe", "barrier"].map(key => renderBundleCard(key)).join("");
  if (lifestyleGrid) lifestyleGrid.innerHTML = ["thinHair", "makeupBag", "dateNight", "miniSpa", "summerBag"].map(key => renderBundleCard(key, true)).join("");
}

function addBundleToCart(key) {
  bundleProducts(BUNDLES[key]).forEach(product => {
    state.cart[product.id] = (state.cart[product.id] || 0) + 1;
  });
  renderCart();
  toast.textContent = "Set səbətə əlavə edildi";
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toast.textContent = "Məhsul səbətə əlavə edildi";
  }, 1800);
}

function bundleWhatsappMessage(key) {
  const bundle = BUNDLES[key];
  const products = bundleProducts(bundle);
  const total = bundleTotal(bundle);
  return `Salam, Kosmetik Baku! "${bundle.title}" seti ilə maraqlanıram.\n\nTərkib:\n${products.map((product, index) => `${index + 1}. ${product.brand} — ${product.name}`).join("\n")}\n\nAylıq ödəniş: ${(total / 18).toFixed(2)} ₼ × 18 ay\nÜmumi məbləğ: ${formatPrice(total)}\n\nMövcudluğu və uyğunluğunu təsdiqləyə bilərsiniz?`;
}

function renderProducts() {
  const query = state.query.trim().toLocaleLowerCase("az");
  const filtered = PRODUCTS.filter(product => {
    const inCategory = state.category === "Hamısı" || (state.category === "Viral" ? product.viral : product.category === state.category);
    const searchable = `${product.brand} ${product.name} ${product.category}`.toLocaleLowerCase("az");
    return inCategory && searchable.includes(query);
  });
  const visibleProducts = filtered.slice(0, state.visible);

  grid.innerHTML = visibleProducts.map(product => `
    <article class="product-card" data-product="${product.id}">
      <div class="product-image" data-view="${product.id}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="favorite" data-favorite="${product.id}" aria-label="Seçilmişlərə əlavə et">♡</button>
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <p class="product-brand">${product.brand}</p>
        <h3>${product.name}</h3>
        ${product.rating ? `<div class="rating-row"><span>★ ${product.rating.toFixed(1)}</span><small>${product.reviews.toLocaleString("az-AZ")} rəy</small></div>` : ""}
        <div class="price-row">
          <span class="price">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ""}
        </div>
        <div class="product-credit ${product.price < 50 ? "credit-cart-note" : ""}">
          <b>0%</b>
          <span>${product.price >= 50 ? `<strong>${(product.price / 18).toFixed(2)} ₼</strong> × 18 ay` : "Kredit üçün səbəti 50 ₼ et"}</span>
        </div>
        <div class="product-actions">
          <button class="card-add" data-add="${product.id}">Səbətə əlavə et</button>
          <button class="card-view" data-view="${product.id}">Ətraflı bax</button>
        </div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = filtered.length > 0;
  const loadMore = document.querySelector("#loadMore");
  loadMore.hidden = state.visible >= filtered.length;
  loadMore.innerHTML = `Daha çox məhsul göstər <span>↓</span> <small>${Math.min(state.visible, filtered.length)} / ${filtered.length}</small>`;
}

function saveCart() {
  localStorage.setItem("kb-cart", JSON.stringify(state.cart));
}

function cartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function renderCart() {
  const lines = Object.entries(state.cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: PRODUCTS.find(item => item.id === Number(id)), qty }))
    .filter(line => line.product);

  document.querySelectorAll(".cart-count").forEach(element => {
    element.textContent = cartCount();
  });

  cartItems.innerHTML = lines.map(({ product, qty }) => `
    <div class="cart-line">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <h4>${product.name}</h4>
        <p>${formatPrice(product.price)}</p>
        <div class="quantity">
          <button data-qty="${product.id}" data-change="-1" aria-label="Azalt">−</button>
          <span>${qty} ədəd</span>
          <button data-qty="${product.id}" data-change="1" aria-label="Artır">+</button>
        </div>
      </div>
      <button class="remove-item" data-remove="${product.id}" aria-label="Sil">×</button>
    </div>
  `).join("");

  const total = lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  document.querySelector(".cart-total").textContent = formatPrice(total);
  const monthly = document.querySelector(".cart-monthly");
  const creditNote = document.querySelector(".cart-credit-note");
  if (total >= 50 && total <= 5000) {
    monthly.textContent = `${(total / 18).toFixed(2)} ₼ × 18 ay`;
    creditNote.textContent = "Yalnız şəxsiyyət vəsiqəsi ilə";
  } else if (total > 5000) {
    monthly.textContent = "Limit 5 000 ₼";
    creditNote.textContent = "Kredit üçün səbəti 5 000 ₼-dək tənzimlə";
  } else {
    monthly.textContent = "—";
    creditNote.textContent = `${Math.max(0, 50 - total).toFixed(0)} ₼ əlavə et, kredit imkanı açılsın`;
  }
  cartEmpty.hidden = lines.length > 0;
  cartSummary.hidden = lines.length === 0;
  saveCart();
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function openCart() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

function whatsappUrl(message) {
  // Demo nömrəsi qəsdən əlavə edilməyib. Müştərinin real nömrəsi təhvil zamanı yazılır.
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    state.category = chip.dataset.category;
    state.visible = 12;
    document.querySelectorAll(".chip").forEach(item => item.classList.toggle("active", item === chip));
    renderProducts();
  });
});

document.querySelector(".view-all").addEventListener("click", () => {
  state.category = "Hamısı";
  state.visible = PRODUCTS.length;
  document.querySelectorAll(".chip").forEach(item => item.classList.toggle("active", item.dataset.category === "Hamısı"));
  renderProducts();
});

document.querySelector("#searchInput").addEventListener("input", event => {
  state.query = event.target.value;
  state.visible = 12;
  renderProducts();
});

document.querySelector("#loadMore").addEventListener("click", () => {
  state.visible += 12;
  renderProducts();
});

grid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  const viewButton = event.target.closest("[data-view]");
  if (addButton) addToCart(addButton.dataset.add);
  if (viewButton && !addButton && !favoriteButton) openProduct(Number(viewButton.dataset.view));
  if (favoriteButton) {
    favoriteButton.classList.toggle("active");
    favoriteButton.textContent = favoriteButton.classList.contains("active") ? "♥" : "♡";
  }
});

cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const id = quantityButton.dataset.qty;
    state.cart[id] = Math.max(0, (state.cart[id] || 0) + Number(quantityButton.dataset.change));
    if (!state.cart[id]) delete state.cart[id];
    renderCart();
  }
  if (removeButton) {
    delete state.cart[removeButton.dataset.remove];
    renderCart();
  }
});

document.querySelectorAll(".cart-button, .mobile-cart-trigger").forEach(button => button.addEventListener("click", openCart));
document.querySelector(".close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.querySelector(".checkout-button").addEventListener("click", () => {
  const lines = Object.entries(state.cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty], index) => {
      const product = PRODUCTS.find(item => item.id === Number(id));
      return `${index + 1}. ${product.name} — ${qty} ədəd × ${formatPrice(product.price)}`;
    });
  const total = Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS.find(item => item.id === Number(id));
    return sum + (product ? product.price * qty : 0);
  }, 0);
  const message = `Salam, Kosmetik Baku! Bu məhsulları sifariş etmək istəyirəm:\n\n${lines.join("\n")}\n\nCəmi: ${formatPrice(total)}\n\nÇatdırılma ünvanımı göndərəcəyəm.`;
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
});

document.querySelector(".whatsapp-link").href = whatsappUrl("Salam, Kosmetik Baku! Məhsul seçimi üçün məsləhət almaq istəyirəm.");

document.addEventListener("click", event => {
  const addBundle = event.target.closest("[data-bundle-add]");
  const whatsappBundle = event.target.closest("[data-bundle-whatsapp]");
  if (addBundle) addBundleToCart(addBundle.dataset.bundleAdd);
  if (whatsappBundle) window.open(whatsappUrl(bundleWhatsappMessage(whatsappBundle.dataset.bundleWhatsapp)), "_blank", "noopener,noreferrer");
});

const quiz = document.querySelector(".skin-quiz");
const quizResult = document.querySelector(".quiz-result");
const routineMap = {
  "Parlaq və canlı görünüş": {
    title: "Glow rutin",
    slugs: ["rhode-glazing-milk", "glow-recipe-dew-drops", "beauty-of-joseon-relief-sun", "laneige-lip-mask"],
    tip: "Səhər SPF, axşam nəmləndirici/glow serum ilə başla."
  },
  "Sızanaq və qızartı": {
    title: "Sakitləşdirici rutin",
    slugs: ["cerave-hydrating-cleanser", "anua-heartleaf-toner", "byoma-face-mist", "lrp-cicaplast"],
    tip: "Dərini yormadan bariyeri qoruyan məhsullar seç."
  },
  "Ləkə və ton bərabərliyi": {
    title: "Ton bərabərləşdirici rutin",
    slugs: ["ordinary-niacinamide", "beauty-of-joseon-relief-sun", "drunk-elephant-bronzi", "cosrx-snail-essence"],
    tip: "SPF bu rutinin əsas hissəsidir — ləkə rutinində gündəlik istifadə vacibdir."
  },
  "Quruluq və bariyer bərpası": {
    title: "Bariyer bərpa rutini",
    slugs: ["rhode-glazing-milk", "lrp-cicaplast", "cosrx-snail-essence", "laneige-lip-mask"],
    tip: "Aktivləri azaldıb nəmləndirmə və bariyer dəstəyinə fokuslan."
  }
};

if (quiz) {
  quiz.addEventListener("submit", event => {
    event.preventDefault();
    const skinType = document.querySelector("#skinType").value;
    const goal = document.querySelector("#skinGoal").value;
    const budget = document.querySelector("#skinBudget").value;
    const routine = routineMap[goal] || routineMap["Parlaq və canlı görünüş"];
    const products = routine.slugs.map(productBySlug).filter(Boolean);
    const total = products.reduce((sum, product) => sum + product.price, 0);
    quizResult.hidden = false;
    quizResult.innerHTML = `
      <span>Şəxsi rutin təklifi</span>
      <h3>${routine.title}</h3>
      <p><b>Dəri tipi:</b> ${skinType} · <b>Büdcə:</b> ${budget}</p>
      <div class="routine-products">${products.map(productMiniHtml).join("")}</div>
      <div class="routine-paybox"><small>Aylıq ödəniş</small><strong>${(total / 18).toFixed(2)} ₼</strong><em>18 ay · ümumi ${formatPrice(total)}</em></div>
      <p>${routine.tip}</p>
      <div class="quiz-actions">
        <button class="quiz-add" type="button">Rutini səbətə əlavə et</button>
        <button class="quiz-whatsapp" type="button">WhatsApp-la soruş</button>
      </div>
    `;
    quizResult.querySelector(".quiz-add").addEventListener("click", () => {
      products.forEach(product => {
        state.cart[product.id] = (state.cart[product.id] || 0) + 1;
      });
      renderCart();
      openCart();
    });
    quizResult.querySelector(".quiz-whatsapp").addEventListener("click", () => {
      const message = `Salam, Kosmetik Baku! Dəri testindən sonra mənə "${routine.title}" rutini təklif edildi.\n\nDəri tipim: ${skinType}\nMəqsədim: ${goal}\nBüdcəm: ${budget}\nTövsiyə olunan məhsullar:\n${products.map((product, index) => `${index + 1}. ${product.brand} — ${product.name}`).join("\n")}\n\nAylıq ödəniş: ${(total / 18).toFixed(2)} ₼ × 18 ay\nÜmumi məbləğ: ${formatPrice(total)}\n\nBu rutini mənim üçün təsdiqləyə bilərsiniz?`;
      window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    });
    quizResult.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const productModal = document.querySelector(".product-modal");
let activeProduct = null;
const benefitMap = {
  "Dəriyə qulluq": ["Gündəlik rutində rahat istifadə", "Dərinin daha baxımlı görünüşünə dəstək", "Orijinal məhsul zəmanəti"],
  "Makiyaj": ["Rahat tətbiq və müasir finish", "Gündəlik və xüsusi gün makiyajına uyğun", "Trend görünüşü daha asan yarat"],
  "Dodaq": ["Rahat və baxımlı hiss", "Çantada daşımaq üçün ideal", "Tək istifadə və ya makiyaj üzərinə uyğun"],
  "Ətir": ["Günün imza qoxusunu tamamla", "Hədiyyə üçün premium seçim", "Orijinal məhsul zəmanəti"],
  "Saç baxımı": ["Evdə salon rutini yarat", "Saçın baxımlı görünüşünə dəstək", "İstifadəsi rahat formula"]
};

function openProduct(id) {
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) return;
  activeProduct = product;
  productModal.querySelector("img").src = product.image;
  productModal.querySelector("img").alt = product.name;
  productModal.querySelector(".modal-product-brand").textContent = product.brand;
  productModal.querySelector(".modal-product-name").textContent = product.name;
  productModal.querySelector(".modal-rating").innerHTML = product.rating
    ? `<b>★ ${product.rating.toFixed(1)}</b><span>${product.reviews.toLocaleString("az-AZ")} real kataloq rəyi</span>`
    : "Yeni məhsul";
  productModal.querySelector(".modal-description").textContent =
    `${product.brand} markasının ən çox diqqət çəkən seçimlərindən biri. ${product.category} rutininə premium və rahat əlavə.`;
  productModal.querySelector(".modal-benefits").innerHTML = (benefitMap[product.category] || benefitMap.Makiyaj)
    .map(benefit => `<li>✓ ${benefit}</li>`).join("");
  productModal.querySelector(".modal-price").textContent = formatPrice(product.price);
  productModal.querySelector(".modal-installment").innerHTML = product.price >= 50
    ? `<b>0%</b> ${(product.price / 18).toFixed(2)} ₼ × 18 ay`
    : `<b>0%</b> Səbəti 50 ₼ et, kreditlə al`;
  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProduct() {
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
  activeProduct = null;
  document.body.style.overflow = "";
}

document.querySelector(".close-product").addEventListener("click", closeProduct);
productModal.addEventListener("click", event => {
  if (event.target === productModal) closeProduct();
});
document.querySelector(".modal-add").addEventListener("click", () => {
  if (!activeProduct) return;
  addToCart(activeProduct.id);
  closeProduct();
  openCart();
});
document.querySelector(".modal-buy-now").addEventListener("click", () => {
  if (!activeProduct) return;
  const message = `Salam, Kosmetik Baku! ${activeProduct.brand} — ${activeProduct.name} (${formatPrice(activeProduct.price)}) məhsulunu sifariş etmək istəyirəm. Mövcudluğu təsdiqləyə bilərsiniz?`;
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
});

const creditModal = document.querySelector(".credit-modal");
const creditAmount = document.querySelector("#creditAmount");
const creditRange = document.querySelector("#creditRange");
const monthlyPayment = document.querySelector("#monthlyPayment");
let selectedMonths = 18;

function clampCredit(value) {
  return Math.min(5000, Math.max(50, Number(value) || 50));
}

function updateCreditCalculator(value) {
  const amount = clampCredit(value);
  creditAmount.value = amount;
  creditRange.value = amount;
  monthlyPayment.textContent = `${(amount / selectedMonths).toFixed(2)} ₼`;
}

function getCartTotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS.find(item => item.id === Number(id));
    return sum + (product ? product.price * qty : 0);
  }, 0);
}

function openCredit() {
  const total = getCartTotal();
  updateCreditCalculator(total >= 50 && total <= 5000 ? total : 900);
  creditModal.classList.add("open");
  creditModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCredit() {
  creditModal.classList.remove("open");
  creditModal.setAttribute("aria-hidden", "true");
  if (!drawer.classList.contains("open")) document.body.style.overflow = "";
}

document.querySelectorAll(".credit-open").forEach(button => button.addEventListener("click", () => {
  closeCart();
  openCredit();
}));
document.querySelector(".close-credit").addEventListener("click", closeCredit);
creditModal.addEventListener("click", event => {
  if (event.target === creditModal) closeCredit();
});
creditAmount.addEventListener("input", event => updateCreditCalculator(event.target.value));
creditRange.addEventListener("input", event => updateCreditCalculator(event.target.value));
creditAmount.addEventListener("blur", event => updateCreditCalculator(event.target.value));
document.querySelectorAll("[data-month]").forEach(button => {
  button.addEventListener("click", () => {
    selectedMonths = Number(button.dataset.month);
    document.querySelectorAll("[data-month]").forEach(item => item.classList.toggle("active", item === button));
    updateCreditCalculator(creditAmount.value);
  });
});
document.querySelector(".credit-apply").addEventListener("click", () => {
  const amount = clampCredit(creditAmount.value);
  const message = `Salam, Kosmetik Baku! ${formatPrice(amount)} məbləğində alış üçün ${selectedMonths} aylıq 0% faizli kredit imkanı ilə maraqlanıram. Aylıq ödəniş təxminən ${(amount / selectedMonths).toFixed(2)} ₼-dir. Müraciət qaydalarını göndərə bilərsiniz?`;
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeCredit();
    closeProduct();
  }
});

document.querySelector(".search-toggle").addEventListener("click", () => {
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => document.querySelector("#searchInput").focus(), 500);
});

document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".mobile-nav a").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

renderBundles();
renderProducts();
renderCart();
