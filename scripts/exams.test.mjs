import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuestion, isSolvable } from '../js/exams.js';

test('eski biçim: numaralı soru, harfli cevap', () => {
  const q = normalizeQuestion({ questionText: '12. He left ---- it was late.', correctAnswer: 'C', options: ['A) so', 'B) but', 'C) because', 'D) or', 'E) if'] }, 'x');
  assert.equal(q.id, 'x:12');
  assert.equal(q.stem, 'He left ____ it was late.');
  assert.equal(q.options[2], 'because');
  assert.equal(q.answer, 2);
});

test('yeni biçim: numarasız soru, metin olarak cevap', () => {
  const q = normalizeQuestion({ questionText: '---- even kings have a daily life, ...', correctAnswer: 'While', options: ['Whether', 'Seeing that', 'While', 'Unless', 'Until'] }, 'y', 4);
  assert.equal(q.id, 'y:5');
  assert.equal(q.answer, 2);
});

test('okuma parçası gerektiren sorular çözülemez sayılır', () => {
  const q = normalizeQuestion({ questionText: '46. It can be inferred from the passage that the author ----.', correctAnswer: 'B', options: ['A) a', 'B) b', 'C) c', 'D) d', 'E) e'] }, 'x');
  assert.equal(isSolvable(q), false);
});
