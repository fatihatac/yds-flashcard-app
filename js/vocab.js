// Kelime / phrasal verb testi: kelime listesinden çoktan seçmeli sorular üretir (saf fonksiyonlar).
import { mulberry32 } from './ui.js';

export const posKey = (type = '') => (type.startsWith('phrasal') ? 'phrasal' : type.split('/')[0].split('(')[0].trim());
const norm = (s) => s.toLowerCase().trim();

export function buildIndex(words) {
  const byPos = new Map();
  const byWord = new Map();
  for (const w of words) {
    const k = posKey(w.type);
    if (!byPos.has(k)) byPos.set(k, []);
    byPos.get(k).push(w);
    byWord.set(norm(w.word), w);
  }
  return { byPos, byWord };
}

// Sınav şıkkındaki metni kelime listesinde bul ("to " öneki ve çekimsiz biçim dahil).
export const findWord = (index, text) => index.byWord.get(norm(text)) || index.byWord.get(norm(text).replace(/^to /, '')) || null;

const meaningsOf = (w) => w.meanings.map(norm);
// Çeldirici, doğru kelimeyle aynı anlamı ya da eş anlamı paylaşıyorsa belirsizlik yaratır.
function conflicts(a, b) {
  if (a.word === b.word) return true;
  const ma = new Set(meaningsOf(a));
  if (meaningsOf(b).some((m) => ma.has(m))) return true;
  const sa = new Set((a.synonyms || []).map(norm));
  const sb = new Set((b.synonyms || []).map(norm));
  if (sa.has(norm(b.word)) || sb.has(norm(a.word))) return true;
  return [...sa].some((x) => sb.has(x));
}

function pickDistractors(word, pool, textOf, rnd, n = 4) {
  const out = [];
  const used = new Set([textOf(word)]);
  for (let tries = 0; tries < 400 && out.length < n; tries++) {
    const c = pool[Math.floor(rnd() * pool.length)];
    const t = textOf(c);
    if (!t || used.has(norm(t)) || conflicts(word, c)) continue;
    used.add(norm(t));
    out.push(c);
  }
  return out;
}

export const MODES = ['en-tr', 'tr-en', 'syn'];

// Tek bir kelime için soru üretir; uygun değilse null.
export function makeQuestion(word, mode, index, rnd = Math.random) {
  const pool = index.byPos.get(posKey(word.type)) || [];
  if (pool.length < 5) return null;
  const meaningText = (w) => w.meanings[0];
  const explanation = `${word.word}: ${word.meanings.join(', ')}${word.synonyms?.length ? `. Eş anlamlılar: ${word.synonyms.join(', ')}` : ''}.`;
  let stem; let correct; let wrong; let kind;
  if (mode === 'en-tr') {
    stem = `“${word.word}” sözcüğünün Türkçe karşılığı hangisidir?`;
    correct = word.meanings[Math.floor(rnd() * Math.min(2, word.meanings.length))];
    wrong = pickDistractors(word, pool, meaningText, rnd).map(meaningText);
    kind = 'en-tr';
  } else if (mode === 'tr-en') {
    stem = `“${word.meanings.join(', ')}” anlamına gelen İngilizce sözcük hangisidir?`;
    correct = word.word;
    wrong = pickDistractors(word, pool, (w) => w.word, rnd).map((w) => w.word);
    kind = 'tr-en';
  } else {
    if (!word.synonyms?.length) return null;
    stem = `Which word is closest in meaning to “${word.word}”?`;
    correct = word.synonyms[Math.floor(rnd() * word.synonyms.length)];
    wrong = pickDistractors(word, pool, (w) => w.word, rnd).map((w) => w.word).filter((t) => !word.synonyms.map(norm).includes(norm(t)));
    kind = 'syn';
  }
  if (wrong.length < 4) return null;
  const options = [correct, ...wrong.slice(0, 4)];
  return { id: `v:${kind}:${word.word}`, kind: 'vocab', area: 'vocab', section: 'vocab', wordIds: [word.word], stem, options, answer: 0, explanation };
}

// words: süzülmüş kelime listesi; modes: kullanılacak soru türleri; count: soru sayısı
export function buildWordQuestions(words, index, { modes = MODES, count = 10, rnd = Math.random } = {}) {
  const shuffled = words.map((w) => [rnd(), w]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const out = [];
  for (const w of shuffled) {
    if (out.length >= count) break;
    const order = modes.map((m) => [rnd(), m]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    for (const m of order) {
      const q = makeQuestion(w, m, index, rnd);
      if (q) { out.push(q); break; }
    }
  }
  return out;
}

export const seededRandom = (seed) => mulberry32(seed);
