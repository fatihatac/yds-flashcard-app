# YDS Hazırlık Kartları

YDS bağlaçları (ve kelimeleri) için **aralıklı tekrar** sistemli, mobil öncelikli flashcard uygulaması. Derleme adımı yok: saf HTML / CSS / ES modülleri. GitHub Pages'te yayınlanır, telefonda "Ana ekrana ekle" ile uygulama gibi çalışır ve çevrimdışı açılır.

## Özellikler
- **Bağlaç kartları (64):** ön yüzde Türkçe anlam + gramer kuralı, arka yüzde İngilizce bağlaç grubu, anlam, kullanım, YDS örnek cümlesi + Türkçe çevirisi ve "YDS Tüyosu".
- **Gramer konuları (33):** tense, passive, koşul ve dilek, modal, fiilimsiler, relative / noun clause, devrik cümle, uyum, karşılaştırma, edatlar, paralellik ve daha fazlası. Her konuda öğretici anlatım, **YDS taktikleri**, örnek cümleler (çevirili) ve sık yapılan hatalar var; 99 gramer sorusuyla pekiştirilir. Genel bir "boşluk analizi" taktik kartı ve "bağlaç mı, edat mı, zarf mı?" kartı da dahil.
- **Kelime kartları (3769):** `data/words.json` (İngilizce → Türkçe, eş anlamlılarla).
- **Tekrar algoritması:** SM-2 tabanlı, Tekrar / Zor / İyi / Kolay; günlük yeni kart limiti.
- **Soru çözümü (329 bağlaç sorusu):** temel (65), **tuzak tipi** (128, her karta 2 soru) ve çıkmış YDS sorularından otomatik ayıklanan bağlaç soruları (136); konuya göre, açıklamalı.
- **Tekrar modu:** yanlış yapılan sorular 1 - 3 - 7 - 14 gün aralıkla yeniden gelir; yanlış sorunun bağlaç kartı da kart tekrarına geri döner. "Zayıf konuların" listesi en düşük başarılı konuları gösterir.
- **Çıkmış sorular ↔ konular:** çıkmış sınavlardaki soruların şıklarına ve soru köküne bakan kurallar (`scripts/exam-grammar-rules.mjs`) kapalı küme ve biçim sorularını gramer konularına bağlar (edat, gerund / infinitive, modal, participle, passive, zaman uyumu ...); çıkmış bağlaç soruları bağlaç kartlarına bağlanır. Kurallar temkinlidir: emin olunmayan soru etiketsiz kalır. Veri setinde yer alan 28 sınavdaki sorular çoğunlukla kelime, çeviri, paragraf ve okuma olduğundan gramer eşleşmesi sınırlıdır.
- **Süreli deneme sınavı:** çıkmış bir sınav süreyle çözülür (soru listesi, işaretleme, kalan süre, otomatik bitiş). Sonuçta tahmini puan, hedefe kalan puan, bölüm bazlı analiz ve yanlışların açıklaması gelir; yanlışlar tekrar moduna ve ilgili kartlar kart tekrarına eklenir. Okuma parçası gerektiren sorular (parça metni yok) dahil değildir; puan, doğru oranının 100 üzerinden ölçeklenmiş halidir.
- **İlerleme ve hedef:** hedef puan (varsayılan 70 = 80 soruda 56 doğru), deneme puanı grafiği ve **soru tipine göre başarı** (kelime, dilbilgisi, cloze, cümle tamamlama, çeviri, okuma, diyalog, paragraf, anlam bütünlüğü). Her bölümde kaybedilen tahmini puan hesaplanıp "önce şuraya çalış" listesi çıkarılır. YDS'nin 80 soruluk standart dizilimi (soru numarasına göre bölüm) kullanılır.
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
data/grammar.json        gramer konu kartları (scripts/grammar_topics.py → python3 scripts/build-grammar.py)
data/grammar-questions.json gramer soruları (scripts/grammar_questions.py)
data/questions-trap.json tuzak soruları (scripts/build-trap-questions.py ile üretilir)
data/20xx_YDS_n.json     çıkmış sınavlar (ham)
data/exams.json          sınav listesi (node scripts/build-exam-data.mjs)
data/exam-conjunction-questions.json  sınavlardan ayıklanan bağlaç soruları (aynı betik)
data/exam-grammar-questions.json      sınavlardan gramer konularına bağlanan sorular (node scripts/build-exam-grammar.mjs; önce build-exam-data.mjs çalıştırılmalı)
data/words.json          kelimeler
js/srs.js                tekrar algoritması (saf fonksiyonlar)
js/store.js              localStorage: ilerleme, ayarlar
js/data.js               deste kaydı (DECKS)
js/qtype.js              YDS soru tipleri (bölümler) ve puan çarpanı
js/mock.js               deneme puanlama ve bölüm raporu
js/exams.js              ham sınav biçimini soru biçimine çevirir
js/render.js             deste türüne göre kart yüzleri
js/views/*.js            ekranlar (home, study, quiz, library, settings)
```

## Genişletme
- **Yeni deste:** `js/data.js` içindeki `DECKS` dizisine kayıt ekle, `js/render.js`'e aynı `type` için `front/back` çizici ekle.
- **Yeni ekran (ör. deneme sınavı):** `js/views/<ad>.js` oluştur (`export async function render(root, ctx)`), `js/main.js` içindeki `ROUTES` ve `NAV`'a ekle.
- **Yeni gramer konusu / sorusu:** `scripts/grammar_topics.py` ve `scripts/grammar_questions.py` dosyalarına ekle, `python3 scripts/build-grammar.py` çalıştır, `npm test` ile kontrol et. Konu id'leri `g-` ile başlar.
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
