import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, buildWordQuestions, findWord, makeQuestion, posKey } from '../js/vocab.js';
import { seededRandom } from '../js/vocab.js';

const W = (word, type, meanings, synonyms = []) => ({ word, type, meanings, synonyms });
const words = [
  W('abolish', 'verb(fiil)', ['yürürlükten kaldırmak', 'feshetmek'], ['eliminate', 'scrap']),
  W('abstain', 'verb(fiil)', ['çekinmek', 'sakınmak'], ['refrain']),
  W('abide', 'verb(fiil)', ['uymak', 'katlanmak'], ['obey']),
  W('adopt', 'verb(fiil)', ['benimsemek'], ['embrace']),
  W('refrain', 'verb(fiil)', ['kaçınmak'], ['abstain']),
  W('postpone', 'verb(fiil)', ['ertelemek'], ['delay']),
  W('give up', 'phrasal verb', ['vazgeçmek']), W('run into', 'phrasal verb', ['rastlamak']),
  W('look for', 'phrasal verb', ['aramak']), W('turn down', 'phrasal verb', ['reddetmek']),
  W('hand over', 'phrasal verb', ['teslim etmek']), W('take on', 'phrasal verb', ['üstlenmek']),
];
const index = buildIndex(words);

test('posKey: sözcük türünü sadeleştirir', () => {
  assert.equal(posKey('adjective(sıfat)/noun(isim)'), 'adjective');
  assert.equal(posKey('phrasal verb'), 'phrasal');
});

test('İngilizce → Türkçe sorusu: 5 farklı şık, doğru şık ilk sırada', () => {
  const q = makeQuestion(words[0], 'en-tr', index, seededRandom(1));
  assert.equal(q.options.length, 5);
  assert.equal(new Set(q.options).size, 5);
  assert.ok(words[0].meanings.includes(q.options[q.answer]));
  assert.equal(q.id, 'v:en-tr:abolish');
});

test('çeldiriciler aynı türden gelir ve eş anlamlıyı içermez', () => {
  const q = makeQuestion(words[1], 'tr-en', index, seededRandom(2)); // abstain: refrain eş anlamlı
  assert.ok(!q.options.includes('refrain'));
  assert.equal(q.options[q.answer], 'abstain');
  assert.ok(q.options.every((o) => !['give up', 'run into'].includes(o))); // phrasal verb çeldirici olmaz
});

test('eş anlamlı sorusu yalnızca eş anlamlısı olan kelimelerde üretilir', () => {
  assert.equal(makeQuestion(words[6], 'syn', index, seededRandom(3)), null);
  const q = makeQuestion(words[0], 'syn', index, seededRandom(3));
  assert.ok(['eliminate', 'scrap'].includes(q.options[q.answer]));
});

test('phrasal verb havuzu kendi içinde çeldirici seçer', () => {
  const pv = words.filter((w) => w.type === 'phrasal verb');
  const qs = buildWordQuestions(pv, index, { modes: ['en-tr', 'tr-en'], count: 4, rnd: seededRandom(4) });
  assert.equal(qs.length, 4);
  for (const q of qs) assert.equal(new Set(q.options).size, 5);
});

test('findWord: "to" önekini ve büyük harfi tolere eder', () => {
  assert.equal(findWord(index, 'To Adopt').word, 'adopt');
  assert.equal(findWord(index, 'nonexistent'), null);
});
