// localStorage üzerinde ilerleme, ayarlar ve günlük kayıtlar.
const KEY = 'yds-flashcards:v1';

function defaults() {
  return {
    version: 1,
    cards: {}, // "deckId:cardId" -> SRS durumu
    questions: {}, // soruId -> { seen, correct, lastCorrect, last }
    log: {}, // YYYY-MM-DD -> { reviews, correct, new }
    customQuestions: [],
    settings: {
      theme: 'auto',
      maxReviews: 100,
      newPerDay: { conjunctions: 10, words: 10 },
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

export function recordQuestion(id, correct) {
  const q = (state.questions[id] ||= { seen: 0, correct: 0, lastCorrect: null, last: 0 });
  q.seen += 1;
  if (correct) q.correct += 1;
  q.lastCorrect = correct;
  q.last = Date.now();
  save();
}

export function setSetting(path, value) {
  if (path === 'newPerDay.conjunctions' || path === 'newPerDay.words') state.settings.newPerDay[path.split('.')[1]] = value;
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
