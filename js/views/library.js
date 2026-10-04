import { h, chips } from '../ui.js';
import { loadDeck } from '../data.js';
import { getCard } from '../store.js';
import { status } from '../srs.js';
import { renderers } from '../render.js';

const LABEL = { new: 'Yeni', learning: 'Öğreniyor', mature: 'Öğrenildi' };

export async function render(root) {
  const cards = await loadDeck('conjunctions');
  const categories = ['Tümü', ...new Set(cards.map((c) => c.category))];
  let cat = 'Tümü';
  let q = '';
  const list = h('div', { class: 'list' });

  const search = h('input', { type: 'search', placeholder: 'Bağlaç veya anlam ara (ör. although, -e rağmen)', oninput: (e) => { q = e.target.value.trim().toLowerCase(); draw(); } });
  const catBar = h('div', { class: 'chips scroll' });
  root.append(h('header', { class: 'page-head' }, h('h1', null, 'Kartlar'), h('p', { class: 'muted' }, `${cards.length} bağlaç kartı`)), search, catBar, list);

  function drawCats() {
    catBar.replaceChildren(...categories.map((c) => h('button', { class: `chip chip-btn ${c === cat ? 'active' : ''}`, onclick: () => { cat = c; drawCats(); draw(); } }, c)));
  }

  function draw() {
    const rows = cards.filter((c) => (cat === 'Tümü' || c.category === cat) && (!q || [c.tr, c.rule, c.meaning, ...c.group].join(' ').toLowerCase().includes(q)));
    list.replaceChildren(...(rows.length ? rows.map((c) => {
      const st = status(getCard('conjunctions', c.id));
      return h('details', { class: 'card lib-item' },
        h('summary', null,
          h('div', null, h('strong', null, c.tr), h('span', { class: 'muted small' }, ' (', c.rule, ')')),
          h('span', { class: `dot dot-${st}`, title: LABEL[st] })),
        chips(c.group, 'chip'),
        renderers.conjunction.back(c, { onQuiz: () => { location.hash = `#/quiz?card=${encodeURIComponent(c.id)}`; } }));
    }) : [h('p', { class: 'muted' }, 'Sonuç bulunamadı.')]));
  }
  drawCats();
  draw();
}
