const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8082;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

app.use("/assets", express.static(path.join(__dirname, "assets"), {
  maxAge: "7d",
  etag: true
}));

const categories = [
  { slug: "fotoqraflar", seoSlug: "toy-fotoqrafi", name: "Fotoqraflar", icon: "📷", count: 126, text: "Toyunuzun ən gözəl anlarını peşəkar kadrlara çevirin." },
  { slug: "mekanlar", seoSlug: "toy-mekanlari", name: "Məkanlar", icon: "🏛️", count: 90, text: "Zövqünüzə və qonaq sayınıza uyğun məkanı seçin." },
  { slug: "dekoratorlar", seoSlug: "toy-dekoratoru", name: "Dekoratorlar", icon: "🌸", count: 97, text: "Konseptinizə uyğun dekor və çiçək həlləri tapın." },
  { slug: "dj-musiqi", seoSlug: "toy-dj", name: "DJ və musiqi", icon: "🎧", count: 63, text: "Gecənin ritmini peşəkar musiqiçilərə həvalə edin." },
  { slug: "apricilar", seoSlug: "toy-aparicisi", name: "Aparıcılar", icon: "🎙️", count: 52, text: "Tədbirin axarını canlı və yaddaqalan edin." },
  { slug: "catering", seoSlug: "toy-catering", name: "Catering", icon: "🍽️", count: 41, text: "Menyu, servis və təqdimatı bir yerdə planlayın." },
  { slug: "makiyaj-sac", seoSlug: "gelin-makiyaji", name: "Makiyaj və saç", icon: "💄", count: 38, text: "Gəlin, nişan və ziyafət üçün vizajist və saç ustası tapın." },
  { slug: "mugenniler", seoSlug: "toy-mugennileri", name: "Müğənnilər", icon: "🎤", count: 25, text: "Toy və tədbiriniz üçün müğənnilərin çıxış qiymətlərini müqayisə edin." }
];

function singerProvider(slug, name, price, duration = null, currency = "AZN") {
  const priceText = `${new Intl.NumberFormat("az-AZ").format(price)} ${currency === "USD" ? "$" : "₼"}`;
  return {
    slug,
    name,
    category: "mugenniler",
    city: "Bakı",
    district: "Bakı",
    rating: 0,
    reviews: 0,
    price,
    priceCurrency: currency,
    badge: duration || "Toy proqramı",
    initialsCover: true,
    description: `${name} üçün toy və tədbir çıxışı${duration ? ` — ${duration}` : ""}.`,
    services: ["Toy çıxışı", duration || "Müddət dəqiqləşdirilməlidir", "Canlı proqram", "Qiymət öncədən təsdiqlənməlidir"],
    priceOffers: [{
      title: duration ? `Toy proqramı — ${duration}` : "Toy proqramı",
      price: priceText,
      featured: true,
      items: [
        `${name} tərəfindən toy və ya tədbir çıxışı`,
        duration ? `Elan edilən çıxış müddəti: ${duration}` : "Çıxış müddəti xidmət sahibindən dəqiqləşdirilməlidir",
        "Tarix, məkan və proqram şərtləri qiymətə təsir edə bilər"
      ]
    }],
    pricingNote: `Qiymət açıq sosial media paylaşımından götürülüb${currency === "USD" ? " və ABŞ dolları ilə göstərilib" : ""}. Rezervasiyadan əvvəl cari qiyməti təsdiqləyin.`
  };
}

function hotelMenuProvider(slug, name, minPrice, maxPrice, badge = "Otel menyusu") {
  return {
    slug,
    name,
    category: "mekanlar",
    city: "Bakı",
    district: "Bakı",
    rating: 0,
    reviews: 0,
    price: minPrice,
    priceSuffix: ` – ${maxPrice} ₼ / nəfər`,
    badge,
    initialsCover: true,
    description: `${name} üçün toy və ziyafət menyusu qiymət aralığı: ${minPrice}–${maxPrice} ₼ / nəfər.`,
    services: ["Toy menyusu", "Ziyafət menyusu", "Otel məkanı", "Yekun menyu və tarix üzrə təsdiq"],
    priceOffers: [{
      title: "Toy və ziyafət menyusu",
      price: `${minPrice}–${maxPrice} ₼ / nəfər`,
      featured: true,
      items: [
        "Menyu qiyməti qonaq sayına və seçilən paketə görə dəyişə bilər",
        "Zal, servis və əlavə dekor şərtləri ayrıca dəqiqləşdirilməlidir",
        "Rezervasiyadan əvvəl hotel ilə cari qiymət təsdiqlənməlidir"
      ]
    }],
    pricingNote: "Qiymətlər sosial media paylaşımındakı otel toy menyusu aralığı əsasında əlavə edilib. Cari mövcudluq, tarix və paket tərkibi üzrə hotel ilə yenidən təsdiqləyin."
  };
}

const providers = [
  singerProvider("nadir-qafarzade", "Nadir Qafarzadə", 10000),
  singerProvider("metanet-isgenderli", "Mətanət İsgəndərli", 10000),
  singerProvider("elnare-abdullayeva", "Elnarə Abdullayeva", 12000),
  singerProvider("xatun", "Xatun", 9000),
  singerProvider("almaxanim", "Almaxanım", 10000),
  singerProvider("manana", "Manana", 4000, "30 dəqiqə"),
  singerProvider("tunzale-agayeva", "Tünzalə Ağayeva", 5000, "30 dəqiqə"),
  singerProvider("hiss", "Hiss", 5000, "30 dəqiqə"),
  singerProvider("gunay-ibrahimli", "Günay İbrahimli", 12000, "Ansambl ilə"),
  singerProvider("elnur-huseynov", "Elnur Hüseynov", 4000, "30 dəqiqə"),
  singerProvider("xatire-islam", "Xatirə İslam", 4000, "30 dəqiqə"),
  singerProvider("damla", "Damla", 4000, "30 dəqiqə"),
  singerProvider("nazperi-dosteliyeva", "Nazpəri Dostəliyeva", 6000, "1 saat"),
  singerProvider("gulyanaq-gulyaz", "Gülyanaq və Gülyaz bacıları", 10000, "30 dəqiqə"),
  singerProvider("metanet-esedova", "Mətanət Əsədova", 3000, "30 dəqiqə"),
  singerProvider("kemale-gunesli", "Kəmalə Günəşli", 1000, "30 dəqiqə"),
  singerProvider("ayaz-babayev", "Ayaz Babayev", 3000, "30 dəqiqə"),
  singerProvider("nefes-memmedli", "Nəfəs Məmmədli", 4000, "30 dəqiqə"),
  singerProvider("aysun-ismayilova", "Aysun İsmayılova", 3500, "30 dəqiqə"),
  singerProvider("vefa-serifova", "Vəfa Şərifova", 4000, "30 dəqiqə"),
  singerProvider("zamiq", "Zamiq", 14000),
  singerProvider("nuri-serinlendirici", "Nuri Sərinləndirici", 13000, null, "USD"),
  singerProvider("abbas-bagirov", "Abbas Bağırov", 18000),
  singerProvider("samir-piriyev", "Samir Piriyev", 12000),
  singerProvider("brilliant-dadasova", "Brilliant Dadaşova", 8000, "30 dəqiqə"),
  {
    slug: "hamidli-hamid",
    name: "Həmidli Həmid",
    category: "fotoqraflar",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 1200,
    badge: "Foto & 4K video",
    instagram: "https://www.instagram.com/hamidlihamid/",
    image: "/assets/avatars/hamidli-hamid.jpg",
    instagramAvatar: true,
    description: "Toy foto çəkilişi, qısametrajlı film, 23:00-da Live təqdimat və 6 kamera ilə tam sinxron 4K video çəkilişi.",
    services: ["Toy foto çəkilişi", "Qısametrajlı film", "Live təqdimat", "6 kameralı 4K video"],
    priceOffers: [
      {
        title: "Həmid bəylə toy foto çəkilişi",
        price: "3.500 ₼",
        items: [
          "Otel və ya seçilmiş məkanda çəkiliş",
          "Oğlan evi, qız evi və restoran çəkilişi",
          "300 ₼ dəyərində albom hədiyyə",
          "Reels videolar"
        ]
      },
      {
        title: "Komanda ilə foto çəkilişi",
        price: "1.200 ₼",
        items: [
          "Həmid bəy iştirak edə bilmədikdə peşəkar komanda çəkilişi",
          "Reels videolar",
          "Albom"
        ]
      },
      {
        title: "Foto və qısametrajlı film",
        price: "5.000 ₼",
        items: [
          "Peşəkar toy foto çəkilişi",
          "Toyun ən özəl anlarından hazırlanmış qısametrajlı film",
          "Montaj olunaraq saat 23:00-da monitorlarda təqdimat"
        ]
      },
      {
        title: "6 kameralı sinxron 4K video",
        price: "7.000 ₼",
        items: [
          "Toyun əvvəlindən sonuna qədər tam video çəkilişi",
          "6 kamera ilə 4K çəkiliş",
          "DSLR kameralar, kran və dron",
          "Digər stabilizasiya qurğuları"
        ]
      },
      {
        title: "Tam paket",
        price: "12.000 ₼",
        featured: true,
        items: [
          "Foto çəkilişi",
          "Qısametrajlı film",
          "Toyun tam sinxron video çəkilişi"
        ]
      }
    ],
    pricingNote: "Paketləri birlikdə və ya ayrı-ayrılıqda seçmək mümkündür."
  },
  {
    slug: "perimakeup",
    name: "Peri Makeup",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Kaftan Beauty Baku",
    rating: 5.0,
    reviews: 0,
    price: 400,
    badge: "Full gəlin paketi",
    instagram: "https://www.instagram.com/perimakeup_/",
    image: "/assets/avatars/perimakeup.jpg",
    instagramAvatar: true,
    description: "Gəlinlər üçün saç, makiyaj, kirpik, linza, aksesuar və sinə tonlaşdırması daxil tam hazırlıq xidməti.",
    services: ["Saç və makiyaj", "Özəl kirpik və linza", "Tac və saç aksesuarı", "Sinə tonlaşdırması"],
    priceOffers: [
      {
        title: "Sadə gəlin paketi",
        price: "400 ₼",
        items: ["Saç düzümü", "Vizaj", "Saç aksesuarı"]
      },
      {
        title: "Full gəlin paketi",
        price: "500 ₼",
        featured: true,
        items: ["Saç və makiyaj", "Özəl kirpiklər", "Linza", "Saç düzümü", "Tac və saç aksesuarı", "Sinə tonlaşdırması"]
      }
    ],
    pricingNote: "Ünvan: Kaftan Beauty Baku — K. Səfərəliyeva 45C, S. Vurğun bağının arxası."
  },
  {
    slug: "solimakeup",
    name: "Soli Makeup",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 350,
    badge: "Gəlin və nişan",
    instagram: "https://www.instagram.com/solimakeeup/",
    image: "/assets/avatars/solimakeup.jpg",
    instagramAvatar: true,
    description: "Həri, nişan, xına, nikah və gəlin üçün makiyaj, saç, linza, tonlaşdırma və aksesuar paketləri.",
    services: ["Makiyaj", "Saç düzümü", "Linza və tonlaşdırma", "Əl üçün ağ xına"],
    priceOffers: [
      {
        title: "Həri, nişan, xına və nikah",
        price: "350 ₼",
        items: ["Makiyaj", "Sinə tonlaşdırması", "Saç düzümü", "Bəzi kiçik saç aksesuarları", "Saç ustaları: Nigar, Rəqsanə və İnara"]
      },
      {
        title: "Gəlin paketi",
        price: "400 ₼",
        featured: true,
        items: ["Makiyaj", "Linza", "Sinə tonlaşdırması", "Saç düzümü", "Əlavə saç qoyulması", "Bəzi kiçik saç aksesuarları"]
      },
      {
        title: "Əl üçün ağ xına",
        price: "30 ₼-dən",
        items: ["Bir əl: 30–40 ₼", "İki əl: 50–60 ₼"]
      }
    ],
    pricingNote: "Saç ustası kimi Nigar xanım seçildikdə hər paketə əlavə 50 ₼ hesablanır."
  },
  {
    slug: "hesenli-sona",
    name: "Həsənli Sona",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 500,
    badge: "3D gəlin paketi",
    instagram: "https://www.instagram.com/hesenli_sona/",
    image: "/assets/avatars/hesenli-sona.jpg",
    instagramAvatar: true,
    description: "3D texnika ilə gəlin makiyajı, peşəkar saç düzümü, 3D kirpiklər və tam görünüş hazırlığı.",
    services: ["Peşəkar saç düzümü", "3D makiyaj və kirpik", "Əlavə saç", "Tac və sinə tonlaşdırması"],
    priceOffers: [
      {
        title: "Gəlin paketi",
        price: "500 ₼",
        featured: true,
        items: ["Peşəkar saç düzümü", "3D texnika ilə makiyaj", "3D kirpiklər", "Ehtiyac olduqda əlavə saç", "Tac və ya uyğun aksesuar", "Sinə nahiyəsinin tonlaşdırılması"]
      }
    ]
  },
  {
    slug: "stilist-melek",
    name: "Stilist Mələk",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 150,
    badge: "Saç stilisti",
    instagram: "https://www.instagram.com/stilistmelek/",
    image: "/assets/avatars/stilist-melek.jpg",
    instagramAvatar: true,
    description: "Həri, nişan, nikah və gəlin üçün saç düzümləri, əlavə saç və aksesuar seçimləri.",
    services: ["Həri saç düzümü", "Nişan saç düzümü", "Nikah saç düzümü", "Gəlin saç düzümü"],
    priceOffers: [
      { title: "Həri, nişan və nikah saç düzümü", price: "150 ₼", items: ["Tədbir üçün fərdi saç düzümü"] },
      { title: "Gəlin saç düzümü", price: "200 ₼", featured: true, items: ["Gəlin üçün saç düzümü", "Əlavə saç və aksesuar ayrıca ödənişlidir"] }
    ]
  },
  {
    slug: "sura-huseyn",
    name: "Sura Hüseyn",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 150,
    badge: "Saç & makiyaj",
    instagram: "https://www.instagram.com/surahusein/",
    image: "/assets/avatars/sura-huseyn.jpg",
    instagramAvatar: true,
    description: "Həri, nişan, ZAQS, xına və gəlin üçün saç-makiyaj, linza və bədən tonlaşdırması xidmətləri.",
    services: ["Tədbir makiyajı", "Saç düzümü", "Linza və bədən tonu", "Gəlin paketi"],
    priceOffers: [
      {
        title: "Həri, nişan, ZAQS və xına makiyajı",
        price: "300 ₼",
        items: ["Makiyaj", "Linza", "Bədən tonu"]
      },
      {
        title: "Saç düzümü",
        price: "150 ₼",
        items: ["Tədbir üçün saç düzümü"]
      },
      {
        title: "Gəlin paketi",
        price: "700 ₼",
        featured: true,
        items: ["Saç düzümü", "Gəlin makiyajı", "Linza", "Sinə və çiyin tonlaşdırması"]
      },
      {
        title: "Əlavə seçimlər",
        price: "10 ₼-dən",
        items: ["Tac və saç aksesuarları: 30–100 ₼", "Qoyma saç: hər saç üçün əlavə 10 ₼"]
      }
    ],
    pricingNote: "Linza və ya bədən tonu paketdən çıxarılsa qiymət dəyişmir. Tac, saç aksesuarları və qoyma saç paketə daxil deyil."
  },
  {
    slug: "sameddin-ceferli",
    name: "Saməddin Cəfərli",
    category: "fotoqraflar",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 1300,
    badge: "Toy foto çəkilişi",
    instagram: "https://www.instagram.com/sameddin_photographer/",
    image: "/assets/avatars/sameddin-ceferli.jpg",
    instagramAvatar: true,
    description: "Bəy və gəlin üçün gözəllik salonu, ev, restoran və seçilmiş açıq və ya qapalı məkanda toy foto çəkilişi.",
    services: ["Bəy-gəlin çəkilişi", "Gözəllik salonu", "Qız və oğlan evi", "Restoran və seçilmiş məkan"],
    priceOffers: [
      {
        title: "Toy foto çəkilişi",
        price: "1.300 ₼",
        featured: true,
        items: ["Bəy və gəlin çəkilişi", "Gözəllik salonunda çəkiliş", "Restoranda çəkiliş", "Qız və oğlan evində çəkiliş", "Otel, muzey, park və ya digər seçilmiş məkan"]
      }
    ]
  },
  {
    slug: "yaya-edelss",
    name: "Yaya Edelss",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 500,
    badge: "Fərdi gəlin xidməti",
    instagram: "https://www.instagram.com/yaya_edelss/",
    image: "/assets/avatars/yaya-edelss.jpg",
    instagramAvatar: true,
    description: "Yeganə xanım tərəfindən şəxsən icra edilən, eyni vaxtda başqa müştəri qəbul edilməyən tam fərdi gəlin hazırlığı.",
    services: ["Peşəkar saç düzümü", "3D makiyaj və kirpik", "Əlavə saç və aksesuar", "Sinə tonlaşdırması"],
    priceOffers: [
      {
        title: "Tam fərdi gəlin paketi",
        price: "500 ₼",
        featured: true,
        items: ["Peşəkar saç düzümü", "3D texnika ilə makiyaj və 3D kirpiklər", "Ehtiyac olduqda əlavə saç", "Tac və ya uyğun aksesuar", "Sinə nahiyəsinin tonlaşdırılması", "Makiyajın şəxsən Yeganə xanım tərəfindən icrası", "Eyni vaxtda başqa müştəri qəbul edilməyən fərdi xidmət"]
      }
    ],
    pricingNote: "Bu qiymət 20 iyun 2026-dək qeydiyyat üçün elan edilmiş kampaniyadan götürülüb. Cari qiymət xidmət təminatçısından dəqiqləşdirilməlidir."
  },
  {
    slug: "kengerli-media",
    name: "Kengerli Media",
    category: "fotoqraflar",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 9000,
    badge: "Cinematic wedding",
    instagram: "https://www.instagram.com/kengerlimedia/",
    image: "/assets/avatars/kengerli-media.jpg",
    instagramAvatar: true,
    description: "Cəlal Kəngərlinin müəllif yanaşması ilə cinematic toy filmi, günboyu foto çəkilişi, Live Video və premium təqdimat xidmətləri.",
    services: ["Cinematic Highlight Film", "Günboyu foto çəkilişi", "Live Video", "Wedding Reels Collection"],
    priceOffers: [
      {
        title: "The Kengerli Signature",
        price: "9.000 ₼",
        featured: true,
        items: [
          "Toyun yaddaqalan anlarından hazırlanmış 12–15 dəqiqəlik Cinematic Highlight Film",
          "Günboyu bəy və gəlinin özəl foto çəkilişi",
          "Ailə üzvləri üçün əlavə fotoqraf",
          "Əvvəlcədən hazırlanmış ssenari və AI əlavələri ilə Live Video",
          "Peşəkar videoqraflar tərəfindən Wedding Reels Collection",
          "Materialların özəl platformada təqdimatı",
          "Albom və çərçivə dəsti, 2 ədəd hard disk"
        ]
      },
      {
        title: "Royal Wedding — Full Photo & Video",
        price: "16.000 ₼",
        items: [
          "12–15 dəqiqəlik Cinematic Highlight Film",
          "Günboyu bəy-gəlin və ailə foto çəkilişi",
          "Toy gününün tam və fasiləsiz sinxron videosu",
          "Peşəkar cinematic film kameraları ilə çəkiliş",
          "Ssenari və AI əlavələri ilə Live Video",
          "Peşəkar Wedding Reels Collection",
          "Private Gallery və Premium Delivery",
          "Hazır materialların 2 ədəd hard diskdə təhvili"
        ]
      },
      {
        title: "Wedding Film Collection — Full Video",
        price: "13.000 ₼",
        items: [
          "12–15 dəqiqəlik Cinematic Highlight Film",
          "Toy gününün tam və fasiləsiz sinxron videosu",
          "Peşəkar cinematic film kameraları ilə çəkiliş",
          "Ssenari və AI əlavələri ilə Live Video",
          "Peşəkar Wedding Reels Collection",
          "Private Gallery və Premium Delivery",
          "Hazır materialların 2 ədəd hard diskdə təhvili"
        ]
      }
    ],
    pricingNote: "Paket məlumatları Kengerli Media Mərkəzinin təqdim etdiyi materiallar əsasında yerləşdirilib."
  },
  {
    slug: "vecimakeup",
    name: "Veci Makeup",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 400,
    badge: "Gəlin və nişan",
    instagram: "https://www.instagram.com/vecimakeup/",
    image: "/assets/avatars/vecimakeup.jpg",
    instagramAvatar: true,
    description: "Həri, nişan, xına, nikah və gəlin üçün makiyaj, saç, sinə tonlaşdırması və əlavə saç daxil tam hazırlıq paketləri.",
    services: ["Makiyaj", "Saç düzümü", "Sinə tonlaşdırması", "Əlavə saç və aksesuarlar"],
    priceOffers: [
      {
        title: "Həri, nişan, xına və nikah paketi",
        price: "400 ₼",
        items: ["Makiyaj", "Sinə tonlaşdırması", "Saç düzümü", "Əlavə saç qoyulması", "Bəzi kiçik ölçülü saç aksesuarları"]
      },
      {
        title: "Gəlin paketi",
        price: "700 ₼",
        featured: true,
        items: ["Makiyaj", "Linza", "Sinə tonlaşdırması", "Saç düzümü", "Əlavə saç qoyulması", "Bəzi kiçik ölçülü saç aksesuarları"]
      },
      {
        title: "Əl xınası",
        price: "30 ₼-dən",
        items: ["Bir əl: 30–40 ₼", "İki əl: 50–60 ₼"]
      }
    ],
    pricingNote: "Paketdə qeyd olunan xidmətlərdən hər hansı biri çıxarılsa, paketin qiyməti dəyişmir."
  },
  {
    slug: "mahbube-memmedli",
    name: "Mahbubə Məmmədli",
    category: "makiyaj-sac",
    city: "Bakı",
    district: "JW Marriott",
    rating: 5.0,
    reviews: 0,
    price: 150,
    badge: "Intrigue Baku",
    instagram: "https://www.instagram.com/mahabibaa/",
    image: "/assets/avatars/mahbube-memmedli.jpg",
    instagramAvatar: true,
    description: "Ziyafət, nişan, xına və gəlin üçün peşəkar makiyaj və saç xidməti. Intrigue Baku, JW Marriott.",
    services: ["Ziyafət makiyajı", "Nişan və xına", "Gəlin makiyajı", "Gəlin saç və makiyajı"],
    priceOffers: [
      { title: "Ziyafət makiyajı", price: "150–170 ₼", items: ["Tədbir və ziyafətlər üçün makiyaj"] },
      { title: "Nişan və xına", price: "300 ₼", items: ["Nişan və xına mərasimi üçün makiyaj"] },
      { title: "Tək gəlin makiyajı", price: "500 ₼", items: ["Gəlin üçün yalnız makiyaj xidməti"] },
      { title: "Gəlin saç və makiyaj", price: "700 ₼", featured: true, items: ["Gəlin makiyajı", "Gəlin saç düzümü"] }
    ],
    pricingNote: "Xidmət ünvanı: Intrigue Baku, JW Marriott."
  },
  {
    slug: "niko-abbasov",
    name: "Niko Abbasov",
    category: "fotoqraflar",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 1500,
    badge: "Sony FX3 · 4K",
    instagram: "https://www.instagram.com/nikoabbasov/",
    image: "/assets/avatars/niko-abbasov.jpg",
    instagramAvatar: true,
    description: "Toy günü foto çəkilişi, qısametrajlı Live video klip və 6 kameralı tam sinxron 4K video çəkilişi.",
    services: ["Toy fotosessiyası", "Live video klip", "6 kamera ilə 4K çəkiliş", "FPV dron və 360° kran"],
    priceOffers: [
      {
        title: "Toy foto çəkilişi",
        price: "3.000 ₼",
        items: [
          "Seçilmiş məkanda — otel, muzey və digər lokasiyalarda fotosessiya",
          "Qız evi və oğlan evi çəkilişi",
          "Toyun sonuna qədər çəkiliş",
          "İşlənmiş fotoların disk və albom formasında təhvili"
        ]
      },
      {
        title: "Video klip və Live təqdimat",
        price: "1.500 ₼",
        items: [
          "Gün boyu video klip çəkilişi",
          "Toy günü qonaqlar üçün 3–4 dəqiqəlik Live versiya",
          "Daha sonra 4–7 dəqiqəlik geniş formatda təhvil"
        ]
      },
      {
        title: "6 kameralı sinxron 4K çəkiliş",
        price: "4.500 ₼",
        featured: true,
        items: [
          "Toyun əvvəlindən sonuna qədər tam sinxron çəkiliş",
          "6 ədəd yeni nəsil Sony FX3 kamera",
          "1 FPV dron və 360 dərəcəlik kran",
          "Stedicam, 2 Ronin və 1 ştativ kamera",
          "4K çəkilişin flaş daşıyıcıda təhvili"
        ]
      }
    ]
  },
  {
    slug: "zeynal-memmedli",
    name: "Zeynal Məmmədli",
    category: "fotoqraflar",
    city: "Bakı",
    district: "Bakı",
    rating: 5.0,
    reviews: 0,
    price: 2000,
    badge: "Premium foto & video",
    instagram: "https://www.instagram.com/zeynalmammadli/",
    image: "/assets/avatars/zeynal-memmedli.jpg",
    instagramAvatar: true,
    description: "Toy günü üçün peşəkar foto və 4K video çəkilişi, premium albom, Live Video, highlights və Reels həlləri.",
    services: ["Gün boyu çəkiliş", "4K sinxron video", "Premium albom", "Live Video və Reels"],
    packages: [
      {
        name: "Premium paket",
        photoPrice: 5000,
        videoPrice: 11500,
        fullPrice: 16500,
        photo: [
          "Gün boyu özəl foto çəkilişi",
          "Ailə üzvlərinin çəkilişi üçün əlavə fotoqraf",
          "Yekun fotolardan Premium Albom",
          "Reels videolar"
        ],
        video: [
          "Tədbirin əvvəlindən sonuna qədər fasiləsiz 4K sinxron video çəkilişi",
          "Tədbir günü baş verənlərin montaj olunaraq monitorda təqdim edildiyi Live Video",
          "Highlights video",
          "Reels videolar"
        ]
      },
      {
        name: "Standart paket",
        photoPrice: 2000,
        videoPrice: 8300,
        fullPrice: 10300,
        photo: [
          "Komanda tərəfindən gün boyu foto çəkilişi",
          "Yekun fotolardan albom",
          "Ailə üzvlərinin çəkilişi üçün fotoqraf",
          "Reels videolar"
        ],
        video: [
          "Tədbirin əvvəlindən sonuna qədər fasiləsiz 4K sinxron video çəkilişi",
          "Tədbir günü çəkilənlərin montaj olunaraq saat 23:00-da monitorda təqdim edildiyi Live Video",
          "Reels videolar"
        ]
      }
    ]
  },
  {
    slug: "luna-wedding-studio",
    name: "Luna Wedding Studio",
    category: "fotoqraflar",
    city: "Bakı",
    district: "Nərimanov",
    rating: 4.9,
    reviews: 48,
    price: 650,
    oldPrice: 780,
    badge: "Çox seçilən",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85",
    description: "Toy, nişan və love story çəkilişləri üçün təbii kadrlar, rəng korreksiyası və premium albom.",
    services: ["8 saat çəkiliş", "2 fotoqraf", "Onlayn qalereya", "Premium albom"]
  },
  {
    slug: "flora-event-decor",
    name: "Flora Event Decor",
    category: "dekoratorlar",
    city: "Bakı",
    district: "Xətai",
    rating: 4.8,
    reviews: 35,
    price: 900,
    badge: "Sürətli cavab",
    image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&q=85",
    description: "Minimal, klassik və modern toy konseptləri. Eskizdən quraşdırmaya qədər tam dekor xidməti.",
    services: ["Konsept və moodboard", "Gül dekoru", "Masa tərtibatı", "Fotozona"]
  },
  {
    slug: "the-garden-baku",
    name: "The Garden Baku",
    category: "mekanlar",
    city: "Bakı",
    district: "Səbail",
    rating: 4.9,
    reviews: 67,
    price: 75,
    priceSuffix: " / nəfər",
    badge: "Premium məkan",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85",
    description: "Şəhər mənzərəli açıq və qapalı zal, 80–350 qonaq tutumu və fərdi menyu seçimləri.",
    services: ["350 nəfərədək", "Açıq terras", "Parking", "Mətbəx və servis"]
  },
  hotelMenuProvider("fairmont-baku-toy-menyusu", "Fairmont Baku", 180, 380, "180–380 ₼ / nəfər"),
  hotelMenuProvider("hilton-baku-toy-menyusu", "Hilton Baku", 220, 320, "220–320 ₼ / nəfər"),
  hotelMenuProvider("four-seasons-baku-toy-menyusu", "Four Seasons Baku", 225, 375, "225–375 ₼ / nəfər"),
  hotelMenuProvider("marriott-boulevard-toy-menyusu", "Marriott Boulevard", 195, 330, "195–330 ₼ / nəfər"),
  hotelMenuProvider("sheraton-baku-intourist-toy-menyusu", "Sheraton Baku Intourist", 140, 220, "140–220 ₼ / nəfər"),
  hotelMenuProvider("holiday-inn-baku-toy-menyusu", "Holiday Inn Baku", 130, 180, "130–180 ₼ / nəfər"),
  {
    slug: "dj-emil",
    name: "DJ Emil",
    category: "dj-musiqi",
    city: "Bakı",
    district: "Yasamal",
    rating: 4.7,
    reviews: 29,
    price: 450,
    badge: "Top 10",
    image: "https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?auto=format&fit=crop&w=1000&q=85",
    description: "Toy və korporativ tədbirlər üçün fərdi playlist, səs və işıq avadanlığı ilə tam paket.",
    services: ["5 saat proqram", "Səs sistemi", "İşıq paketi", "Fərdi playlist"]
  },
  {
    slug: "narin-catering",
    name: "Narin Catering",
    category: "catering",
    city: "Bakı",
    district: "Binəqədi",
    rating: 4.8,
    reviews: 22,
    price: 38,
    priceSuffix: " / nəfər",
    badge: "Yeni",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=85",
    description: "Milli və Avropa mətbəxi, peşəkar servis komandası və tədbiriniz üçün fərdi menyu.",
    services: ["Fərdi menyu", "Ofisiant xidməti", "Masa servisi", "Dequstasiya"]
  },
  {
    slug: "murad-aparici",
    name: "Murad Məmmədli",
    category: "apricilar",
    city: "Bakı",
    district: "Nəsimi",
    rating: 4.9,
    reviews: 41,
    price: 550,
    badge: "Tövsiyə olunur",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=85",
    description: "Toy, nişan və korporativ gecələr üçün səmimi, dinamik və auditoriyaya uyğun proqram.",
    services: ["4 saat proqram", "Fərdi ssenari", "Canlı interaktiv", "Koordinasiya"]
  }
];

const categoryBySlug = (slug) => categories.find((item) => item.slug === slug || item.seoSlug === slug);
const providerBySlug = (slug) => providers.find((item) => item.slug === slug);
const money = (value) => new Intl.NumberFormat("az-AZ").format(value);

function safeJson(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function layout({ title, description, canonical, content, schema = [], active = "" }) {
  const schemaItems = Array.isArray(schema) ? schema : [schema];
  return `<!doctype html>
<html lang="az">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#5b214c">
  <link rel="canonical" href="${SITE_URL}${canonical}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://images.unsplash.com">
  <link rel="stylesheet" href="/assets/styles.css?v=20260621-3">
  <meta property="og:locale" content="az_AZ">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${SITE_URL}${canonical}">
  <meta property="og:image" content="${SITE_URL}/assets/hero-event.png">
  <meta name="twitter:card" content="summary_large_image">
  ${schemaItems.filter(Boolean).map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`).join("\n  ")}
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/" aria-label="Məclisim ana səhifə"><span class="brand-mark">M</span><span>Məclisim<small>Tədbirini rahat planla</small></span></a>
      <nav aria-label="Əsas menyu">
        <a class="${active === "services" ? "active" : ""}" href="/xidmetler/fotoqraflar">Xidmətlər</a>
        <a href="/#nece-isleyir">Necə işləyir?</a>
        <a href="/#bloq">Məsləhətlər</a>
      </nav>
      <div class="nav-actions">
        <button class="icon-button saved-button" aria-label="Sevimlilər">♡ <span class="saved-count">0</span></button>
        <a class="provider-link" href="/terefdas-ol">Xidmətini əlavə et</a>
        <a class="button button-small" href="/tedbir-planla">Tədbir planla</a>
      </div>
      <button class="mobile-menu" aria-label="Menyunu aç">☰</button>
    </div>
  </header>
  <main>${content}</main>
  <footer>
    <div class="container footer-grid">
      <div><a class="brand brand-light" href="/"><span class="brand-mark">M</span><span>Məclisim</span></a><p>Toy və tədbiriniz üçün doğru peşəkarları bir yerdə tapın.</p></div>
      <div><h3>Kateqoriyalar</h3>${categories.slice(0, 4).map((c) => `<a href="/xidmetler/${c.slug}">${c.name}</a>`).join("")}</div>
      <div><h3>Məclisim</h3><a href="/#nece-isleyir">Necə işləyir?</a><a href="/#bloq">Məsləhətlər</a><a href="/terefdas-ol">Tərəfdaş ol</a></div>
      <div><h3>Yenilikləri al</h3><p>Planlama ideyaları və xüsusi təkliflər.</p><form class="subscribe-form"><input type="email" aria-label="E-poçt" placeholder="E-poçt ünvanınız"><button aria-label="Abunə ol">→</button></form></div>
    </div>
    <div class="container footer-bottom"><span>© 2026 Məclisim. Demo versiya.</span><span>Məxfilik · İstifadə şərtləri</span></div>
  </footer>
  <div class="toast" role="status" aria-live="polite"></div>
  <script src="/assets/app.js?v=20260621-3" defer></script>
</body>
</html>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Naviqasiya yolu"><a href="/">Ana səhifə</a>${items.map((item, index) => item.url && index < items.length - 1 ? `<span>›</span><a href="${item.url}">${item.name}</a>` : `<span>›</span><span>${item.name}</span>`).join("")}</nav>`;
}

function providerCard(provider) {
  const category = categoryBySlug(provider.category);
  const currency = provider.priceCurrency === "USD" ? "$" : "₼";
  const initials = provider.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  return `<article class="provider-card" data-category="${provider.category}" data-price="${provider.price}" data-rating="${provider.rating}">
    <a class="card-image ${provider.instagramAvatar ? "card-image-avatar" : ""} ${provider.initialsCover ? "card-image-initials" : ""}" href="/xidmet/${provider.slug}" aria-label="${provider.name}">
      ${provider.initialsCover ? `<span class="initials-mark">${initials}</span>` : `<img src="${provider.image}" alt="${provider.name} — ${category.name.toLowerCase()} xidməti" loading="lazy" width="640" height="440">`}
      <span class="badge">${provider.badge}</span>
      <button class="save-button" data-id="${provider.slug}" aria-label="${provider.name} sevimlilərə əlavə et">♡</button>
    </a>
    <div class="card-body">
      <div class="card-category">${category.name} · ${provider.district}</div>
      <h3><a href="/xidmet/${provider.slug}">${provider.name}</a></h3>
      <div class="rating">${provider.reviews ? `<strong>★ ${provider.rating}</strong><span>${provider.reviews} rəy</span>` : `<strong>Yeni profil</strong><span>Rəy yoxdur</span>`}</div>
      <p>${provider.description}</p>
      <div class="card-footer"><span><small>Başlayan qiymət</small><strong>${money(provider.price)} ${currency}${provider.priceSuffix || ""}</strong></span><a href="/xidmet/${provider.slug}">Bax →</a></div>
    </div>
  </article>`;
}

function homePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Məclisim",
    url: SITE_URL,
    inLanguage: "az",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/axtar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const content = `
  <section class="hero">
    <img class="hero-image" src="/assets/hero-event.png" alt="Zövqlə hazırlanmış toy və tədbir məkanı" width="1536" height="1024">
    <div class="hero-overlay"></div>
    <div class="container hero-content">
      <span class="eyebrow">Azərbaycanın tədbir marketplace-i</span>
      <h1>Xüsusi gününüz üçün<br><em>doğru peşəkarları</em> tapın</h1>
      <p>Fotoqrafdan məkana, dekoratordan DJ-ə — müqayisə edin, qiymət alın və tədbirinizi rahatlıqla planlayın.</p>
      <form class="hero-search" action="/axtar" method="get">
        <label><span>Nə axtarırsınız?</span><select name="kateqoriya"><option value="">Bütün xidmətlər</option>${categories.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("")}</select></label>
        <label><span>Harada?</span><select name="seher"><option value="baki">Bakı</option><option value="sumqayit">Sumqayıt</option><option value="gence">Gəncə</option></select></label>
        <label><span>Tədbir tarixi</span><input type="date" name="tarix"></label>
        <button class="button" type="submit">Uyğun xidmətləri tap</button>
      </form>
      <div class="hero-proof"><span>✓ Pulsuz sorğu</span><span>✓ Yoxlanılmış profillər</span><span>✓ Birbaşa qiymət təklifi</span></div>
    </div>
  </section>

  <section class="section category-section">
    <div class="container">
      <div class="section-heading"><div><span class="overline">Bir yerdə, asanlıqla</span><h2>Tədbiriniz üçün nə lazımdır?</h2></div><a href="/xidmetler/fotoqraflar">Bütün xidmətlər →</a></div>
      <div class="category-grid">${categories.map((c) => `<a class="category-card" href="/xidmetler/${c.slug}"><span class="category-icon">${c.icon}</span><div><h3>${c.name}</h3><p>${c.text}</p><small>${c.count}+ peşəkar</small></div><span class="arrow">↗</span></a>`).join("")}</div>
    </div>
  </section>

  <section class="section featured-section">
    <div class="container">
      <div class="section-heading"><div><span class="overline">Seçilmiş tərəfdaşlar</span><h2>Bu həftənin çox baxılanları</h2></div><div class="carousel-buttons"><button aria-label="Əvvəlki">←</button><button aria-label="Növbəti">→</button></div></div>
      <div class="provider-grid">${providers.slice(0, 3).map(providerCard).join("")}</div>
    </div>
  </section>

  <section class="planner-banner">
    <div class="container planner-inner">
      <div><span class="eyebrow">Haradan başlayacağınızı bilmirsiniz?</span><h2>Bir sorğu göndərin,<br>təkliflər sizə gəlsin.</h2><p>Tədbir məlumatlarını qeyd edin. Uyğun peşəkarlar 24 saat ərzində sizinlə əlaqə saxlasın.</p><a class="button button-light" href="/tedbir-planla">Pulsuz sorğu yarat →</a></div>
      <div class="planner-card">
        <div class="mini-step"><span>01</span><div><strong>Tədbiri təsvir edin</strong><small>Tarix, məkan, qonaq sayı və büdcə</small></div></div>
        <div class="mini-step"><span>02</span><div><strong>Təklifləri müqayisə edin</strong><small>Qiymət, portfolio və rəylərə baxın</small></div></div>
        <div class="mini-step"><span>03</span><div><strong>Ən uyğununu seçin</strong><small>Birbaşa danışın və rezerv edin</small></div></div>
      </div>
    </div>
  </section>

  <section class="section how-section" id="nece-isleyir">
    <div class="container">
      <div class="center-heading"><span class="overline">Sadə planlama</span><h2>Məclisim necə işləyir?</h2><p>Onlarla zəng və mesaj əvəzinə bütün prosesi bir yerdən idarə edin.</p></div>
      <div class="steps"><div><span>1</span><h3>Axtarın</h3><p>Xidmət, şəhər, tarix və büdcəyə görə uyğun peşəkarları tapın.</p></div><div><span>2</span><h3>Müqayisə edin</h3><p>Portfolio, real rəylər, paketlər və qiymətləri müqayisə edin.</p></div><div><span>3</span><h3>Əlaqə saxlayın</h3><p>Birbaşa qiymət alın və tədbiriniz üçün ən yaxşı seçimi edin.</p></div></div>
    </div>
  </section>

  <section class="section journal-section" id="bloq">
    <div class="container">
      <div class="section-heading"><div><span class="overline">Planlama jurnalı</span><h2>Faydalı məsləhətlər</h2></div><a href="/bloq">Bütün yazılar →</a></div>
      <div class="journal-grid">
        <article class="journal-main"><div><span>TOY PLANLAMASI · 8 DƏQİQƏ</span><h3>2026-cı ildə Bakıda toy büdcəsini necə planlamaq olar?</h3><p>Məkan, dekor, foto-video və digər əsas xərclər üçün praktik büdcə bölgüsü.</p><a href="/bloq/bakida-toy-budcesi">Oxumağa davam et →</a></div></article>
        <article><span>FOTO & VİDEO</span><h3>Toy fotoqrafı seçərkən verilməli 7 sual</h3><a href="/bloq/toy-fotoqrafi-secimi">5 dəqiqəyə oxu →</a></article>
        <article><span>DEKOR</span><h3>Kiçik toylar üçün zövqlü dekor ideyaları</h3><a href="/bloq/kicik-toy-dekoru">4 dəqiqəyə oxu →</a></article>
      </div>
    </div>
  </section>`;

  return layout({
    title: "Məclisim — Toy və Tədbir Xidmətləri Marketplace-i",
    description: "Bakıda toy və tədbir üçün fotoqraf, məkan, dekorator, DJ, aparıcı və catering xidmətlərini tapın, müqayisə edin və qiymət alın.",
    canonical: "/",
    content,
    schema
  });
}

function listingPage(category, city = null) {
  const filtered = providers.filter((provider) => provider.category === category.slug);
  const displayed = filtered.length ? filtered : providers;
  const cityName = city || "Azərbaycan";
  const titlePrefix = city ? `${cityName}da` : "";
  const title = `${titlePrefix} ${category.name} — Qiymətlər və Portfoliolar | Məclisim`.trim();
  const canonical = city ? `/baki/${category.seoSlug}` : `/xidmetler/${category.slug}`;
  const description = `${cityName} üzrə ${category.name.toLowerCase()} tapın. Portfolio, qiymət paketləri və müştəri rəylərini müqayisə edin, pulsuz təklif alın.`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${cityName} ${category.name}`,
      description,
      url: `${SITE_URL}${canonical}`
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: displayed.map((provider, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/xidmet/${provider.slug}`,
        name: provider.name
      }))
    }
  ];

  const content = `
    <section class="listing-hero"><div class="container">${breadcrumbs([{ name: "Xidmətlər", url: "/xidmetler/fotoqraflar" }, { name: category.name }])}<span class="overline">${cityName} üzrə seçilmiş peşəkarlar</span><h1>${titlePrefix} ${category.name}</h1><p>${category.text} Qiymətləri və portfolioları müqayisə edərək birbaşa təklif alın.</p></div></section>
    <section class="section listing-section"><div class="container">
      <div class="filter-bar">
        <label>Axtarış<input class="live-search" type="search" placeholder="Ad və ya xidmət..."></label>
        <label>Şəhər<select><option>Bakı</option><option>Sumqayıt</option><option>Gəncə</option></select></label>
        <label>Büdcə<select class="price-filter"><option value="">Bütün qiymətlər</option><option value="500">500 ₼-dək</option><option value="1000">1 000 ₼-dək</option></select></label>
        <label>Sıralama<select class="sort-filter"><option value="rating">Ən yüksək reytinq</option><option value="price">Ən aşağı qiymət</option></select></label>
      </div>
      <div class="result-head"><h2>${displayed.length} uyğun xidmət</h2><span>Yoxlanılmış profil və rəylər</span></div>
      <div class="provider-grid listing-grid">${displayed.map(providerCard).join("")}</div>
      <div class="seo-copy"><h2>${cityName} üzrə ${category.name.toLowerCase()} necə seçilməlidir?</h2><p>Doğru seçim üçün yalnız başlanğıc qiymətə deyil, xidmət paketinin məzmununa, portfolionun üslubuna və əvvəlki müştərilərin rəylərinə də baxın. Məclisim-də uyğun peşəkarları müqayisə edə və eyni sorğu ilə bir neçə qiymət təklifi ala bilərsiniz.</p><h3>Qiymətlərə nə daxildir?</h3><p>Qiymətlər tarixə, tədbirin müddətinə, qonaq sayına və əlavə xidmətlərə görə dəyişir. Profil səhifəsində paket detallarını yoxlayın və dəqiq qiymət üçün pulsuz sorğu göndərin.</p></div>
    </div></section>`;

  return layout({ title, description, canonical, content, schema, active: "services" });
}

function profilePage(provider) {
  const category = categoryBySlug(provider.category);
  const canonical = `/xidmet/${provider.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    description: provider.description,
    image: provider.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.city,
      addressRegion: provider.district,
      addressCountry: "AZ"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: provider.rating,
      reviewCount: provider.reviews
    },
    priceRange: `${provider.price} ${provider.priceCurrency === "USD" ? "USD" : "AZN"}-dən`,
    url: `${SITE_URL}${canonical}`
  };

  const content = `<section class="profile-page"><div class="container">
    ${breadcrumbs([{ name: category.name, url: `/xidmetler/${category.slug}` }, { name: provider.name }])}
    ${provider.initialsCover
      ? `<div class="profile-gallery profile-gallery-initials"><span class="profile-initials">${provider.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("")}</span><strong>${provider.name}</strong><small>Rəsmi profil məlumatı əlavə ediləcək</small></div>`
      : `<div class="profile-gallery ${provider.galleryImages ? "profile-gallery-posters" : ""} ${provider.instagramAvatar ? "profile-gallery-avatar" : ""}"><img src="${provider.galleryImages?.[0] || provider.image}" alt="${provider.name} profil fotosu" width="1200" height="760"><div class="gallery-tile gallery-one"${provider.galleryImages?.[1] ? ` style="background-image:url('${provider.galleryImages[1]}')"` : ""}></div><div class="gallery-tile gallery-two"${provider.galleryImages?.[2] ? ` style="background-image:url('${provider.galleryImages[2]}')"` : ""}></div><span>${provider.instagramAvatar ? "Instagram profil fotosu" : provider.galleryImages ? `${provider.galleryImages.length} paket təqdimatı` : `Portfolio · ${provider.reviews + 12} foto`}</span></div>`}
    <div class="profile-layout">
      <article class="profile-main">
        <div class="profile-title"><div><span class="card-category">${category.name} · ${provider.city}, ${provider.district}</span><h1>${provider.name} <small>✓</small></h1><div class="rating"><strong>★ ${provider.rating}</strong><span>${provider.reviews} təsdiqlənmiş rəy</span></div></div><button class="save-profile save-button" data-id="${provider.slug}">♡ Yadda saxla</button></div>
        <p class="profile-lead">${provider.description}</p>
        ${provider.instagram ? `<div class="profile-links"><a class="instagram-link" href="${provider.instagram}" target="_blank" rel="noopener noreferrer" aria-label="${provider.name} Instagram profilini aç"><span class="instagram-icon">◎</span><span><small>Real iş nümunələri</small><strong>Instagram-da bax</strong></span><span class="external-arrow">↗</span></a></div>` : ""}
        <hr><h2>Paketə daxildir</h2><div class="service-list">${provider.services.map((service) => `<span>✓ ${service}</span>`).join("")}</div>
        ${provider.packages ? `<hr><section class="package-section"><div class="package-heading"><span class="overline">Foto və video paketləri</span><h2>Xidmət paketləri və qiymətlər</h2><p>Foto və video xidmətlərini ayrı, yaxud Full paket şəklində seçə bilərsiniz.</p></div><div class="package-grid">${provider.packages.map((pack) => `
          <article class="package-card ${pack.name.toLocaleLowerCase("az").includes("premium") ? "package-premium" : ""}">
            <div class="package-card-head"><div><span>${pack.name.toLocaleLowerCase("az").includes("premium") ? "Ən geniş seçim" : "Əsas seçim"}</span><h3>${pack.name}</h3></div><div class="full-price"><small>Full paket</small><strong>${money(pack.fullPrice)} ₼</strong></div></div>
            <div class="package-columns">
              <div><div class="package-price"><span>FOTO</span><strong>${money(pack.photoPrice)} ₼</strong></div><ul>${pack.photo.map((item) => `<li>${item}</li>`).join("")}</ul></div>
              <div><div class="package-price"><span>VİDEO</span><strong>${money(pack.videoPrice)} ₼</strong></div><ul>${pack.video.map((item) => `<li>${item}</li>`).join("")}</ul></div>
            </div>
            <a class="button button-wide package-action" href="#qiymet-al">Bu paket üçün təklif al</a>
          </article>`).join("")}</div></section>` : ""}
        ${provider.priceOffers ? `<hr><section class="package-section"><div class="package-heading"><span class="overline">Aktual qiymətlər</span><h2>Xidmətlər və qiymətlər</h2></div><div class="offer-grid">${provider.priceOffers.map((offer) => `
          <article class="offer-card ${offer.featured ? "offer-featured" : ""}">
            ${offer.featured ? `<span class="offer-badge">Seçilmiş paket</span>` : ""}
            <div class="offer-head"><h3>${offer.title}</h3><strong>${offer.price}</strong></div>
            <ul>${offer.items.map((item) => `<li>${item}</li>`).join("")}</ul>
            <a href="#qiymet-al">Qiymət sorğusu göndər →</a>
          </article>`).join("")}</div>
          ${provider.pricingNote ? `<div class="pricing-note"><strong>Qeyd:</strong> ${provider.pricingNote}</div>` : ""}
        </section>` : ""}
        <hr><h2>Haqqımızda</h2><p>Hər tədbirə fərdi yanaşır, planlama mərhələsindən yekun təqdimata qədər müştərilərimizlə sıx əlaqədə oluruq. Məqsədimiz günün atmosferini təbii və zövqlü şəkildə təqdim etməkdir.</p>
        <hr><h2>Müştəri rəyləri</h2><div class="review"><div><strong>Aynur R.</strong><span>★ ★ ★ ★ ★</span></div><small>12 may 2026</small><p>Çox rahat ünsiyyət və gözlədiyimizdən də gözəl nəticə. Bütün detallar əvvəlcədən izah olundu.</p></div>
      </article>
      <aside class="quote-card" id="qiymet-al">
        <span class="overline">Qiymət təklifi alın</span><div class="quote-price"><small>Başlayan qiymət</small><strong>${money(provider.price)} ${provider.priceCurrency === "USD" ? "$" : "₼"}${provider.priceSuffix || ""}</strong>${provider.oldPrice ? `<del>${money(provider.oldPrice)} ₼</del>` : ""}</div>
        <form class="quote-form">
          <label>Tədbir tarixi<input name="date" type="date" required></label>
          <label>Tədbir növü<select name="type"><option>Toy</option><option>Nişan</option><option>Ad günü</option><option>Korporativ tədbir</option></select></label>
          <label>Telefon<input name="phone" type="tel" placeholder="+994 50 000 00 00" required></label>
          <button class="button" type="submit">Pulsuz təklif al</button>
        </form>
        ${provider.instagram ? `<a class="quote-instagram" href="${provider.instagram}" target="_blank" rel="noopener noreferrer">Instagram profilinə keç ↗</a>` : ""}
        <p>Ödəniş tələb olunmur · Cavab müddəti təxminən 2 saat</p>
      </aside>
    </div>
  </div></section>`;

  return layout({
    title: `${provider.name} — ${category.name}, qiymət və rəylər | Məclisim`,
    description: `${provider.name}: ${provider.description} ${provider.price} AZN-dən başlayan qiymətlərlə portfolio və təsdiqlənmiş rəylərə baxın.`,
    canonical,
    content,
    schema,
    active: "services"
  });
}

function plannerPage() {
  const content = `<section class="form-page"><div class="container narrow">
    ${breadcrumbs([{ name: "Tədbir planla" }])}
    <div class="center-heading"><span class="overline">Pulsuz və öhdəliksiz</span><h1>Tədbiriniz üçün təkliflər alın</h1><p>Bir neçə detalı qeyd edin, uyğun peşəkarlar sizinlə əlaqə saxlasın.</p></div>
    <form class="planner-form">
      <div class="form-progress"><span class="active"></span><span></span><span></span></div>
      <h2>Tədbir haqqında</h2>
      <div class="form-grid">
        <label>Tədbir növü<select required><option value="">Seçin</option><option>Toy</option><option>Nişan</option><option>Ad günü</option><option>Korporativ tədbir</option></select></label>
        <label>Şəhər<select required><option>Bakı</option><option>Sumqayıt</option><option>Gəncə</option></select></label>
        <label>Tarix<input type="date" required></label>
        <label>Qonaq sayı<input type="number" min="1" placeholder="Məsələn, 150"></label>
      </div>
      <label>Hansı xidmətlər lazımdır?</label><div class="check-grid">${categories.map((c) => `<label><input type="checkbox" value="${c.slug}"><span>${c.icon} ${c.name}</span></label>`).join("")}</div>
      <label>Təxmini büdcə<select><option>Hələ bilmirəm</option><option>1 000 ₼-dək</option><option>1 000–3 000 ₼</option><option>3 000–7 000 ₼</option><option>7 000 ₼ və daha çox</option></select></label>
      <label>Əlavə qeydlər<textarea rows="4" placeholder="Tədbiriniz və istəkləriniz haqqında qısa məlumat..."></textarea></label>
      <button class="button button-wide" type="submit">Sorğunu tamamla →</button>
    </form>
  </div></section>`;
  return layout({
    title: "Tədbir Planla və Pulsuz Qiymət Təklifləri Al | Məclisim",
    description: "Toy və tədbiriniz üçün xidmət ehtiyaclarını qeyd edin, uyğun fotoqraf, məkan, dekorator və digər peşəkarlardan pulsuz təkliflər alın.",
    canonical: "/tedbir-planla",
    content
  });
}

function simplePage(title, message, canonical) {
  return layout({
    title: `${title} | Məclisim`,
    description: message,
    canonical,
    content: `<section class="form-page"><div class="container narrow"><div class="center-heading"><span class="overline">Məclisim</span><h1>${title}</h1><p>${message}</p><a class="button" href="/">Ana səhifəyə qayıt</a></div></div></section>`
  });
}

app.get("/", (req, res) => res.send(homePage()));

app.get("/xidmetler/:slug", (req, res) => {
  const category = categoryBySlug(req.params.slug);
  if (!category) return res.status(404).send(simplePage("Səhifə tapılmadı", "Axtardığınız kateqoriya mövcud deyil.", req.path));
  res.send(listingPage(category));
});

app.get("/baki/:slug", (req, res) => {
  const category = categoryBySlug(req.params.slug);
  if (!category) return res.status(404).send(simplePage("Səhifə tapılmadı", "Axtardığınız xidmət mövcud deyil.", req.path));
  res.send(listingPage(category, "Bakı"));
});

app.get("/xidmet/:slug", (req, res) => {
  const provider = providerBySlug(req.params.slug);
  if (!provider) return res.status(404).send(simplePage("Profil tapılmadı", "Bu xidmət profili artıq mövcud deyil.", req.path));
  res.send(profilePage(provider));
});

app.get("/axtar", (req, res) => {
  const category = categoryBySlug(req.query.kateqoriya) || categories[0];
  res.send(listingPage(category, "Bakı"));
});

app.get("/tedbir-planla", (req, res) => res.send(plannerPage()));
app.get("/terefdas-ol", (req, res) => res.send(simplePage("Xidmətini Məclisim-ə əlavə et", "Tərəfdaş qeydiyyatı növbəti mərhələdə aktiv olacaq. Demo təqdimat üçün hazırdır.", "/terefdas-ol")));
app.get("/bloq/:slug", (req, res) => res.send(simplePage("Planlama jurnalı", "Faydalı və SEO yönümlü məqalələr tezliklə bu bölmədə yayımlanacaq.", req.path)));
app.get("/bloq", (req, res) => res.send(simplePage("Planlama jurnalı", "Toy və tədbir planlaması üçün praktik məsləhətlər.", "/bloq")));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  const paths = [
    "/",
    "/tedbir-planla",
    ...categories.flatMap((category) => [`/xidmetler/${category.slug}`, `/baki/${category.seoSlug}`]),
    ...providers.map((provider) => `/xidmet/${provider.slug}`)
  ];
  const urls = paths.map((url) => `<url><loc>${SITE_URL}${url}</loc><changefreq>${url === "/" ? "daily" : "weekly"}</changefreq><priority>${url === "/" ? "1.0" : "0.8"}</priority></url>`).join("");
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

app.get("/health", (req, res) => res.json({ ok: true, service: "meclisim-demo" }));

app.use((req, res) => res.status(404).send(simplePage("Səhifə tapılmadı", "Axtardığınız səhifə mövcud deyil və ya ünvanı dəyişib.", req.path)));

app.listen(PORT, () => {
  console.log(`Məclisim demo: http://localhost:${PORT}`);
});
