import fs from "node:fs/promises";
import path from "node:path";

const products = [
  ["rhode-pocket-blush", "Rhode Pocket Blush"],
  ["rhode-glazing-milk", "Rhode Glazing Milk"],
  ["rhode-peptide-lip-tint", "Rhode Peptide Lip Tint"],
  ["rare-beauty-soft-pinch", "Rare Beauty Soft Pinch Liquid Blush"],
  ["elf-halo-glow", "Charlotte Tilbury Hollywood Flawless Filter"],
  ["byoma-phyto-mucin", "The Ordinary Soothing Barrier Support Serum"],
  ["byoma-face-mist", "Tower 28 SOS Daily Rescue Facial Spray"],
  ["cosrx-snail-essence", "Dr Jart Ceramidin Skin Barrier Moisturizing Cream"],
  ["sol-de-janeiro-62", "Sol de Janeiro Cheirosa 62"],
  ["laneige-lip-mask", "Laneige Lip Sleeping Mask Berry"],
  ["saie-glow-sculpt", "Saie Dew Blush Liquid Cream Blush"],
  ["by-terry-tea-to-tan", "Isle of Paradise Self Tanning Water"],
  ["beauty-of-joseon-relief-sun", "Supergoop Unseen Sunscreen SPF 40"],
  ["anua-heartleaf-toner", "Glow Recipe Cloudberry Bright Essence Toner"],
  ["ordinary-niacinamide", "The Ordinary Niacinamide 10 Zinc 1"],
  ["ordinary-uv-serum", "Supergoop Glowscreen SPF 40"],
  ["charlotte-tilbury-pillow-talk", "Charlotte Tilbury Pillow Talk Matte Revolution"],
  ["dior-lip-glow-oil", "Dior Addict Lip Glow Oil"],
  ["fenty-gloss-bomb", "Fenty Beauty Gloss Bomb"],
  ["maybelline-lifter-gloss", "Makeup by Mario MoistureGlow Plumping Lip Serum"],
  ["ysl-libre", "YSL Libre Eau de Parfum"],
  ["kayali-vanilla-28", "Kayali Vanilla 28"],
  ["burberry-goddess", "Burberry Goddess Eau de Parfum"],
  ["good-girl-blush", "Carolina Herrera Good Girl Blush"],
  ["kerastase-elixir", "Kerastase Elixir Ultime Hair Oil"],
  ["ouai-detox-shampoo", "OUAI Detox Shampoo"],
  ["olaplex-no7", "Olaplex No 7 Bonding Oil"],
  ["color-wow-dream-coat", "Color Wow Dream Coat"],
  ["tirtir-red-cushion", "Laura Mercier Translucent Loose Setting Powder"],
  ["huda-easy-bake", "Huda Beauty Easy Bake Loose Powder"],
  ["milk-hydro-grip", "Milk Makeup Hydro Grip Primer"],
  ["one-size-setting-spray", "ONE SIZE On Til Dawn Setting Spray"],
  ["cerave-hydrating-cleanser", "Youth To The People Superfood Cleanser"],
  ["lrp-cicaplast", "AESTURA ATOBARRIER365 Cream"],
  ["medicube-booster-pro", "NuFACE MINI Facial Toning Device"],
  ["dyson-airwrap", "Dyson Airwrap Multi Styler"],
  ["nars-light-reflecting", "NARS Light Reflecting Foundation"],
  ["hourglass-ambient-palette", "Hourglass Ambient Lighting Palette"],
  ["patrick-ta-blush-duo", "Patrick Ta Major Headlines Blush Duo"],
  ["summer-fridays-lip-butter", "Summer Fridays Lip Butter Balm"],
  ["drunk-elephant-bronzi", "Drunk Elephant D-Bronzi Drops"],
  ["glow-recipe-dew-drops", "Glow Recipe Watermelon Glow Dew Drops"],
  ["k18-leave-in-mask", "K18 Leave In Molecular Repair Hair Mask"],
  ["gisou-hair-oil", "Gisou Honey Infused Hair Oil"],
  ["armani-si", "Giorgio Armani Si Eau de Parfum"],
  ["valentino-born-in-roma", "Valentino Donna Born In Roma"],
  ["ole-henriksen-pout-preserve", "Ole Henriksen Pout Preserve"],
  ["tower28-lipsoftie", "Tower 28 LipSoftie"]
];

const outputDir = path.resolve("assets/products");
await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const output = {};
const report = [];

for (let index = 0; index < products.length; index += 1) {
  const [slug, query] = products[index];
  try {
    const response = await fetch(
      `https://www.sephora.com/api/v2/catalog/search/?q=${encodeURIComponent(query)}&type=keyword`,
      { headers: { "user-agent": "Mozilla/5.0" } }
    );
    const data = await response.json();
    const product = data.products?.[0];
    if (!product?.heroImage) throw new Error("No matching catalog product");

    const imageUrl = product.heroImage
      .replace(/imwidth=\d+/, "imwidth=900")
      .replace(/&pb=[^&]+/, "");
    const imageResponse = await fetch(imageUrl, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!imageResponse.ok) throw new Error(`Image ${imageResponse.status}`);

    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    const filename = `${String(index + 1).padStart(2, "0")}-${slug}.jpg`;
    await fs.writeFile(path.join(outputDir, filename), bytes);
    output[slug] = {
      image: `assets/products/${filename}`,
      matchedName: product.productName,
      brand: product.brandName,
      rating: Number(product.rating || 0),
      reviews: Number(product.reviews || 0),
      source: `https://www.sephora.com${product.targetUrl || ""}`
    };
    report.push({ slug, query, status: "ok", ...output[slug] });
    console.log(`${index + 1}/${products.length} ${query} -> ${product.productName}`);
  } catch (error) {
    report.push({ slug, query, status: "error", error: error.message });
    console.log(`${index + 1}/${products.length} ${query} -> ERROR: ${error.message}`);
  }
}

await fs.writeFile(path.join(outputDir, "sources.json"), JSON.stringify(report, null, 2));
await fs.writeFile(
  path.resolve("product-images.js"),
  `window.PRODUCT_IMAGES = ${JSON.stringify(output, null, 2)};\n`
);
console.log(`Downloaded ${Object.keys(output).length}/${products.length} verified catalog images.`);
