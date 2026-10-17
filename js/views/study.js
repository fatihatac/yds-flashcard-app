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
  root.append(h('header', { class: 'page-head' }, h('h1', null, 'Çalış'), h('p', { class: 'muted' }, 'Bir deste ve istersen bir konu grubu seç.')));
  for (const deck of DECKS) {
    const c = await counts(deck.id);
    const cards = await loadDeck(deck.id);
    const cats = [...new Set(cards.map((x) => x.category).filter(Boolean))];
    root.append(h('section', { class: 'card deck' },
      h('a', { class: 'deck-head', href: `#/study/${deck.id}` }, h('span', { class: 'deck-icon' }, deck.icon), h('div', null, h('h2', null, deck.title), h('p', { class: 'muted' }, `${c.newAvail} yeni · ${c.due} tekrar`))),
      cats.length ? h('div', { class: 'deck-cats' }, cats.map((cat) => h('a', { class: 'chip chip-btn', href: `#/study/${deck.id}?cat=${encodeURIComponent(cat)}` }, cat))) : null));
  }
}

const AHEAD_COUNT = 20;

async function deckCards(deck, query) {
  const cards = await loadDeck(deck.id);
  return query.cat ? cards.filter((c) => c.category === query.cat) : cards;
}

// Sırası henüz gelmemiş öğrenilmiş kartlar (erken tekrar): en uzun süredir görülmeyen önce gelir, böylece her oturum farklı kartlarla devam eder.
function aheadCards(deck, cards, now = Date.now()) {
  const s = (c) => getCard(deck.id, c.id);
  return cards
    .filter((c) => status(s(c)) !== 'new' && !isDue(s(c), now))
    .sort((a, b) => (s(a).last || 0) - (s(b).last || 0) || s(a).due - s(b).due);
}

// Oturum bitince / kart kalmayınca: yeni kart varsa "10 yeni kart daha", yoksa "erken tekrar" seçeneği.
async function moreButtons(deck, query) {
  const cards = await deckCards(deck, query);
  const fresh = cards.filter((c) => status(getCard(deck.id, c.id)) === 'new').length;
  const ahead = aheadCards(deck, cards).length;
  const cat = query.cat ? `&cat=${encodeURIComponent(query.cat)}` : '';
  return {
    fresh,
    ahead,
    buttons: [
      fresh ? h('a', { class: 'btn btn-primary', href: `#/study/${deck.id}?extra=1${cat}` }, `${Math.min(10, fresh)} yeni kart daha çalış`) : null,
      ahead ? h('a', { class: `btn ${fresh ? 'btn-ghost' : 'btn-primary'}`, href: `#/study/${deck.id}?ahead=1${cat}` }, `Erken tekrar: ${Math.min(AHEAD_COUNT, ahead)} kart`) : null,
    ],
  };
}

async function buildQueue(deck, query) {
  const cards = await deckCards(deck, query);
  const now = Date.now();
  if (query.ahead) return aheadCards(deck, cards, now).slice(0, AHEAD_COUNT).map((c) => c.id);
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
    const more = await moreButtons(deck, query);
    root.append(h('div', { class: 'empty' },
      h('h2', null, 'Bugünlük tamam 🎉'),
      h('p', { class: 'muted' }, more.fresh
        ? 'Bu deste için tekrar edilecek veya bugün eklenecek yeni kart kalmadı.'
        : `Bu destedeki ${(await deckCards(deck, query)).length} kartın hepsini öğrendin; yeni kart kalmadı. İstersen sırası gelmemiş kartları erken tekrar edebilirsin.`),
      ...more.buttons,
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
      ? view.back(card, deck.type !== 'word' ? { onQuiz: () => { location.hash = `#/quiz?card=${encodeURIComponent(card.id)}`; } } : {})
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
    // Erken tekrarda iyi bilinen kartın aralığı büyütülmez (sırası gelmeden görüldü), yalnızca görülme zamanı güncellenir;
    // unutulan / zor kart yine yeniden planlanır.
    if (query.ahead && r >= RATING.GOOD) setCard(deck.id, id, { ...prev, last: Date.now() });
    else setCard(deck.id, id, schedule(prev, r));
    logReview({ correct: r > RATING.AGAIN, isNew: !prev, deckId: deck.id });
    if (r === RATING.AGAIN) { stats.again += 1; queue.splice(Math.min(queue.length, 3), 0, id); } else stats.done += 1;
    draw();
  }

  async function finish() {
    top.replaceChildren();
    rateBar.replaceChildren();
    const more = await moreButtons(deck, query);
    stage.replaceChildren(h('div', { class: 'empty' },
      h('h2', null, 'Oturum bitti 🎉'),
      h('p', null, `${total} kart tamamlandı.`),
      stats.again ? h('p', { class: 'muted' }, `${stats.again} kez "Tekrar" seçtin; bu kartlar yakında yeniden gelecek.`) : null,
      h('a', { class: 'btn btn-primary', href: '#/quiz' }, deck.type !== 'word' ? 'Şimdi soru çöz' : 'Soru çözümü'),
      ...more.buttons.map((b) => { if (b) b.className = 'btn btn-ghost'; return b; }),
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
