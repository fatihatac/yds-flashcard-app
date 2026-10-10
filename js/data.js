// Deste kaydı. Yeni bir deste eklemek için DECKS dizisine bir kayıt ve render.js'e bir çizici eklemek yeterlidir.
import { get } from './store.js';
import { normalizeQuestion, isSolvable } from './exams.js';
import { buildIndex } from './vocab.js';

export const DECKS = [
  { id: 'conjunctions', title: 'Bağlaçlar', icon: '🔗', desc: 'YDS bağlaç grupları: anlam, kullanım, örnek ve tüyo', file: 'data/conjunctions.json', type: 'conjunction', ordered: true },
  { id: 'grammar', title: 'Gramer', icon: '🧠', desc: 'Tense, passive, koşul, modal ve diğer konular: öğretici anlatım ve YDS taktikleri', file: 'data/grammar.json', type: 'grammar', ordered: true },
  { id: 'words', title: 'Kelimeler', icon: '📚', desc: 'YDS kelime listesi (İngilizce → Türkçe)', file: 'data/words.json', type: 'word', ordered: false },
];

const cache = new Map();

async function fetchJson(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`${file} yüklenemedi (${res.status})`);
  return res.json();
}

export const deckById = (id) => DECKS.find((d) => d.id === id);

export function loadDeck(id) {
  if (!cache.has(id)) {
    const deck = deckById(id);
    cache.set(id, fetchJson(deck.file).then((rows) => {
      if (deck.type === 'word') return rows.map((r) => ({ ...r, id: r.word }));
      return rows;
    }));
  }
  return cache.get(id);
}

const QUESTION_FILES = [
  ['data/questions.json', 'basic'],
  ['data/questions-trap.json', 'trap'],
  ['data/exam-conjunction-questions.json', 'exam'],
  ['data/grammar-questions.json', 'grammar'],
  ['data/exam-grammar-questions.json', 'exam'],
  ['data/exam-vocab-questions.json', 'exam'],
];

// Bağlaç kartlarına bağlı tüm sorular: temel + tuzak + çıkmış sorulardan seçilenler + kullanıcının eklediği sorular.
export async function loadQuestions() {
  if (!cache.has('questions')) {
    cache.set('questions', Promise.all(QUESTION_FILES.map(async ([file, kind]) => (await fetchJson(file)).map((q) => ({ kind, ...q })))).then((l) => l.flat()));
  }
  const builtIn = await cache.get('questions');
  return [...builtIn, ...get().customQuestions.map((q) => ({ kind: 'custom', ...q }))];
}

export function loadExamList() {
  if (!cache.has('exams')) cache.set('exams', fetchJson('data/exams.json'));
  return cache.get('exams');
}

// Bir sınavın çözülebilir (okuma parçası gerektirmeyen) soruları, orijinal sırasıyla.
export async function loadExamQuestions(examId) {
  const exam = (await loadExamList()).find((e) => e.id === examId);
  if (!exam) return [];
  const raw = await fetchJson(`data/${exam.file}`);
  return raw.questions.map((q, i) => normalizeQuestion(q, exam.id, i, raw.questions.length)).filter(isSolvable).map((q) => ({ ...q, source: `${exam.title} · Soru ${q.number}` }));
}

// Kayıtlı soru kimliklerini (bağlaç soruları veya "sinav:numara") soru nesnelerine çevirir.
export async function resolveQuestions(ids) {
  const all = new Map((await loadQuestions()).map((q) => [q.id, q]));
  const out = [];
  const examCache = new Map();
  for (const id of ids) {
    if (all.has(id)) { out.push(all.get(id)); continue; }
    // Üretilen kelime soruları: yanlış yapılınca kaydedilen anlık görüntüden geri yüklenir
    const snap = get().questions[id]?.snap;
    if (snap) { out.push({ id, ...snap }); continue; }
    const examId = id.split(':')[0];
    if (!examCache.has(examId)) examCache.set(examId, loadExamQuestions(examId).then((l) => new Map(l.map((q) => [q.id, q]))));
    const q = (await examCache.get(examId)).get(id);
    if (q) out.push(q);
  }
  return out;
}

// Kelime destesi ve arama dizini (kelime testi ve sınav şıklarını kelimeye bağlamak için)
export async function loadWordIndex() {
  if (!cache.has('wordIndex')) cache.set('wordIndex', loadDeck('words').then(buildIndex));
  return cache.get('wordIndex');
}
