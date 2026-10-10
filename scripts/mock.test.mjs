import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreMock, scaledScore, neededCorrect, sectionReport, rawScore } from '../js/mock.js';
import { sectionByNumber, questionSection, contentSection, SECTIONS } from '../js/qtype.js';

test('bölüm ağırlıkları 80 soruyu verir ve numaralar bölümlere eşlenir', () => {
  assert.equal(SECTIONS.reduce((a, s) => a + s.weight, 0), 80);
  assert.equal(sectionByNumber(1), 'vocab');
  assert.equal(sectionByNumber(12), 'grammar');
  assert.equal(sectionByNumber(20), 'cloze');
  assert.equal(sectionByNumber(40), 'translation');
  assert.equal(sectionByNumber(50), 'reading');
  assert.equal(sectionByNumber(65), 'dialogue');
  assert.equal(sectionByNumber(70), 'paragraph');
  assert.equal(sectionByNumber(80), 'irrelevant');
});

test('80 soruluk sınavda numara, diğerlerinde içerik belirler', () => {
  const q = { number: 30, stem: 'Some text ____.', options: ['a b c d e f g', 'x', 'y', 'z', 'w'] };
  assert.equal(questionSection(q, 80), 'completion');
  assert.equal(questionSection({ number: 3, stem: 'The dog ____ home.', options: ['I', 'II', 'III', 'IV', 'V'] }, 8), 'irrelevant');
  assert.equal(contentSection({ stem: 'Bu cümle Türkçe bir çeviri sorusudur ve çok uzundur.', options: ['This is it.', 'That is it.', 'Some other.', 'Another.', 'Last one.'] }), 'translation');
  assert.equal(contentSection({ stem: 'Reporter: Kids love hamburgers. ____', options: ['A b', 'C d', 'E f', 'G h', 'I j'] }), 'dialogue');
});

test('puanlama: doğru, yanlış, boş ve bölüm kırılımı', () => {
  const qs = [
    { id: 'a', answer: 1, section: 'vocab' }, { id: 'b', answer: 0, section: 'vocab' },
    { id: 'c', answer: 2, section: 'grammar' }, { id: 'd', answer: 3, section: 'grammar' },
  ];
  const r = scoreMock(qs, { a: 1, b: 2, c: 2 });
  assert.deepEqual([r.correct, r.wrong, r.blank, r.total], [2, 1, 1, 4]);
  assert.equal(r.scaled, 50);
  assert.deepEqual(r.bySection.vocab, { correct: 1, wrong: 1, blank: 0, total: 2 });
  assert.deepEqual(r.bySection.grammar, { correct: 1, wrong: 0, blank: 1, total: 2 });
});

test('hedef hesapları: 70 puan = 80 soruda 56 doğru; ham puan 1,25 çarpanı', () => {
  assert.equal(neededCorrect(70, 80), 56);
  assert.equal(rawScore(55), 68.75);
  assert.equal(scaledScore(45, 60), 75);
});

test('bölüm raporu: potansiyel = ağırlık × (1 - başarı) × 1,25', () => {
  const rep = sectionReport({ vocab: { seen: 10, correct: 5 }, reading: { seen: 0, correct: 0 } });
  const vocab = rep.find((r) => r.id === 'vocab');
  assert.equal(vocab.accuracy, 0.5);
  assert.equal(vocab.potential, 3.8); // 6 × 0,5 × 1,25 = 3,75 → 3,8
  assert.equal(rep.find((r) => r.id === 'reading').potential, null);
});
