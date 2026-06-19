# Aras Auto — deploy və müştəriyə təhvil

## Hazırkı demo deploy

- Railway layihəsi ayrıca yaradılmalıdır; başqa məhsulun layihəsi ilə birləşdirilməməlidir.
- `PUBLIC_INDEXING` dəyişəni verilmədikdə sayt `X-Robots-Tag: noindex` ilə açılır.
- Bu qoruma nümunə VÖEN, qiymət, avtomobil, təhvil və rəylərin Google-da real məlumat kimi indekslənməsinin qarşısını alır.

## Canlı yayımdan əvvəl dəyişdirilməli məlumatlar

- Hüquqi şəxs adı, VÖEN və müqavilə mətni
- Real Facebook və TikTok ünvanları
- Real avtomobil mənbəyi, qiymətlər və yenilənmə vaxtı
- Real müştəri rəyləri və təhvil materialları üçün yazılı icazə
- Kalkulyatorun şirkət tarifləri və aktual dövlət ödənişləri
- Məxfilik siyasətində faktiki məlumat emalı və məsul şəxs

## Domen və hesab sahibliyi

1. Domen müştərinin adına və müştərinin e-poçtu ilə alınmalıdır.
2. Railway layihəsinin billing məlumatı müştərinin hesabına keçirilməlidir.
3. Domen DNS idarəsi müştərinin Cloudflare hesabında saxlanmalıdır.
4. Developer ayrıca üzv kimi dəvət edilməlidir; əsas sahib olmamalıdır.
5. Google Search Console, Google Business Profile və Analytics müştərinin hesabında yaradılmalıdır.

## SEO indekslənməsini açmaq

Yalnız real hüquqi və kommersiya məlumatları yerləşdirildikdən, xüsusi domen qoşulduqdan sonra:

```text
PUBLIC_INDEXING=true
```

Railway dəyişəni əlavə edilir və servis yenidən deploy olunur. Sonra:

- `robots.txt` və `sitemap.xml` domenlə yenidən yoxlanılır;
- Google Search Console-da domen təsdiqlənir;
- sitemap göndərilir;
- bütün canonical və Open Graph URL-ləri faktiki domenlə uyğunlaşdırılır.

## Təhvil paketinə daxil olanlar

- Railway layihəsi və deploy tarixçəsi
- Domen və DNS girişi
- Saytın mənbə kodu və ayrıca Git repository
- Search Console və Analytics girişləri
- Sosial media linkləri və WhatsApp nömrəsi
- Aylıq xidmət sərhədlərini göstərən yazılı texniki xidmət razılaşması

## Demo platform modulları

- `/avtomobiller/`: filtr, risk balı, üçlü müqayisə və qiymət bildirişi
- `/kabinet/`: marşrut, ödəniş, sənədlər, mesajlar və saxlanmış seçimlər
- `/admin/`: CRM, satış axını, kataloq statusu və SEO aktivləşdirmə vəziyyəti
- `/modeller/`: indekslənməsi bağlı olan model kontent klasteri

Hazırkı demo məlumatı brauzerin `localStorage` yaddaşında saxlayır. Canlı sistemdə bunlar API, autentifikasiya və verilənlər bazası ilə əvəz edilməlidir.
