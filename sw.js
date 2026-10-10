// Çevrimdışı çalışma: uygulama dosyaları önbelleğe alınır, veri dosyaları "önce ağ, olmazsa önbellek" ile okunur.
const VERSION = 'dev'; // dağıtımda commit kısaltmasıyla değiştirilir (pages.yml)
const CACHE = `yds-cards-${VERSION}`;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'icons/icon.svg',
  'js/main.js', 'js/ui.js', 'js/store.js', 'js/srs.js', 'js/data.js', 'js/render.js', 'js/validate.js', 'js/exams.js', 'js/qtype.js', 'js/mock.js', 'js/version.js',
  'js/views/home.js', 'js/views/study.js', 'js/views/quiz.js', 'js/views/library.js', 'js/views/settings.js', 'js/views/mock.js', 'js/views/stats.js',
  'data/conjunctions.json', 'data/questions.json', 'data/questions-trap.json', 'data/exam-conjunction-questions.json', 'data/exams.json', 'data/grammar.json', 'data/grammar-questions.json', 'data/exam-grammar-questions.json', 'data/exam-vocab-questions.json', 'js/vocab.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html'))),
  );
});
