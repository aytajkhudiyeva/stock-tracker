# Auto Import Platform admin paneli

Bu panel şirkət sahibinin sayta kodsuz dəyişiklik etməsi üçündür.

## Giriş

Admin linki:

```text
/admin/
```

Canlı yayımdan əvvəl Railway variables bölməsində bunlar mütləq dəyişdirilməlidir:

```text
ADMIN_PASSWORD=mustərinin-seçdiyi-güclü-parol
ADMIN_SECRET=uzun-random-secret
DATA_DIR=/data
```

`DATA_DIR=/data` yalnız Railway-də volume `/data` yoluna mount ediləndə istifadə olunmalıdır. Volume olmasa dəyişikliklər deploy/restart zamanı itə bilər.

## Müştəri nəyi dəyişir?

- `Müraciətlər`: saytdan gələn formaları görür, statusu dəyişir.
- `Avtomobillər`: kataloqa maşın əlavə edir, qiymət/risk/status yeniləyir.
- `Sifarişlər`: müştəri üçün sifariş kodu yaradır və mərhələni dəyişir.
- `Təhvil`: təhvil verilmiş avtomobilləri arxivə əlavə edir və gizlədir.
- `Tariflər`: kalkulyator üçün USD/AZN, logistika, xidmət və ehtiyat məbləğini yeniləyir.

## Sifariş izləmə axını

1. Admin paneldə `Sifarişlər` bölməsindən yeni kod yaradılır.
2. Müştəriyə kod göndərilir.
3. Müştəri `/izleme/` səhifəsində kodu daxil edir.
4. Şirkət admin paneldə mərhələni dəyişib `Yadda saxla` basır.
5. Müştəri eyni kodla yenilənmiş statusu görür.

## Ən az aylıq xərc modeli

Ən sadə quruluş:

- 1 Railway service: sayt + admin API
- 1 Railway volume: admin datasının qalıcı saxlanması
- ayrıca database yoxdur
- şəkil upload yoxdur; şəkillər əvvəlcədən `/assets/` içində saxlanır və ya URL kimi yazılır

Bu model kiçik müştəri üçün ən ucuz və ən az texniki baxım tələb edən variantdır. Daha sonra real şəkil upload, çox istifadəçi loginləri, bildirişlər və avtomatik təchizatçı importu lazım olsa ayrıca database/storage seçilə bilər.

