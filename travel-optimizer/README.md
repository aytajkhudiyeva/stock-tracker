# Uçuş Tarix Tapıcı

Aviasales/Travelpayouts məlumatı ilə 6 aya qədər tarix intervalında ən ucuz
tək istiqamət və ya gediş-dönüş tarixlərini müqayisə edən tətbiqdir.

Əsas imkanlar:

- şəhər və hava limanı adına görə autocomplete;
- tək istiqamət və gediş-dönüş axtarışı;
- 0, 1 və 2 transfer filtri;
- əl yükü və qeydiyyat baqajı seçimi;
- böyük, uşaq və körpə sərnişin sayı;
- seçilmiş intervalda müxtəlif qalma müddətlərinin müqayisəsi;
- eyni marşrut və tarixlə Aviasales axtarışına keçid.
- Booking.com hotel axtarışına eyni səfər tarixləri ilə keçid;
- seçilən uçuş və hotel üçün yekun paket qiyməti;
- müştəriyə göndərmək üçün hazır tur paket mesajı.

## Quraşdırma

1. Travelpayouts hesabından Data API tokeni götür.
2. `.env.example` faylını `.env` adı ilə kopyala.
3. `TRAVELPAYOUTS_TOKEN` dəyərini əlavə et.
4. Repo kökündən `node travel-optimizer/server.js` əmrini işə sal.
5. `http://localhost:4174` ünvanını aç.

Token olmadan interfeys açılır, amma heç bir qiymət göstərilmir. Tətbiq saxta
və ya hesablanmış qiymət yaratmır.

## Məlumat qeydi

Travelpayouts Data API ilkin seçim üçün keşlənmiş qiymətlər qaytarır. Hər
nəticədəki düymə eyni marşrut və tarixləri Aviasales-də açır; satışdan əvvəl
son mövcud qiymət orada təsdiqlənməlidir.

Data API uşaq/körpə və baqaj tarifinin yekun qiymətini qaytarmır. Tətbiq buna
görə həmin məbləğləri təxmin etmir; seçimləri Aviasales-ə ötürür və yekun
qiymət orada hesablanır. Tək istiqamətli keş nəticəsində uçuş saatı verilmirsə,
saat yalnız Aviasales nəticəsində görünür.

Booking.com hotellərini canlı qiymət və mövcudluqla saytın içində göstərmək
üçün Booking.com Managed Affiliate Partner müqaviləsi, `BOOKING_API_KEY` və
`BOOKING_AFFILIATE_ID` tələb olunur. Bu açarlar olmayanda tətbiq Booking.com
axtarışını düzgün tarix və sərnişinlə açır; istifadəçi Booking-də gördüyü real
hotel qiymətini paket qurucusuna əlavə edir.
