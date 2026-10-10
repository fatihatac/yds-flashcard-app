import { h } from './ui.js';
import { get } from './store.js';

// Rota -> görünüm modülü. Yeni bir bölüm eklemek için buraya bir satır ve nav'a bir sekme eklemek yeterli.
const ROUTES = {
  home: () => import('./views/home.js'),
  study: () => import('./views/study.js'),
  quiz: () => import('./views/quiz.js'),
  library: () => import('./views/library.js'),
  mock: () => import('./views/mock.js'),
  stats: () => import('./views/stats.js'),
  settings: () => import('./views/settings.js'),
};
const NAV = [
  ['home', '🏠', 'Ana sayfa'],
  ['study', '🃏', 'Çalış'],
  ['quiz', '📝', 'Sorular'],
  ['library', '📖', 'Kartlar'],
  ['stats', '📈', 'İlerleme'],
  ['settings', '⚙️', 'Ayarlar'],
];

const root = document.getElementById('app');
const nav = document.getElementById('nav');
let cleanup = null;
let token = 0;

export function applyTheme() {
  const t = get().settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, qs = ''] = raw.split('?');
  const [name, ...params] = path.split('/').map(decodeURIComponent);
  return { name, params, query: Object.fromEntries(new URLSearchParams(qs)) };
}

async function route() {
  const my = ++token;
  const { name, params, query } = parseHash();
  const load = ROUTES[name] || ROUTES.home;
  if (cleanup) { cleanup(); cleanup = null; }
  const view = h('div', { class: 'view' });
  root.replaceChildren(view);
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.route === (ROUTES[name] ? name : 'home')));
  try {
    const mod = await load();
    const result = await mod.render(view, { params, query, applyTheme });
    if (my === token) cleanup = typeof result === 'function' ? result : null;
    else if (typeof result === 'function') result();
  } catch (err) {
    console.error(err);
    view.replaceChildren(h('div', { class: 'empty' }, h('h2', null, 'Bir hata oluştu'), h('p', { class: 'muted' }, err.message), h('a', { class: 'btn btn-ghost', href: '#/home' }, 'Ana sayfa')));
  }
}

nav.append(...NAV.map(([id, icon, label]) => h('a', { href: `#/${id}`, 'data-route': id }, h('span', { class: 'nav-icon' }, icon), h('span', null, label))));
applyTheme();
window.addEventListener('hashchange', route);
// Aynı adrese verilen bağlantılar (ör. quiz sonucundaki "Yeni sınav") hashchange üretmez; ekranı elle yenile.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#/"]');
  if (a && a.getAttribute('href') === location.hash) route();
});
route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  // Yeni sürüm yayınlanınca (yeni service worker devreye girince) sayfayı bir kez otomatik yenile.
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) location.reload(); });
}
