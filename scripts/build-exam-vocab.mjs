// Çıkmış sınavlardaki kelime / phrasal verb sorularını ayıklar: node scripts/build-exam-vocab.mjs [--sample]
// Çıktı: data/exam-vocab-questions.json (bağlaç ve gramer sorularına bağlananlar hariç).
import fs from 'node:fs';
import { normalizeQuestion, isSolvable } from '../js/exams.js';
import { isGrammarShaped, classify, isFunctionish } from './exam-grammar-rules.mjs';

const dir = new URL('../data/', import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
const exams = read('exams.json');
const sigOf = (q) => `${q.stem}|${q.options.join('|')}`;
const takenQs = [...read('exam-conjunction-questions.json'), ...read('exam-grammar-questions.json')];
const taken = new Set(takenQs.map((q) => q.id));
const takenSig = new Set(takenQs.map(sigOf)); // aynı soru başka sınav dosyasında geçse de bağlaç / gramer olarak sayılır
const PARTICLE = /\b(up|out|on|off|in|over|away|down|back|into|with|for|of|to|from|about|through|across|after|along|around|against|by|at|under|apart)\b/;
const sample = process.argv.includes('--sample');

const seen = new Set();
const out = [];
for (const e of exams) {
  const raw = read(e.file);
  raw.questions.forEach((r, i) => {
    const q = normalizeQuestion(r, e.id, i, raw.questions.length);
    if (!isSolvable(q) || taken.has(q.id) || takenSig.has(sigOf(q)) || !['vocab', 'cloze', 'completion', 'grammar'].includes(q.section)) return;
    if (!isGrammarShaped(q) || classify(q) || isFunctionish(q.options)) return; // gramer / bağlaç şıkları değil, kısa şıklı boşluk sorusu
    const opts = q.options.map((o) => o.toLowerCase());
    if (opts.some((o) => /[^a-z' -]/.test(o))) return; // sayı, noktalama vb. içeren şıklar
    const sig = `${q.stem}|${q.options.join('|')}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    const multi = opts.filter((o) => o.split(' ').length >= 2).length;
    const phrasal = multi >= 4 && opts.filter((o) => PARTICLE.test(o)).length >= 4;
    out.push({ id: q.id, kind: 'exam', area: 'vocab', section: 'vocab', stem: q.stem, options: q.options, answer: q.answer, explanation: q.explanation,
      source: `${e.title} · Soru ${q.number}`, phrasal });
  });
}
if (sample) {
  for (const x of out.sort(() => Math.random() - 0.5).slice(0, 25)) console.log(`${x.phrasal ? '[PV] ' : ''}${x.stem.slice(0, 70)} | ${x.options.join(' / ')} => ${x.options[x.answer]}`);
} else {
  fs.writeFileSync(new URL('exam-vocab-questions.json', dir), JSON.stringify(out, null, 1));
}
console.log(`Toplam: ${out.length} soru (phrasal verb: ${out.filter((x) => x.phrasal).length})`);
