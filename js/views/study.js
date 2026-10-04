import { h, chips, mulberry32, shuffle } from '../ui.js';
import { DECKS, deckById, loadDeck } from '../data.js';
import { get, getCard, setCard, logReview, newDoneToday, todayKey } from '../store.js';
import { schedule, isDue, status, previewLabels, RATING } from '../srs.js';
import { renderers } from '../render.js';
import { counts } from './home.js';

const RATE_BUTTONS = [
  { r: RATING.AGAIN, label: 'Tekrar', cls: 'again' },
  { r: RATING.HARD, label: 'Zor', cls: 'hard' },
  { r: RATING.GOOD, label: 'İyi', cls: 'good' },
  { r: RATING.EASY, label: 'Kolay', cls: 'easy' },
];

export async function render(root, { params, query }) {
  const [deckId] = params;
  if (!deckId) return picker(root);
  const deck = deckById(deckId);
  if (!deck) { root.append(h('p', null, 'Deste bulunamadı.')); return; }
  return session(root, deck, query);
}

async function picker(root) {
  root.append(h('header', { class: 'page-head' }, h('h1', null, 'Çalış'), h('p', { class: 'muted' }, 'Bir deste seç.')));
  for (const deck of DECKS) {
    const c = await counts(deck.id);
    root.append(h('a', { class: 'card deck link-card', href: `#/study/${deck.id}` },
      h('div', { class: 'deck-head' }, h('span', { class: 'deck-icon' }, deck.icon), h('div', null, h('h2', null, deck.title), h('p', { class: 'muted' }, `${c.newAvail} yeni · ${c.due} tekrar`)))));
  }
}

async function buildQueue(deck, query) {
  let cards = await loadDeck(deck.id);
  if (query.cat) cards = cards.filter((c) => c.category === query.cat);
  const now = Date.now();
  const due = cards
    .filter((c) => { const s = getCard(deck.id, c.id); return status(s) !== 'new' && isDue(s, now); })
    .sort((a, b) => getCard(deck.id, a.id).due - getCard(deck.id, b.id).due)
    .slice(0, get().settings.maxReviews);
  let fresh = cards.filter((c) => status(getCard(deck.id, c.id)) === 'new');
  if (!deck.ordered) fresh = shuffle(fresh, mulberry32(Number(todayKey().replaceAll('-', ''))));
  const limit = query.extra ? 10 : Math.max(0, (get().settings.newPerDay[deck.id] ?? 10) - newDoneToday(deck.id));
  return [...due, ...fresh.slice(0, limit)].map((c) => c.id);
}

async function session(root, deck, query) {
  const cards = await loadDeck(deck.id);
  const byId = new Map(cards.map((c) => [c.id, c]));
  const queue = await buildQueue(deck, query);
  const total = queue.length;
  const stats = { done: 0, again: 0 };
  const view = renderers[deck.type];
  let showingBack = false; // kartın hangi yüzü açık
  let revealed = false; // cevap en az bir kez görüldü mü (puanlamayı açar)

  if (!total) {
    root.append(h('div', { class: 'empty' },
      h('h2', null, 'Bugünlük tamam 🎉'),
      h('p', { class: 'muted' }, 'Bu deste için tekrar edilecek veya bugün eklenecek yeni kart kalmadı.'),
      h('a', { class: 'btn btn-primary', href: `#/study/${deck.id}?extra=1${query.cat ? `&cat=${encodeURIComponent(query.cat)}` : ''}` }, '10 yeni kart daha çalış'),
      h('a', { class: 'btn btn-ghost', href: '#/home' }, 'Ana sayfa')));
    return;
  }

  const top = h('div', { class: 'study-top' });
  const stage = h('div', { class: 'stage' });
  const rateBar = h('div', { class: 'rate-bar' });
  root.append(top, stage, rateBar);

  function draw() {
    showingBack = false;
    revealed = false;
    if (!queue.length) return finish();
    const card = byId.get(queue[0]);
    top.replaceChildren(
      h('a', { class: 'icon-btn', href: '#/home', 'aria-label': 'Kapat' }, '✕'),
      h('div', { class: 'progress grow' }, h('span', { style: `width:${(stats.done / total) * 100}%` })),
      h('span', { class: 'muted small' }, `${queue.length} kaldı`),
      h('button', { class: 'icon-btn flip-btn', 'aria-label': 'Kartı çevir', title: 'Ön / arka yüzü çevir', onclick: toggle }, '⇄'));
    const face = h('div', { class: 'flashcard', role: 'button', tabindex: '0', onclick: onCardClick, onkeydown: (e) => { if (e.key === 'Enter') toggle(); } }, view.front(card));
    stage.replaceChildren(face);
    rateBar.replaceChildren(h('button', { class: 'btn btn-primary btn-wide', onclick: toggle }, 'Cevabı göster'));
    stage.dataset.state = status(getCard(deck.id, card.id));
    window.scrollTo(0, 0);
  }

  // Karta dokununca ön / arka yüz arasında gidip gelinir; metin seçerken çevrilmez.
  function onCardClick() {
    if (window.getSelection().toString()) return;
    toggle();
  }

  function toggle() {
    const card = byId.get(queue[0]);
    const face = stage.querySelector('.flashcard');
    if (!card || !face) return;
    showingBack = !showingBack;
    face.classList.toggle('flipped', showingBack);
    face.replaceChildren(showingBack
      ? view.back(card, deck.type === 'conjunction' ? { onQuiz: () => { location.hash = `#/quiz?card=${encodeURIComponent(card.id)}`; } } : {})
      : view.front(card));
    if (showingBack && !revealed) {
      revealed = true;
      const labels = previewLabels(getCard(deck.id, card.id));
      rateBar.replaceChildren(...RATE_BUTTONS.map((b, i) => h('button', { class: `rate rate-${b.cls}`, onclick: () => rate(b.r) }, h('span', null, b.label), h('small', null, labels[i]))));
    }
    window.scrollTo(0, 0);
  }

  function rate(r) {
    if (!revealed) return;
    const id = queue.shift();
    const prev = getCard(deck.id, id);
    setCard(deck.id, id, schedule(prev, r));
    logReview({ correct: r > RATING.AGAIN, isNew: !prev, deckId: deck.id });
    if (r === RATING.AGAIN) { stats.again += 1; queue.splice(Math.min(queue.length, 3), 0, id); } else stats.done += 1;
    draw();
  }

  function finish() {
    top.replaceChildren();
    rateBar.replaceChildren();
    stage.replaceChildren(h('div', { class: 'empty' },
      h('h2', null, 'Oturum bitti 🎉'),
      h('p', null, `${total} kart tamamlandı.`),
      stats.again ? h('p', { class: 'muted' }, `${stats.again} kez "Tekrar" seçtin; bu kartlar yakında yeniden gelecek.`) : null,
      h('a', { class: 'btn btn-primary', href: `#/quiz${deck.type === 'conjunction' ? '' : ''}` }, deck.type === 'conjunction' ? 'Şimdi soru çöz' : 'Soru çözümü'),
      h('a', { class: 'btn btn-ghost', href: '#/home' }, 'Ana sayfa')));
  }

  const onKey = (e) => {
    if (e.target.closest('input,textarea')) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    else if (revealed && /^[1-4]$/.test(e.key)) rate(Number(e.key) - 1);
  };
  document.addEventListener('keydown', onKey);
  draw();
  return () => document.removeEventListener('keydown', onKey);
}
