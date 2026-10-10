import { h, chips } from '../ui.js';
import { loadExamList, loadExamQuestions, loadQuestions, loadDeck, loadWordIndex } from '../data.js';
import { findWord } from '../vocab.js';
import { recordQuestion, addMock, get, getCard, setCard, forceDue } from '../store.js';
import { sectionById } from '../qtype.js';
import { scoreMock, neededCorrect } from '../mock.js';
import { newCardState } from '../srs.js';

const fmt = (n) => String(n).replace('.', ',');
const clock = (sec) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const shortTitle = (t) => t.replace(/YABANCI DİL BİLGİSİ SEVİYE TESPİT SINAVI/i, 'YDS').replace(/\s+/g, ' ');

export async function render(root, { params }) {
  const [examId] = params;
  if (!examId) return list(root);
  return setup(root, decodeURIComponent(examId));
}

async function list(root) {
  const exams = await loadExamList();
  const mocks = get().mocks;
  root.append(
    h('header', { class: 'page-head' }, h('h1', null, 'Deneme Sınavı'), h('p', { class: 'muted' }, 'Çıkmış bir sınavı süreli çöz; bölüm bazlı analiz ve tahmini puan al.')),
    h('div', { class: 'list' }, exams.map((e) => {
      const last = [...mocks].reverse().find((m) => m.examId === e.id);
      return h('a', { class: 'card list-btn', href: `#/mock/${encodeURIComponent(e.id)}` },
        h('span', { class: 'list-text' }, h('span', null, shortTitle(e.title)), h('span', { class: 'muted small' }, `${e.solvable} çözülebilir soru${last ? ` · son: ${last.correct}/${last.total} (≈ ${fmt(last.scaled)} puan)` : ''}`)),
        h('span', { class: 'muted' }, '›'));
    })));
}

async function setup(root, examId) {
  const exam = (await loadExamList()).find((e) => e.id === examId);
  if (!exam) { root.append(h('div', { class: 'empty' }, h('p', null, 'Sınav bulunamadı.'), h('a', { class: 'btn btn-ghost', href: '#/mock' }, 'Geri'))); return; }
  const questions = await loadExamQuestions(examId);
  const minutesFor = (n) => Math.round((180 * n) / 80);
  const minutes = minutesFor(questions.length);
  const target = get().settings.targetScore ?? 70;
  let timed = true;
  let mini = (get().settings.dailyMinutes ?? 90) <= 60; // kısa çalışma süresinde mini deneme varsayılan
  const mode = h('div', { class: 'seg', style: 'grid-template-columns: repeat(2, 1fr)' });
  const drawMode = () => mode.replaceChildren(
    h('button', { class: timed ? 'active' : '', onclick: () => { timed = true; drawMode(); } }, `Süreli (${minutesFor(mini ? 30 : questions.length)} dk)`),
    h('button', { class: timed ? '' : 'active', onclick: () => { timed = false; drawMode(); } }, 'Süresiz'));
  drawMode();
  const size = h('div', { class: 'seg', style: 'grid-template-columns: repeat(2, 1fr)' });
  const drawSize = () => size.replaceChildren(
    h('button', { class: mini ? '' : 'active', onclick: () => { mini = false; drawSize(); drawMode(); } }, `Tam (${questions.length} soru)`),
    h('button', { class: mini ? 'active' : '', onclick: () => { mini = true; drawSize(); drawMode(); } }, 'Mini (30 soru)'));
  drawSize();
  root.append(
    h('header', { class: 'page-head' }, h('h1', null, shortTitle(exam.title)), h('p', { class: 'muted' }, `${questions.length} çözülebilir soru`)),
    h('section', { class: 'card' },
      h('p', null, `Süre, çözülebilir soru sayısına göre ${minutes} dakikaya ayarlandı (gerçek sınav: 80 soru, 180 dakika).`),
      h('p', null, `Okuma parçası gerektiren ${exam.count - questions.length} soru, parça metinleri bu veri setinde olmadığı için dahil edilmedi. Puan, doğru oranının 100 üzerinden ölçeklenmiş halidir.`),
      h('p', null, `Hedef ${target} puan = 80 soruda ${neededCorrect(target)} doğru.`),
      size, mode),
    h('button', { class: 'btn btn-primary btn-wide', onclick: () => {
      const qs = mini ? sampleSubset(questions, 30) : questions;
      root.replaceChildren();
      runExam(root, exam, qs, timed ? Math.round((180 * 60 * qs.length) / 80) : 0);
    } }, 'Sınavı başlat'),
    h('a', { class: 'btn btn-ghost', href: '#/mock' }, 'Geri'));
}

function runExam(root, exam, questions, allowed) {
  const answers = {};
  const flags = new Set();
  let idx = 0;
  let left = allowed;
  const started = Date.now();
  let timer = null;
  const timerEl = h('span', { class: 'timer' }, allowed ? clock(left) : '∞');
  const box = h('div', { class: 'quiz' });
  root.append(box);
  if (allowed) {
    timer = setInterval(() => {
      left -= 1;
      timerEl.textContent = clock(left);
      timerEl.classList.toggle('low', left <= 600);
      if (left <= 0) finish(true);
    }, 1000);
  }
  draw();

  function draw() {
    const q = questions[idx];
    const sec = sectionById(q.section);
    const grid = questions.map((x, i) => h('button', { class: `qdot ${i === idx ? 'cur' : ''} ${answers[x.id] != null ? 'done' : ''} ${flags.has(x.id) ? 'flag' : ''}`, onclick: () => { idx = i; draw(); window.scrollTo(0, 0); } }, i + 1));
    box.replaceChildren(
      h('div', { class: 'study-top' },
        h('button', { class: 'icon-btn', 'aria-label': 'Çık', onclick: () => { if (confirm('Sınavdan çıkılsın mı? İlerleme kaybolur.')) { clearInterval(timer); location.hash = '#/mock'; } } }, '✕'),
        h('div', { class: 'progress grow' }, h('span', { style: `width:${(Object.keys(answers).length / questions.length) * 100}%` })),
        timerEl,
        h('button', { class: 'btn btn-ghost mini', onclick: () => finish(false) }, 'Bitir')),
      h('p', { class: 'muted small' }, `Soru ${idx + 1}/${questions.length} · ${sec ? sec.label : ''}`),
      h('p', { class: 'stem' }, stemNodes(q.stem)),
      h('div', { class: 'options' }, q.options.map((o, i) => h('button', { class: `option ${answers[q.id] === i ? 'picked' : ''}`, onclick: () => { answers[q.id] = answers[q.id] === i ? undefined : i; draw(); } }, h('b', null, 'ABCDE'[i]), h('span', null, o)))),
      h('div', { class: 'nav-row' },
        h('button', { class: 'btn btn-ghost', disabled: idx === 0, onclick: () => { idx -= 1; draw(); window.scrollTo(0, 0); } }, '← Önceki'),
        h('button', { class: `btn btn-ghost ${flags.has(q.id) ? 'flagged' : ''}`, onclick: () => { flags.has(q.id) ? flags.delete(q.id) : flags.add(q.id); draw(); } }, flags.has(q.id) ? '⚑ İşaretli' : '⚐ İşaretle'),
        h('button', { class: 'btn btn-primary', onclick: () => { if (idx + 1 < questions.length) { idx += 1; draw(); window.scrollTo(0, 0); } else finish(false); } }, idx + 1 < questions.length ? 'Sonraki →' : 'Bitir')),
      h('details', { class: 'card' }, h('summary', null, 'Soru listesi (', Object.keys(answers).filter((k) => answers[k] != null).length, ' cevaplandı, ', flags.size, ' işaretli)'), h('div', { class: 'qgrid' }, grid)));
  }

  async function finish(auto) {
    const blank = questions.filter((q) => answers[q.id] == null).length;
    if (!auto && blank && !confirm(`${blank} soru boş. Sınavı bitirmek istiyor musun?`)) return;
    clearInterval(timer);
    const seconds = Math.round((Date.now() - started) / 1000);
    const result = scoreMock(questions, answers);
    root.replaceChildren();
    root.append(await resultView(exam, questions, answers, result, seconds));
  }
}

async function resultView(exam, questions, answers, result, seconds) {
  const linked = new Map((await loadQuestions()).filter((q) => q.kind === 'exam').map((q) => [q.id, q.cardIds]));
  const cards = new Map([...(await loadDeck('conjunctions')), ...(await loadDeck('grammar'))].map((c) => [c.id, c]));
  const wordIx = await loadWordIndex();
  const missed = [];
  for (const q of questions) {
    const a = answers[q.id];
    if (a == null) { missed.push({ q, a }); linkWord(q); continue; }
    const ok = a === q.answer;
    recordQuestion(q.id, ok, q.section);
    if (!ok) {
      missed.push({ q, a });
      linkWord(q);
      for (const id of linked.get(q.id) || []) {
        const deck = id.startsWith('g-') ? 'grammar' : 'conjunctions';
        const s = getCard(deck, id);
        if (s) setCard(deck, id, { ...newCardState(), ...s, due: Date.now() });
      }
    }
  }
  function linkWord(q) {
    if (!['vocab', 'cloze', 'completion'].includes(q.section)) return;
    const w = findWord(wordIx, q.options[q.answer]);
    if (w) forceDue('words', w.word); // yanlış / boş bırakılan kelime kart tekrarına eklenir
  }
  addMock({ examId: exam.id, title: exam.title, correct: result.correct, wrong: result.wrong, blank: result.blank, total: result.total, scaled: result.scaled, seconds, bySection: result.bySection });

  const target = get().settings.targetScore ?? 70;
  const gap = Math.round((target - result.scaled) * 100) / 100;
  const sections = Object.entries(result.bySection).map(([id, s]) => ({ id, ...s, label: sectionById(id)?.label || id })).sort((a, b) => a.correct / a.total - b.correct / b.total);
  return h('div', { class: 'quiz' },
    h('div', { class: 'empty' },
      h('h2', null, `≈ ${fmt(result.scaled)} puan`),
      h('p', null, `${result.correct} doğru · ${result.wrong} yanlış · ${result.blank} boş (${result.total} soru, ${clock(seconds)})`),
      h('p', { class: gap <= 0 ? 'verdict ok' : 'muted' }, gap <= 0 ? `Hedefin (${target}) üzerindesin 🎉` : `Hedefe ${fmt(gap)} puan kaldı`),
      result.total < 80 ? h('p', { class: 'muted small' }, `Çözülebilir ${result.total} soru üzerinden 100 puana ölçeklendi.`) : null),
    h('section', { class: 'card' },
      h('h3', null, 'Bölüm analizi'),
      h('p', { class: 'muted small' }, 'En zayıf bölüm üstte. Önce oradan çalış.'),
      sections.map((s) => h('div', { class: 'bar-row' },
        h('div', { class: 'bar-label' }, h('span', null, s.label), h('span', { class: 'muted small' }, `${s.correct}/${s.total}${s.blank ? ` (${s.blank} boş)` : ''}`)),
        h('div', { class: 'progress' }, h('span', { style: `width:${(s.correct / s.total) * 100}%` }))))),
    missed.length ? h('section', { class: 'card' },
      h('h3', null, `Yanlış ve boşlar (${missed.length}) · tekrar moduna eklendi`),
      missed.map(({ q, a }) => h('div', { class: 'miss' },
        h('p', { class: 'muted small' }, `Soru ${q.number} · ${sectionById(q.section)?.label || ''}`),
        h('p', { class: 'stem small' }, stemNodes(q.stem)),
        h('p', { class: 'small' }, a == null ? 'Boş bıraktın. ' : `Cevabın: ${q.options[a]}. `, h('b', null, `Doğru: ${q.options[q.answer]}`)),
        q.explanation ? h('p', { class: 'muted small' }, q.explanation) : null,
        (linked.get(q.id) || []).map((id) => cards.get(id)).filter(Boolean).map((c) => h('div', { class: 'related' }, h('span', { class: 'muted small' }, 'İlgili kart'), h('strong', null, c.tr), chips(c.group.slice(0, 4))))))) : null,
    h('a', { class: 'btn btn-primary', href: '#/stats' }, 'İlerleme ve hedef'),
    h('a', { class: 'btn btn-ghost', href: '#/mock' }, 'Başka deneme'));
}

function stemNodes(stem) {
  return stem.split(/(_{2,})/).map((p) => (/^_{2,}$/.test(p) ? h('span', { class: 'blank' }, ' ') : p));
}

// Bölümlere orantılı rastgele alt küme (mini deneme); orijinal sıra korunur.
function sampleSubset(questions, n) {
  if (questions.length <= n) return questions;
  const ratio = n / questions.length;
  const picked = new Set();
  const bySection = new Map();
  for (const q of questions) (bySection.get(q.section) || bySection.set(q.section, []).get(q.section)).push(q);
  for (const list of bySection.values()) {
    const shuffled = list.map((q) => [Math.random(), q]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    shuffled.slice(0, Math.max(1, Math.round(list.length * ratio))).forEach((q) => picked.add(q.id));
  }
  return questions.filter((q) => picked.has(q.id));
}
