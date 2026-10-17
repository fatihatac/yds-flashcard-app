// Çevrimdışı çalışma: kurulumda uygulamanın tüm dosyaları (kod, kartlar, kelimeler, 28 çıkmış sınav) önbelleğe alınır.
// İstekler "önce ağ, olmazsa önbellek" ile karşılanır; ağ yavaşsa (uçak Wi-Fi'ı vb.) kısa süre sonra önbellekten dönülür.
const VERSION = 'dev'; // dağıtımda commit kısaltmasıyla değiştirilir (pages.yml)
const CACHE = `yds-cards-${VERSION}`;
const NET_TIMEOUT = 3500;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/main.js', 'js/ui.js', 'js/store.js', 'js/srs.js', 'js/data.js', 'js/render.js', 'js/validate.js', 'js/exams.js', 'js/qtype.js', 'js/mock.js', 'js/version.js', 'js/vocab.js', 'js/plan.js', 'js/offline.js',
  'js/views/home.js', 'js/views/study.js', 'js/views/quiz.js', 'js/views/library.js', 'js/views/settings.js', 'js/views/mock.js', 'js/views/plan.js', 'js/views/stats.js',
  'data/conjunctions.json', 'data/grammar.json', 'data/words.json', 'data/exams.json',
  'data/questions.json', 'data/questions-trap.json', 'data/grammar-questions.json',
  'data/exam-conjunction-questions.json', 'data/exam-grammar-questions.json', 'data/exam-vocab-questions.json', 'data/exam-translation-questions.json',
];

// Çıkmış sınav dosyaları exams.json'daki listeden okunur (yeni sınav eklenince burayı değiştirmek gerekmez).
async function allFiles() {
  try {
    const exams = await (await caches.match('data/exams.json') || await fetch('data/exams.json')).clone().json();
    return [...SHELL, ...exams.map((e) => `data/${e.file}`)];
  } catch { return SHELL; }
}

async function missingFiles() {
  const cache = await caches.open(CACHE);
  const files = await allFiles();
  const hits = await Promise.all(files.map((f) => cache.match(f)));
  return { files, missing: files.filter((_, i) => !hits[i]) };
}

// Eksik dosyaları tek tek indirir; biri inemezse diğerleri yine önbelleğe girer.
async function fillCache() {
  const cache = await caches.open(CACHE);
  const { files, missing } = await missingFiles();
  await Promise.all(missing.map((f) => fetch(f, { cache: 'no-cache' }).then((r) => (usable(r) ? cache.put(f, r) : null)).catch(() => null)));
  const left = (await missingFiles()).missing.length;
  return { total: files.length, ready: files.length - left };
}

// Uçak / otel Wi-Fi'larındaki giriş sayfaları yönlendirme yapar; böyle yanıtlar önbelleğe yazılmaz.
const usable = (res) => res && res.ok && !res.redirected && res.type === 'basic';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(fillCache).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => {
  const port = e.ports[0];
  if (!port) return;
  if (e.data === 'offline-status') missingFiles().then(({ files, missing }) => port.postMessage({ total: files.length, ready: files.length - missing.length, version: VERSION }));
  if (e.data === 'offline-sync') fillCache().then((r) => port.postMessage({ ...r, version: VERSION }));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const cached = () => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then((hit) => hit || caches.match('index.html'));
  const network = fetch(req, { cache: 'no-cache' }).then((res) => {
    if (usable(res)) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }
    throw new Error('kullanılamaz yanıt');
  });
  e.waitUntil(network.catch(() => {})); // yavaş ağda önbellekten dönülse de yanıt gelince önbellek tazelenir
  e.respondWith(new Promise((resolve) => {
    let done = false;
    const finish = (p) => p.then((r) => { if (!done && r) { done = true; resolve(r); } return r; });
    const timer = setTimeout(() => finish(cached()), NET_TIMEOUT);
    network.then((r) => { clearTimeout(timer); finish(Promise.resolve(r)); })
      .catch(() => { clearTimeout(timer); finish(cached()).then((r) => { if (!done) { done = true; resolve(r || Response.error()); } }); });
  }));
});
