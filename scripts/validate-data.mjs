// Veri bütünlüğü kontrolü: node scripts/validate-data.mjs
import fs from 'node:fs';
import { validateCard, validateQuestion } from '../js/validate.js';

const read = (f) => JSON.parse(fs.readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const cards = read('conjunctions.json');
const questions = read('questions.json');
const words = read('words.json');
let errors = 0;
const fail = (m) => { console.error('✗', m); errors += 1; };

const ids = new Set();
for (const c of cards) {
  if (ids.has(c.id)) fail(`yinelenen kart id: ${c.id}`);
  ids.add(c.id);
  for (const e of validateCard(c)) fail(`kart ${c.id}: ${e}`);
}
const qids = new Set();
for (const q of questions) {
  if (qids.has(q.id)) fail(`yinelenen soru id: ${q.id}`);
  qids.add(q.id);
  for (const e of validateQuestion(q, ids)) fail(`soru ${q.id}: ${e}`);
}
const wordSet = new Set();
for (const w of words) {
  if (wordSet.has(w.word)) fail(`yinelenen kelime: ${w.word}`);
  wordSet.add(w.word);
  if (!w.meanings?.length) fail(`anlamı olmayan kelime: ${w.word}`);
}
const withoutQuestion = cards.filter((c) => !questions.some((q) => (q.cardIds || []).includes(c.id)));
if (withoutQuestion.length) console.warn(`! sorusu olmayan kartlar: ${withoutQuestion.map((c) => c.id).join(', ')}`);
console.log(`${cards.length} kart, ${questions.length} soru, ${words.length} kelime kontrol edildi.`);
process.exit(errors ? 1 : 0);
