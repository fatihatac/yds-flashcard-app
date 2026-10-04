import { h, chips, shuffle } from '../ui.js';
import { loadDeck, loadQuestions } from '../data.js';
import { get, getCard, setCard, recordQuestion } from '../store.js';
import { newCardState } from '../srs.js';

export async function render(root, { query }) {
  const [questions, cards] = await Promise.all([loadQuestions(), loadDeck('conjunctions')]);
  const cardById = new Map(cards.map((c) => [c.id, c]));
  if (query.card) return run(root, questions.filter((q) => (q.cardIds || []).includes(query.card)), cardById, { title: cardById.get(query.card)?.tr });
  return picker(root, questions, cards, cardById);
}

function picker(root, questions, cards, cardById) {
  const stats = get().questions;
  const categories = [...new Set(cards.map((c) => c.category))];
  const catOf = (q) => (q.cardIds || []).map((id) => cardById.get(id)?.category);
  const wrong = questions.filter((q) => stats[q.id]?.lastCorrect === false);
  const unseen = questions.filter((q) => !stats[q.id]);
  const modes = [
    { label: `Karışık (${questions.length})`, pool: questions },
    { label: `Çözmediklerim (${unseen.length})`, pool: unseen },
    { label: `Yanlışlarım (${wrong.length})`, pool: wrong },
    ...categories.map((cat) => { const pool = questions.filter((q) => catOf(q).includes(cat)); return { label: `${cat} (${pool.length})`, pool }; }),
  ];
  let count = 10;
  const countSel = h('select', { onchange: (e) => { count = Number(e.target.value); } },
    [5, 10, 20, 0].map((n) => h('option', { value: n, selected: n === 10 }, n ? `${n} soru` : 'Hepsi')));

  root.append(
    h('header', { class: 'page-head' }, h('h1', null, 'Soru Çözümü'), h('p', { class: 'muted' }, 'Konuya göre YDS tarzı bağlaç soruları. Yanlış yaptığın sorunun kartı tekrar sırasına geri döner.')),
    h('label', { class: 'field' }, h('span', null, 'Soru sayısı'), countSel),
    h('div', { class: 'list' }, modes.map((m) => h('button', {
      class: 'card list-btn', disabled: !m.pool.length,
      onclick: () => { root.replaceChildren(); run(root, m.pool, cardById, { title: m.label.replace(/ \(\d+\)$/, ''), count }); },
    }, h('span', null, m.label), h('span', { class: 'muted' }, '›')))));
}

function run(root, pool, cardById, { title, count = 0 }) {
  const items = shuffle(pool).slice(0, count || pool.length).map((q) => {
    const order = shuffle(q.options.map((_, i) => i));
    return { q, order };
  });
  if (!items.length) { root.append(h('div', { class: 'empty' }, h('p', null, 'Bu seçim için soru yok.'), h('a', { class: 'btn btn-ghost', href: '#/quiz' }, 'Geri'))); return; }

  let idx = 0;
  const result = [];
  const box = h('div', { class: 'quiz' });
  root.append(box);
  show();

  function show() {
    if (idx >= items.length) return summary();
    const { q, order } = items[idx];
    let answered = false;
    const letters = 'ABCDE';
    const optEls = order.map((orig, pos) => h('button', {
      class: 'option',
      onclick: () => choose(orig, pos),
    }, h('b', null, letters[pos]), h('span', null, q.options[orig])));
    const feedback = h('div', { class: 'feedback' });
    box.replaceChildren(
      h('div', { class: 'study-top' },
        h('a', { class: 'icon-btn', href: '#/quiz', 'aria-label': 'Kapat' }, '✕'),
        h('div', { class: 'progress grow' }, h('span', { style: `width:${(idx / items.length) * 100}%` })),
        h('span', { class: 'muted small' }, `${idx + 1}/${items.length}`)),
      title ? h('p', { class: 'muted small' }, title) : null,
      h('p', { class: 'stem' }, stemNodes(q.stem)),
      h('div', { class: 'options' }, optEls),
      feedback);

    function choose(orig, pos) {
      if (answered) return;
      answered = true;
      const ok = orig === q.answer;
      recordQuestion(q.id, ok);
      result.push({ q, ok });
      order.forEach((o, p) => { if (o === q.answer) optEls[p].classList.add('correct'); });
      if (!ok) optEls[pos].classList.add('wrong');
      if (!ok) for (const id of q.cardIds || []) { const s = getCard('conjunctions', id); if (s) setCard('conjunctions', id, { ...newCardState(), ...s, due: Date.now() }); }
      const related = (q.cardIds || []).map((id) => cardById.get(id)).filter(Boolean);
      feedback.replaceChildren(
        h('p', { class: ok ? 'verdict ok' : 'verdict no' }, ok ? 'Doğru!' : `Yanlış – doğru cevap: ${letters[order.indexOf(q.answer)]}`),
        h('p', null, q.explanation || ''),
        ...related.map((c) => h('div', { class: 'related' }, h('span', { class: 'muted small' }, 'İlgili kart'), h('strong', null, c.tr, ' (', c.rule, ')'), chips(c.group), h('p', { class: 'tip-inline' }, h('b', null, 'Tüyo: '), c.tip))),
        h('button', { class: 'btn btn-primary btn-wide', onclick: () => { idx += 1; show(); window.scrollTo(0, 0); } }, idx + 1 === items.length ? 'Sonucu gör' : 'Sonraki soru'));
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function summary() {
    const right = result.filter((r) => r.ok).length;
    const misses = result.filter((r) => !r.ok);
    box.replaceChildren(
      h('div', { class: 'empty' },
        h('h2', null, `${right} / ${result.length} doğru`),
        h('p', { class: 'muted' }, `Başarı: %${Math.round((right / result.length) * 100)}`)),
      misses.length ? h('section', { class: 'card' }, h('h3', null, 'Yanlışların'), misses.map(({ q }) => h('div', { class: 'miss' }, h('p', { class: 'stem small' }, stemNodes(q.stem)), h('p', { class: 'muted small' }, 'Doğru: ', q.options[q.answer]), h('p', { class: 'small' }, q.explanation)))) : null,
      h('a', { class: 'btn btn-primary', href: '#/quiz' }, 'Yeni sınav'),
      h('a', { class: 'btn btn-ghost', href: '#/home' }, 'Ana sayfa'));
  }
}

function stemNodes(stem) {
  const parts = stem.split(/(_{2,})/);
  return parts.map((p) => (/^_{2,}$/.test(p) ? h('span', { class: 'blank' }, ' ') : p));
}
