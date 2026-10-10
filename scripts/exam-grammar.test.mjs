import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, isGrammarShaped } from './exam-grammar-rules.mjs';

const q = (stem, options, answer) => ({ stem, options, answer });

test('edat şıkları → bağımlı edatlar', () => {
  assert.equal(classify(q('The demand ____ oil keeps rising.', ['for', 'into', 'about', 'from', 'to'], 0))?.[0], 'g-prepositions');
});

test('to V1 / V-ing şıkları → gerund / infinitive', () => {
  assert.equal(classify(q('Walson decided ____ his service to new heights.', ['to take', 'to be taking', 'having taken', 'to have taken', 'taking'], 0))?.[0], 'g-gerund-infinitive');
});

test('Present Perfect: have + V3', () => {
  assert.equal(classify(q('For 60 years, wetsuits ____ people to swim longer.', ['were allowing', 'have allowed', 'had allowed', 'used to allow', 'will be allowing'], 1))?.[0], 'g-past-vs-perfect');
});

test('özne-fiil uyumu şıkları (do / does / did ...)', () => {
  assert.equal(classify(q('Rarely ____ students realise how much sleep matters.', ['do', 'does', 'did', 'have', 'are'], 0))?.[0], 'g-agreement');
});

test('uzun şıklı, çeviri ve paragraf soruları gramer sorusu sayılmaz', () => {
  assert.equal(isGrammarShaped(q('Bu cümlenin ____ çevirisi', ['a b c d e f', 'x'], 0)), false);
  assert.equal(isGrammarShaped(q('(I) ... (V) ...', ['I', 'II', 'III', 'IV', 'V'], 0)), false);
  assert.equal(isGrammarShaped(q('The writer ____ ahead.', ['is looking at the long road', 'x', 'y', 'z', 'w'], 0)), false);
});

test('kapalı kümeler dışındaki sözcük (kelime) soruları etiketsiz kalır', () => {
  assert.equal(classify(q('Parents who are responsive ____ their children.', ['delay', 'acknowledge', 'relieve', 'enhance', 'surpass'], 3)), null);
});
