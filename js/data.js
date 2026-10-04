// Deste kaydı. Yeni bir deste eklemek için DECKS dizisine bir kayıt ve render.js'e bir çizici eklemek yeterlidir.
import { get } from './store.js';

export const DECKS = [
  { id: 'conjunctions', title: 'Bağlaçlar', icon: '🔗', desc: 'YDS bağlaç grupları: anlam, kullanım, örnek ve tüyo', file: 'data/conjunctions.json', type: 'conjunction', ordered: true },
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

export async function loadQuestions() {
  if (!cache.has('questions')) cache.set('questions', fetchJson('data/questions.json'));
  const builtIn = await cache.get('questions');
  return [...builtIn, ...get().customQuestions];
}
