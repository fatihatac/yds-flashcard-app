// YDS sınav dosyalarından (data/20xx_YDS_n.json):
//  1) data/exams.json  -> sınav listesi (başlık, dosya, soru sayısı)
//  2) data/exam-conjunction-questions.json -> doğru cevabı bir bağlaç kartına denk gelen sorular (kartlara bağlı)
// Kullanım: node scripts/build-exam-data.mjs
import fs from 'node:fs';
import { examIdFromFile, normalizeQuestion, isSolvable } from '../js/exams.js';

const dir = new URL('../data/', import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
const cards = read('conjunctions.json');
const cardIds = new Set(cards.map((c) => c.id));

// Doğru şık metni -> aday kart(lar). Birden çok adayda ipucu (Türkçe açıklama) ile seçilir.
const MAP = {
  'although': 'concession-clause', 'even though': 'concession-clause', 'though': 'concession-clause',
  'despite': 'concession-noun', 'in spite of': 'concession-noun',
  'whereas': 'contrast-clause', 'while': ['contrast-clause:oysa|rağmen|zıt|buna karşın|karşın', 'time-while'],
  'however': 'adv-contrast', 'nevertheless': 'adv-contrast', 'nonetheless': 'adv-contrast', 'even so': 'adv-contrast',
  'on the other hand': 'contrast-adv', 'in contrast': 'contrast-adv', 'by contrast': 'contrast-adv', 'conversely': 'contrast-adv',
  'unlike': 'unlike', 'in contrast to': 'unlike', 'as opposed to': 'unlike', 'contrary to': 'unlike',
  'because': 'cause-clause', 'since': ['time-since:beri|-den beri', 'cause-clause'],
  'because of': 'cause-noun', 'due to': 'cause-noun', 'owing to': 'cause-noun', 'on account of': 'cause-noun', 'thanks to': 'cause-noun',
  'now that': 'cause-given', 'seeing that': 'cause-given', 'given that': 'cause-given', 'considering that': 'cause-given',
  'therefore': 'result-adv', 'thus': 'result-adv', 'hence': 'result-adv', 'consequently': 'result-adv', 'accordingly': 'result-adv', 'as a result': 'result-adv',
  'as a result of': 'as-a-result-of', 'as a consequence of': 'as-a-result-of',
  'so': 'result-so', 'so that': 'purpose-clause', 'in order that': 'purpose-clause',
  'in order to': 'purpose-inf', 'so as to': 'purpose-inf', 'lest': 'lest', 'for fear that': 'lest',
  'in case': 'in-case', 'in case of': 'in-case', 'just in case': 'in-case',
  'provided that': 'condition-strict', 'providing that': 'condition-strict', 'as long as': 'condition-strict', 'so long as': 'condition-strict',
  'on condition that': 'condition-strict', 'only if': 'condition-strict',
  'unless': 'unless', 'even if': 'even-if', 'if': 'if-basic',
  'had': 'inverted-conditionals', 'were': 'inverted-conditionals', 'should': 'inverted-conditionals',
  'but for': 'but-for', 'without': 'but-for', 'otherwise': 'otherwise', 'or else': 'otherwise',
  'moreover': 'addition-adv', 'furthermore': 'addition-adv', 'in addition': 'addition-adv', 'besides': 'addition-adv', 'additionally': 'addition-adv', 'what is more': 'addition-adv',
  'in addition to': 'addition-noun', 'apart from': 'addition-noun', 'as well as': 'addition-noun', 'aside from': 'addition-noun',
  'along with': 'along-with', 'together with': 'along-with',
  'not only': 'not-only', 'both': 'both-and', 'either': 'either-neither', 'neither': 'either-neither', 'nor': 'either-neither',
  'when': 'time-while', 'as soon as': 'time-as-soon', 'the moment': 'time-as-soon', 'once': 'time-as-soon',
  'until': 'time-until', 'till': 'time-until', 'by the time': 'time-by-the-time', 'whenever': 'time-whenever', 'every time': 'time-whenever',
  'ever since': 'time-since', 'hardly': 'time-hardly', 'scarcely': 'time-hardly', 'no sooner': 'time-hardly',
  'before': 'time-before', 'prior to': 'time-before', 'after': 'time-after', 'following': 'time-after', 'subsequent to': 'time-after',
  'upon': 'time-upon', 'during': 'time-during', 'throughout': 'time-during', 'in the course of': 'time-during',
  'instead of': 'instead-of', 'rather than': 'instead-of', 'in place of': 'instead-of', 'instead': 'instead-adv',
  'except': 'except', 'except for': 'except', 'other than': 'except',
  'whatever': 'whatever-however', 'whoever': 'whatever-however', 'no matter': 'whatever-however',
  'regardless of': 'regardless-of', 'irrespective of': 'regardless-of', 'whether': 'whether',
  'as if': 'as-if', 'as though': 'as-if',
  'according to': 'according-to', 'in accordance with': 'according-to', 'in line with': 'according-to', 'depending on': 'according-to',
  'with regard to': 'regarding', 'regarding': 'regarding', 'concerning': 'regarding', 'as for': 'regarding',
  'similarly': 'similarly', 'likewise': 'similarly', 'in the same way': 'similarly',
  'for example': 'for-example', 'for instance': 'for-example', 'such as': 'for-example',
  'in other words': 'in-other-words', 'that is': 'in-other-words', 'namely': 'in-other-words',
  'in conclusion': 'in-conclusion', 'to sum up': 'in-conclusion', 'in short': 'in-conclusion', 'all in all': 'in-conclusion',
  'in fact': 'in-fact', 'actually': 'in-fact', 'indeed': 'in-fact', 'as a matter of fact': 'in-fact',
  'meanwhile': 'meanwhile', 'in the meantime': 'meanwhile', 'at the same time': 'meanwhile',
  'afterwards': 'afterwards', 'subsequently': 'afterwards', 'thereafter': 'afterwards',
  'by means of': 'by-means-of', 'just as': 'just-as', 'in terms of': 'in-terms-of', 'but': 'but', 'yet': 'but',
  'regardless': 'regardless-of',
};
for (const v of Object.values(MAP)) for (const c of [v].flat()) if (!cardIds.has(c.split(':')[0])) throw new Error(`bilinmeyen kart: ${c}`);

const norm = (s) => s.toLowerCase().replace(/[.,;]+$/g, '').replace(/\s+/g, ' ').trim();
const isConnector = (t) => t in MAP;
// Şık metninin başındaki en uzun bağlaç ifadesi (şıkta yalnızca bağlaç varsa kendisi, yan cümle varsa ilk ifade).
const PHRASES = Object.keys(MAP).sort((a, b) => b.length - a.length);
const leadConnector = (opt) => {
  if (isConnector(opt)) return opt;
  if (opt.split(' ').length < 4) return null; // kısa şıklarda yalnızca birebir eşleşme geçerli
  return PHRASES.find((p) => opt.startsWith(`${p} `)) || null;
};

function pickCard(key, q) {
  const cand = [MAP[key]].flat();
  if (cand.length === 1) return cand[0].split(':')[0];
  for (const c of cand) {
    const [id, hint] = c.split(':');
    if (hint && new RegExp(hint, 'i').test(q.explanation || '')) return id;
  }
  return cand.find((c) => !c.includes(':')) || null;
}

const files = fs.readdirSync(dir).filter((f) => /^\d{4}_YDS_\d+\.json$/.test(f)).sort();
const exams = [];
const found = [];
const seen = new Set();
for (const f of files) {
  const raw = read(f);
  const id = examIdFromFile(f);
  const qs = raw.questions.map((q, i) => normalizeQuestion(q, id, i, raw.questions.length));
  const sections = {};
  for (const q of qs) if (isSolvable(q)) sections[q.section] = (sections[q.section] || 0) + 1;
  exams.push({ id, file: f, title: raw.title.replace(/\s+/g, ' ').trim(), count: qs.length, solvable: qs.filter((q) => isSolvable(q)).length, sections });
  for (const q of qs) {
    if (!isSolvable(q)) continue;
    const sig = `${q.stem}|${q.options.join('|')}`;
    if (seen.has(sig)) continue; // aynı soru iki sınav dosyasında geçiyorsa bir kez al
    seen.add(sig);
    const opts = q.options.map(norm);
    // Şıklar ya tek bir bağlaç (Although) ya da bağlaçla başlayan yan cümle (although the committee ...) olabilir.
    const heads = opts.map(leadConnector);
    if (heads.filter(Boolean).length < 4) continue; // çoğu şık bağlaç değilse bağlaç sorusu sayma
    const key = heads[q.answer];
    if (!key) continue;
    const card = pickCard(key, q);
    if (!card) continue;
    found.push({ ...q, cardIds: [card], kind: 'exam', source: `${exams.at(-1).title} · Soru ${q.number}` });
  }
}
fs.writeFileSync(new URL('exams.json', dir), JSON.stringify(exams, null, 1));
fs.writeFileSync(new URL('exam-conjunction-questions.json', dir), JSON.stringify(found, null, 1));
const per = {};
for (const q of found) per[q.cardIds[0]] = (per[q.cardIds[0]] || 0) + 1;
console.log(`${exams.length} sınav, ${exams.reduce((a, e) => a + e.count, 0)} soru; bağlaç sorusu: ${found.length}; kart başına:`, per);
