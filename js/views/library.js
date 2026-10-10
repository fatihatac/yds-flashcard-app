import { h } from '../ui.js';
import { loadDeck } from '../data.js';
import { getCard } from '../store.js';
import { status } from '../srs.js';
import { renderers } from '../render.js';

const LABEL = { new: 'Yeni', learning: 'Öğreniyor', mature: 'Öğrenildi' };
const SECTIONS = [['conjunctions', 'Bağlaçlar', 'conjunction'], ['grammar', 'Gramer', 'grammar']];
let deckId = 'conjunctions'; // son seçilen sekme oturum boyunca hatırlanır

export async function render(root) {
  let cards = [];
  let cat = 'Tümü';
  let q = '';
  const list = h('div', { class: 'list' });
  const title = h('p', { class: 'muted' });
  const tabs = h('div', { class: 'seg', style: 'grid-template-columns: repeat(2, 1fr)' });
  const search = h('input', { type: 'search', placeholder: 'Ara (ör. although, present perfect, -e rağmen)', oninput: (e) => { q = e.target.value.trim().toLowerCase(); draw(); } });
  const catBar = h('div', { class: 'chips scroll' });
  root.append(h('header', { class: 'page-head' }, h('h1', null, 'Kartlar'), title), tabs, search, catBar, list);

  function drawTabs() {
    tabs.replaceChildren(...SECTIONS.map(([id, label]) => h('button', { class: id === deckId ? 'active' : '', onclick: () => { deckId = id; load(); } }, label)));
  }

  async function load() {
    cards = await loadDeck(deckId);
    cat = 'Tümü';
    title.textContent = `${cards.length} kart`;
    drawTabs();
    drawCats();
    draw();
  }

  function drawCats() {
    const categories = ['Tümü', ...new Set(cards.map((c) => c.category))];
    catBar.replaceChildren(...categories.map((c) => h('button', { class: `chip chip-btn ${c === cat ? 'active' : ''}`, onclick: () => { cat = c; drawCats(); draw(); } }, c)));
  }

  const searchText = (c) => [c.tr, c.rule, c.meaning, c.category, ...(c.group || []), ...(c.explanation || []), ...(c.tactics || [])].filter(Boolean).join(' ').toLowerCase();

  function draw() {
    const type = SECTIONS.find(([id]) => id === deckId)[2];
    const rows = cards.filter((c) => (cat === 'Tümü' || c.category === cat) && (!q || searchText(c).includes(q)));
    list.replaceChildren(...(rows.length ? rows.map((c) => {
      const st = status(getCard(deckId, c.id));
      const head = type === 'conjunction'
        ? h('div', null, h('strong', null, c.group.join(' / ')), h('span', { class: 'muted small' }, ' · ', c.tr))
        : h('div', null, h('strong', null, c.tr), h('span', { class: 'muted small' }, ' · ', c.category));
      return h('details', { class: 'card lib-item' },
        h('summary', null, head, h('span', { class: `dot dot-${st}`, title: LABEL[st] })),
        renderers[type].back(c, { onQuiz: () => { location.hash = `#/quiz?card=${encodeURIComponent(c.id)}`; } }));
    }) : [h('p', { class: 'muted' }, 'Sonuç bulunamadı.')]));
  }

  await load();
}
