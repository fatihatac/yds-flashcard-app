# YDS Bağlaç Kartları

YDS bağlaçları (ve kelimeleri) için **aralıklı tekrar** sistemli, mobil öncelikli flashcard uygulaması. Derleme adımı yok: saf HTML / CSS / ES modülleri. GitHub Pages'te yayınlanır, telefonda "Ana ekrana ekle" ile uygulama gibi çalışır ve çevrimdışı açılır.

## Özellikler
- **Bağlaç kartları (64):** ön yüzde Türkçe anlam + gramer kuralı, arka yüzde İngilizce bağlaç grubu, anlam, kullanım, YDS örnek cümlesi + Türkçe çevirisi ve "YDS Tüyosu".
- **Kelime kartları (3769):** `data/words.json` (İngilizce → Türkçe, eş anlamlılarla).
- **Tekrar algoritması:** SM-2 tabanlı, Tekrar / Zor / İyi / Kolay; günlük yeni kart limiti.
- **Soru çözümü (329 bağlaç sorusu):** temel (65), **tuzak tipi** (128, her karta 2 soru) ve çıkmış YDS sorularından otomatik ayıklanan bağlaç soruları (136); konuya göre, açıklamalı.
- **Tekrar modu:** yanlış yapılan sorular 1 - 3 - 7 - 14 gün aralıkla yeniden gelir; yanlış sorunun bağlaç kartı da kart tekrarına geri döner. "Zayıf konuların" listesi en düşük başarılı konuları gösterir.
- **Çıkmış sınavlar:** `data/20xx_YDS_n.json` dosyalarındaki 28 sınav (okuma parçası gerektirmeyen sorular) orijinal sırasıyla çözülür.
- **Kartlar:** arama ve kategori filtresiyle tüm bağlaçlara göz atma.
- **Ayarlar:** günlük hedefler, tema, yedek indir/yükle, kendi soru setini ekleme.

İlerleme yalnızca tarayıcının `localStorage` alanında saklanır; cihaz değiştirirken Ayarlar'dan yedek al.

## Yayınlama (GitHub Pages)
1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. `main` dalına push edince `.github/workflows/pages.yml` testleri çalıştırıp siteyi yayınlar.
3. Adres: `https://<kullanici>.github.io/yds-flashcard-app/` — telefonda aç, tarayıcı menüsünden **Ana ekrana ekle**.

## Yerelde çalıştırma
```
npm start        # http://localhost:8080
npm test         # SRS testleri + veri doğrulama
```

## Yapı
```
data/conjunctions.json   bağlaç kartları
data/questions.json      sorular
data/questions-trap.json tuzak soruları (scripts/build-trap-questions.py ile üretilir)
data/20xx_YDS_n.json     çıkmış sınavlar (ham)
data/exams.json          sınav listesi (node scripts/build-exam-data.mjs)
data/exam-conjunction-questions.json  sınavlardan ayıklanan bağlaç soruları (aynı betik)
data/words.json          kelimeler
js/srs.js                tekrar algoritması (saf fonksiyonlar)
js/store.js              localStorage: ilerleme, ayarlar
js/data.js               deste kaydı (DECKS)
js/exams.js              ham sınav biçimini soru biçimine çevirir
js/render.js             deste türüne göre kart yüzleri
js/views/*.js            ekranlar (home, study, quiz, library, settings)
```

## Genişletme
- **Yeni deste:** `js/data.js` içindeki `DECKS` dizisine kayıt ekle, `js/render.js`'e aynı `type` için `front/back` çizici ekle.
- **Yeni ekran (ör. deneme sınavı):** `js/views/<ad>.js` oluştur (`export async function render(root, ctx)`), `js/main.js` içindeki `ROUTES` ve `NAV`'a ekle.
- **Yeni kart:** `data/conjunctions.json`'a ekle (`id`, `category`, `tr`, `rule`, `group`, `meaning`, `usage`, `example{en,tr}`, `tip`). `npm run validate` ile kontrol et.

### Yeni sınav eklemek
`data/2027_YDS_1.json` gibi dosyayı ekle (`title` + `questions[]`; `correctAnswer` harf ya da şık metni olabilir), sonra `node scripts/build-exam-data.mjs` çalıştır ve `npm test` ile kontrol et.

### Soru biçimi
`data/questions.json` (veya Ayarlar → Soru ekle ile yüklenen JSON) şu şekilde bir dizidir:
```json
[
  {
    "id": "q100",
    "cardIds": ["concession-clause"],
    "stem": "____ it rained heavily, the match went on.",
    "options": ["Despite", "Although", "Because of", "Unless", "Therefore"],
    "answer": 1,
    "explanation": "Sonrasında tam cümle var ve zıtlık isteniyor: Although."
  }
]
```
`answer`, `options` içindeki doğru şıkkın 0 tabanlı indeksidir; `cardIds` ilgili bağlaç kartlarının `id`'leridir.
