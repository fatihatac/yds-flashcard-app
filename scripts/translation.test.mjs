import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isTurkish } from '../js/qtype.js';

const qs = JSON.parse(fs.readFileSync(new URL('../data/exam-translation-questions.json', import.meta.url), 'utf8'));

test('çeviri soruları: yön, dil ve açıklama tutarlı', () => {
  assert.ok(qs.length >= 100);
  for (const q of qs) {
    assert.equal(isTurkish(q.stem), q.direction === 'tr-en', q.id);
    assert.equal(isTurkish(q.options[q.answer]), q.direction === 'en-tr', q.id);
    assert.ok(q.explanation && q.key && q.theme, q.id);
    const wrong = q.why.map((w) => w.option).sort();
    assert.deepEqual(wrong, q.options.map((_, i) => i).filter((i) => i !== q.answer), q.id);
  }
});

test('isTurkish: İngilizce diyalog Türkçe sayılmaz', () => {
  assert.equal(isTurkish('Do you know the way to the station? - Yes, it is on the left.'), false);
  assert.equal(isTurkish('Sonuçlar ümit verici olsa da daha fazla araştırma gerekir.'), true);
});
