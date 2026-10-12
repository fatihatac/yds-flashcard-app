// Çıkmış sınavlardaki çeviri (İng→Tr / Tr→İng) sorularını öğretici notlarla birleştirir:
//   python3 scripts/translation_notes.py && node scripts/build-exam-translation.mjs
// Çıktı: data/exam-translation-questions.json
import fs from 'node:fs';
import { normalizeQuestion } from '../js/exams.js';
import { isTurkish } from '../js/qtype.js';

const dir = new URL('../data/', import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
const notes = JSON.parse(fs.readFileSync(new URL('translation-notes.json', import.meta.url), 'utf8'));
const exams = read('exams.json');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, '');
const sigOf = (q) => norm(q.stem + q.options.join(''));

const takenIds = new Set(read('exam-conjunction-questions.json').map((q) => q.id)); // bağlaç sorusu olarak zaten var
const seen = new Set();
const out = [];
// Aynı soru farklı dosyalarda (kesme işareti vb. farklarla) geçebilir: notu imza üzerinden de bul.
const noteBySig = new Map();
for (const e of exams) {
  const raw = read(e.file);
  raw.questions.forEach((r, i) => {
    const q = normalizeQuestion(r, e.id, i, raw.questions.length);
    if (notes[q.id]) noteBySig.set(sigOf(q), notes[q.id]);
  });
}
let skipped = 0;
let unnoted = 0;
for (const e of exams) {
  const raw = read(e.file);
  raw.questions.forEach((r, i) => {
    const q = normalizeQuestion(r, e.id, i, raw.questions.length);
    if (q.section !== 'translation' || q.answer < 0 || q.options.length < 2 || takenIds.has(q.id)) return;
    const stemTr = isTurkish(q.stem);
    if (stemTr === isTurkish(q.options[q.answer])) { skipped += 1; return; } // bozuk kayıt: soru ve şıklar aynı dilde
    const sig = sigOf(q);
    if (seen.has(sig)) return;
    seen.add(sig);
    const note = notes[q.id] || noteBySig.get(sig);
    if (!note) unnoted += 1;
    const letters = 'ABCDE';
    const why = Object.entries(note?.why || {}).map(([l, t]) => ({ option: letters.indexOf(l), text: t })).filter((w) => w.option >= 0 && w.option !== q.answer);
    out.push({ id: q.id, kind: 'exam', area: 'translation', section: 'translation', cardIds: ['g-translation-strategy'],
      direction: stemTr ? 'tr-en' : 'en-tr', stem: q.stem, options: q.options, answer: q.answer, explanation: q.explanation,
      source: `${e.title.replace(/YABANCI DİL BİLGİSİ SEVİYE TESPİT SINAVI/i, 'YDS').replace(/\s+/g, ' ')} · Soru ${q.number}`,
      theme: note?.theme, key: note?.key, why });
  });
}
fs.writeFileSync(new URL('exam-translation-questions.json', dir), JSON.stringify(out, null, 1));
console.log(`Toplam: ${out.length} çeviri sorusu (notlu: ${out.length - unnoted}, notsuz: ${unnoted}, bozuk atlanan: ${skipped})`);
