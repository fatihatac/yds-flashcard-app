import { h, chips, shuffle } from '../ui.js';
import { loadDeck, loadQuestions, loadExamList, loadExamQuestions, resolveQuestions } from '../data.js';
import { get, getCard, setCard, recordQuestion, reviewDueIds, reviewPendingCount } from '../store.js';
import { newCardState } from '../srs.js';

const KIND_LABEL = { basic: 'Temel', trap: 'Tuzak', exam: 'Çıkmış soru', custom: 'Eklenen', grammar: 'Gramer' };
const isGrammarId = (id) => id.startsWith('g-');
const deckOfCard = (id) => (isGrammarId(id) ? 'grammar' : 'conjunctions');
let area = 'conjunctions'; // picker sekmesi: conjunctions | grammar | exams

export async function render(root, { query }) {
  const [questions, conj, grammar] = await Promise.all([loadQuestions(), loadDeck('conjunctions'), loadDeck('grammar')]);
  const cardById = new Map([...conj, ...grammar].map((c) => [c.id, c]));
  if (query.card) {
    const pool = questions.filter((q) => (q.cardIds || []).includes(query.card));
    return run(root, pool, cardById, { title: cardById.get(query.card)?.tr });
  }
  if (query.exam) {
    const exam = (await loadExamList()).find((e) => e.id === query.exam);
    const pool = await loadExamQuestions(query.exam);
    return run(root, pool, cardById, { title: exam?.title, ordered: true });
  }
  if (query.mode === 'review') {
    const pool = await resolveQuestions(reviewDueIds());
    return run(root, pool, cardById, { title: 'Tekrar modu', count: 20, empty: 'Şu an tekrar sırası gelen soru yok. Yanlış yaptığın sorular 1, 3, 7 ve 14 gün arayla yeniden gelir.' });
  }
  return picker(root, questions, { conj, grammar }, cardById);
}

// Konuya göre başarı: her kart / konu için çözülen ve doğru sayısı (yalnızca hata yapılanlar).
function topicStats(questions) {
  const stats = get().questions;
  const byCard = new Map();
  for (const q of questions) {
    const s = stats[q.id];
    if (!s) continue;
    for (const id of q.cardIds || []) {
      const t = byCard.get(id) || { id, seen: 0, correct: 0 };
      t.seen += s.seen;
      t.correct += s.correct;
      byCard.set(id, t);
    }
  }
  return [...byCard.values()].filter((t) => t.seen > t.correct).map((t) => ({ ...t, rate: t.correct / t.seen }))
    .sort((a, b) => a.rate - b.rate || b.seen - a.seen);
}

async function picker(root, questions, { conj, grammar }, cardById) {
  const stats = get().questions;
  const due = reviewDueIds().length;
  const weak = topicStats(questions).slice(0, 5);
  const exams = await loadExamList();

  let count = 10;
  const countSel = h('select', { onchange: (e) => { count = Number(e.target.value); } },
    [5, 10, 20, 0].map((n) => h('option', { value: n, selected: n === 10 }, n ? `${n} soru` : 'Hepsi')));
  const start = (pool, title) => { root.replaceChildren(); run(root, pool, cardById, { title, count }); };
  const row = (label, sub, onclick, disabled) => h('button', { class: 'card list-btn', disabled, onclick },
    h('span', { class: 'list-text' }, h('span', null, label), sub && h('span', { class: 'muted small' }, sub)), h('span', { class: 'muted' }, '›'));

  const body = h('div', { class: 'view' });
  const tabs = h('div', { class: 'seg', role: 'tablist' });
  const TABS = [['conjunctions', 'Bağlaç'], ['grammar', 'Gramer'], ['exams', 'Çıkmış sınavlar']];

  function drawTabs() {
    tabs.replaceChildren(...TABS.map(([id, label]) => h('button', { class: id === area ? 'active' : '', role: 'tab', onclick: () => { area = id; drawTabs(); drawBody(); } }, label)));
  }

  function poolModes(pool, cards) {
    const categories = [...new Set(cards.map((c) => c.category))];
    const catOf = (q) => (q.cardIds || []).map((id) => cardById.get(id)?.category);
    return [
      ['Çözmediklerim', pool.filter((q) => !stats[q.id])],
      ['Yanlışlarım', pool.filter((q) => stats[q.id]?.lastCorrect === false)],
      ...categories.map((cat) => [cat, pool.filter((q) => catOf(q).includes(cat))]),
    ];
  }

  function drawBody() {
    const list = (modes) => h('div', { class: 'list' }, modes.map(([label, pool]) => row(`${label} (${pool.length})`, null, () => start(pool, label), !pool.length)));
    if (area === 'conjunctions') {
      const pool = questions.filter((q) => q.area !== 'grammar');
      body.replaceChildren(
        h('h2', { class: 'section-title' }, 'Bağlaç soruları'),
        list([['Karışık', pool.filter((q) => q.kind !== 'exam')], ['Tuzak soruları', pool.filter((q) => q.kind === 'trap')], ['Çıkmış YDS bağlaç soruları', pool.filter((q) => q.kind === 'exam')],
          ...poolModes(pool.filter((q) => q.kind !== 'exam'), conj)]));
    } else if (area === 'grammar') {
      const pool = questions.filter((q) => q.area === 'grammar');
      body.replaceChildren(
        h('h2', { class: 'section-title' }, 'Gramer soruları'),
        list([['Karışık', pool], ['Çıkmış gramer soruları', pool.filter((q) => q.kind === 'exam')], ['Konu anlatımlı sorular', pool.filter((q) => q.kind === 'grammar')], ...poolModes(pool, grammar)]),
        h('h2', { class: 'section-title' }, 'Konuya göre'),
        h('div', { class: 'list' }, grammar.map((g) => {
          const qs = pool.filter((q) => (q.cardIds || []).includes(g.id));
          return row(g.tr, `${g.category} · ${qs.length} soru`, () => start(qs, g.tr), !qs.length);
        })));
    } else {
      body.replaceChildren(
        h('h2', { class: 'section-title' }, 'Çıkmış YDS sınavları (deneme)'),
        h('p', { class: 'muted small' }, 'Süreli deneme olarak çözülür, bölüm bazlı analiz verir. Okuma parçası gerektiren sorular (parça metni yok) dahil edilmez.'),
        h('div', { class: 'list' }, exams.map((e) => row(e.title.replace(/YABANCI DİL BİLGİSİ SEVİYE TESPİT SINAVI/i, 'YDS').replace(/\s+/g, ' '), `${e.solvable} çözülebilir soru`, () => { location.hash = `#/mock/${encodeURIComponent(e.id)}`; }))));
    }
  }

  root.append(
    h('header', { class: 'page-head' }, h('h1', null, 'Soru Çözümü'), h('p', { class: 'muted' }, `${questions.length} bağlaç ve gramer sorusu, ${exams.length} çıkmış YDS sınavı. Yanlış yaptığın soru ve kartı tekrar sırasına döner.`)),
    h('label', { class: 'field' }, h('span', null, 'Soru sayısı'), countSel),
    h('a', { class: `card review-card ${due ? '' : 'disabled'}`, href: due ? '#/quiz?mode=review' : null },
      h('div', null, h('h2', null, 'Tekrar modu'), h('p', { class: 'muted small' }, due ? `${due} soru tekrar için hazır` : `Şu an sırası gelen soru yok (${reviewPendingCount()} soru takipte)`)),
      h('span', { class: 'pill pill-due' }, h('strong', null, due))));

  if (weak.length) {
    root.append(h('h2', { class: 'section-title' }, 'Zayıf konuların'), h('div', { class: 'list' }, weak.map((t) => {
      const c = cardById.get(t.id);
      return row(`${c.tr}`, `${isGrammarId(t.id) ? c.category : c.group.slice(0, 3).join(' / ')} · %${Math.round(t.rate * 100)} doğru (${t.correct}/${t.seen})`, () => start(questions.filter((q) => (q.cardIds || []).includes(t.id)), c.tr));
    })));
  }
  root.append(tabs, body);
  drawTabs();
  drawBody();
}

function run(root, pool, cardById, { title, count = 0, ordered = false, empty = 'Bu seçim için soru yok.' }) {
  const picked = ordered ? pool : shuffle(pool);
  const items = picked.slice(0, count || picked.length).map((q) => ({ q, order: q.kind === 'exam' ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i)) }));
  if (!items.length) { root.append(h('div', { class: 'empty' }, h('p', null, empty), h('a', { class: 'btn btn-ghost', href: '#/quiz' }, 'Geri'))); return; }

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
    const optEls = order.map((orig, pos) => h('button', { class: 'option', onclick: () => choose(orig, pos) }, h('b', null, letters[pos]), h('span', null, q.options[orig])));
    const feedback = h('div', { class: 'feedback' });
    box.replaceChildren(
      h('div', { class: 'study-top' },
        h('a', { class: 'icon-btn', href: '#/quiz', 'aria-label': 'Kapat' }, '✕'),
        h('div', { class: 'progress grow' }, h('span', { style: `width:${(idx / items.length) * 100}%` })),
        h('span', { class: 'muted small' }, `${idx + 1}/${items.length}`)),
      h('p', { class: 'muted small' }, [title, KIND_LABEL[q.kind]].filter(Boolean).join(' · ')),
      h('p', { class: 'stem' }, stemNodes(q.stem)),
      h('div', { class: 'options' }, optEls),
      feedback);

    function choose(orig, pos) {
      if (answered) return;
      answered = true;
      const ok = orig === q.answer;
      recordQuestion(q.id, ok, q.section || (q.kind === 'exam' ? undefined : 'grammar'));
      result.push({ q, ok });
      order.forEach((o, p) => { if (o === q.answer) optEls[p].classList.add('correct'); });
      if (!ok) optEls[pos].classList.add('wrong');
      if (!ok) for (const id of q.cardIds || []) { const deck = deckOfCard(id); const s = getCard(deck, id); if (s) setCard(deck, id, { ...newCardState(), ...s, due: Date.now() }); }
      const related = (q.cardIds || []).map((id) => cardById.get(id)).filter(Boolean);
      feedback.replaceChildren(
        h('p', { class: ok ? 'verdict ok' : 'verdict no' }, ok ? 'Doğru!' : `Yanlış – doğru cevap: ${letters[order.indexOf(q.answer)]}`),
        q.explanation ? h('p', null, q.explanation) : null,
        q.source ? h('p', { class: 'muted small' }, q.source) : null,
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
      misses.length ? h('section', { class: 'card' }, h('h3', null, 'Yanlışların (tekrar moduna eklendi)'), misses.map(({ q }) => h('div', { class: 'miss' }, h('p', { class: 'stem small' }, stemNodes(q.stem)), h('p', { class: 'muted small' }, 'Doğru: ', q.options[q.answer]), q.explanation ? h('p', { class: 'small' }, q.explanation) : null))) : null,
      h('a', { class: 'btn btn-primary', href: '#/quiz' }, 'Yeni sınav'),
      h('a', { class: 'btn btn-ghost', href: '#/home' }, 'Ana sayfa'));
  }
}

function stemNodes(stem) {
  const parts = stem.split(/(_{2,})/);
  return parts.map((p) => (/^_{2,}$/.test(p) ? h('span', { class: 'blank' }, ' ') : p));
}
