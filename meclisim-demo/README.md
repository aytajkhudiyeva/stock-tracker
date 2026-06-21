# Məclisim — SEO-first marketplace demo

Toy və tədbir xidmətləri üçün server-rendered demo marketplace.

## Lokal işə salmaq

```bash
cd /Users/aytacxudiyeva/stock-tracker/meclisim-demo
npm start
```

Sayt: `http://localhost:8082`

## Hazır səhifələr

- `/` — ana səhifə
- `/xidmetler/fotoqraflar` — kateqoriya səhifəsi
- `/baki/toy-fotoqrafi` — şəhər + xidmət SEO landing page
- `/xidmet/luna-wedding-studio` — xidmət profili
- `/tedbir-planla` — qiymət sorğusu
- `/robots.txt`
- `/sitemap.xml`
- `/health`

## SEO infrastrukturu

- Hər URL üçün serverdə hazırlanmış HTML
- Unikal title və meta description
- Canonical URL
- Open Graph və Twitter meta teqləri
- WebSite, CollectionPage, ItemList və LocalBusiness JSON-LD
- Təmiz, açar söz yönümlü URL-lər
- Dinamik XML sitemap və robots.txt
- Kateqoriya səhifələrində indekslənən mətn

Canlı domenə keçirərkən `SITE_URL` mühit dəyişənini real domenlə əvəz edin:

```bash
SITE_URL=https://example.az npm start
```
