// localStorage üzerinde ilerleme, ayarlar ve günlük kayıtlar.
const KEY = 'yds-flashcards:v1';

function defaults() {
  return {
    version: 1,
    cards: {}, // "deckId:cardId" -> SRS durumu
    questions: {}, // soruId -> { seen, correct, lastCorrect, last }
    log: {}, // YYYY-MM-DD -> { reviews, correct, new }
    customQuestions: [],
    mocks: [], // deneme sınavı sonuçları
    settings: {
      theme: 'auto',
      cardDirection: 'en-tr',
      targetScore: 70,
      baselineCorrect: null, // son sınavdaki doğru sayısı (80 üzerinden), isteğe bağlı
      maxReviews: 100,
      newPerDay: { conjunctions: 10, grammar: 5, words: 10 },
    },
  };
}

let state = load();

function load() {
  const base = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      return {
        ...base,
        ...raw,
        settings: { ...base.settings, ...raw.settings, newPerDay: { ...base.settings.newPerDay, ...(raw.settings || {}).newPerDay } },
      };
    }
  } catch { /* bozuk veri: varsayılana dön */ }
  return base;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* depolama kapalı olabilir */ }
}

export const get = () => state;
export const cardKey = (deckId, cardId) => `${deckId}:${cardId}`;
export const getCard = (deckId, cardId) => state.cards[cardKey(deckId, cardId)];
export function setCard(deckId, cardId, value) { state.cards[cardKey(deckId, cardId)] = value; save(); }

export function todayKey(ts = Date.now()) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function logReview({ correct, isNew, deckId }) {
  const k = todayKey();
  const day = (state.log[k] ||= { reviews: 0, correct: 0, new: {} });
  day.reviews += 1;
  if (correct) day.correct += 1;
  if (isNew) day.new[deckId] = (day.new[deckId] || 0) + 1;
  save();
}

export const newDoneToday = (deckId) => (state.log[todayKey()]?.new || {})[deckId] || 0;

export function streak() {
  let n = 0;
  const d = new Date();
  if (!state.log[todayKey(d.getTime())]?.reviews) d.setDate(d.getDate() - 1);
  while (state.log[todayKey(d.getTime())]?.reviews) { n += 1; d.setDate(d.getDate() - 1); }
  return n;
}

// Yanlış yapılan sorular aralıklı tekrar sırasına girer (Leitner kutuları: 1 - 3 - 7 - 14 gün).
const REVIEW_DAYS = [1, 3, 7, 14];

function addDays(ts, days) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function recordQuestion(id, correct, section) {
  const now = Date.now();
  const q = (state.questions[id] ||= { seen: 0, correct: 0, lastCorrect: null, last: 0 });
  q.seen += 1;
  if (correct) q.correct += 1;
  q.lastCorrect = correct;
  q.last = now;
  if (section) q.section = section;
  if (!correct) q.review = { box: 0, due: now };
  else if (q.review) {
    const box = q.review.box + 1;
    q.review = box > REVIEW_DAYS.length ? null : { box, due: addDays(now, REVIEW_DAYS[box - 1]) };
  }
  save();
}

export function reviewDueIds(now = Date.now()) {
  return Object.entries(state.questions)
    .filter(([, q]) => q.review && q.review.due <= now)
    .sort((a, b) => a[1].review.due - b[1].review.due)
    .map(([id]) => id);
}

export const reviewPendingCount = () => Object.values(state.questions).filter((q) => q.review).length;

export function setSetting(path, value) {
  if (path.startsWith('newPerDay.')) state.settings.newPerDay[path.split('.')[1]] = value;
  else state.settings[path] = value;
  save();
}

export const exportData = () => JSON.stringify(state, null, 2);

export function importData(text) {
  const raw = JSON.parse(text);
  if (!raw || typeof raw !== 'object' || typeof raw.cards !== 'object') throw new Error('Geçersiz yedek dosyası');
  localStorage.setItem(KEY, JSON.stringify(raw));
  state = load();
}

export function resetAll() { state = defaults(); save(); }

export function addCustomQuestions(list) {
  const known = new Set(state.customQuestions.map((q) => q.id));
  let added = 0;
  for (const q of list) if (!known.has(q.id)) { state.customQuestions.push(q); added += 1; }
  save();
  return added;
}

export function addMock(entry) {
  state.mocks.push({ ...entry, date: Date.now() });
  save();
}

// Soru tiplerine (bölümlere) göre toplam çözülen / doğru sayısı; sections: soruId -> bölüm
export function sectionStats(sectionOf) {
  const out = {};
  for (const [id, q] of Object.entries(state.questions)) {
    const sec = q.section || sectionOf?.(id);
    if (!sec) continue;
    const s = (out[sec] ||= { seen: 0, correct: 0 });
    s.seen += q.seen;
    s.correct += q.correct;
  }
  return out;
}
