// Çıkmış sınav sorularını gramer konularına bağlar: node scripts/build-exam-grammar.mjs [--sample]
// Çıktı: data/exam-grammar-questions.json (bağlaç kartlarına zaten bağlanan sorular hariç).
import fs from 'node:fs';
import { normalizeQuestion, isSolvable } from '../js/exams.js';
import { classify } from './exam-grammar-rules.mjs';

const dir = new URL('../data/', import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
const exams = read('exams.json');
const grammarIds = new Set(read('grammar.json').map((g) => g.id));
const conjIds = new Set(read('exam-conjunction-questions.json').map((q) => q.id));
const sample = process.argv.includes('--sample');

const seen = new Set();
// Veri setinde bazı sorularda hazır grammarTopic etiketi var; kurallar bulamazsa bu etiket kullanılır.
const GIVEN = { 'Prepositions': 'g-prepositions', 'Participles & Reductions': 'g-participles' };
const out = [];
const stats = {};
const byTopic = {};
for (const e of exams) {
  const raw = read(e.file);
  raw.questions.forEach((r, i) => {
    const q = normalizeQuestion(r, e.id, i);
    if (!isSolvable(q) || conjIds.has(q.id)) return;
    const sig = `${q.stem}|${q.options.join('|')}`;
    if (seen.has(sig)) return; // aynı soru iki sınav dosyasında geçiyorsa bir kez al
    seen.add(sig);
    const hit = classify(q) || (GIVEN[q.grammarTopic] ? [GIVEN[q.grammarTopic], `veri setindeki etiket: ${q.grammarTopic}`] : null);
    if (!hit) return;
    const [topic, reason] = hit;
    if (!grammarIds.has(topic)) throw new Error(`bilinmeyen konu: ${topic}`);
    stats[topic] = (stats[topic] || 0) + 1;
    (byTopic[topic] ||= []).push({ q, reason });
    out.push({ id: q.id, cardIds: [topic], kind: 'exam', area: 'grammar', stem: q.stem, options: q.options, answer: q.answer, explanation: q.explanation,
      source: `${e.title} · Soru ${q.number}`, tag: reason });
  });
}
if (sample) {
  for (const [t, list] of Object.entries(byTopic)) {
    console.log(`\n=== ${t} (${list.length}) ===`);
    for (const { q, reason } of list.sort(() => Math.random() - 0.5).slice(0, 6)) console.log(`[${reason}] ${q.stem.slice(0, 100)} | ${q.options.join(' / ')} => ${q.options[q.answer]}`);
  }
} else {
  fs.writeFileSync(new URL('exam-grammar-questions.json', dir), JSON.stringify(out, null, 1));
}
console.log(`\nToplam: ${out.length} soru`, stats);
