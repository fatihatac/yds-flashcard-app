import test from 'node:test';
import assert from 'node:assert/strict';
import { schedule, RATING, status, isDue, addDays } from '../js/srs.js';

const NOW = new Date(2026, 0, 10, 15, 0).getTime();

test('yeni kart: İyi → 2 gün sonra', () => {
  const c = schedule(undefined, RATING.GOOD, NOW);
  assert.equal(c.interval, 2);
  assert.equal(c.due, addDays(NOW, 2));
  assert.equal(status(c), 'learning');
});

test('Tekrar: aralık sıfırlanır, 10 dk sonra tekrar gelir, lapse artar', () => {
  const c = schedule(schedule(undefined, RATING.GOOD, NOW), RATING.AGAIN, NOW);
  assert.equal(c.interval, 0);
  assert.equal(c.lapses, 1);
  assert.equal(c.due, NOW + 10 * 60 * 1000);
  assert.ok(isDue(c, NOW + 11 * 60 * 1000));
});

test('aralıklar giderek büyür ve 365 günü geçmez', () => {
  let c = schedule(undefined, RATING.EASY, NOW);
  let prev = c.interval;
  for (let i = 0; i < 30; i++) {
    c = schedule(c, RATING.EASY, NOW);
    assert.ok(c.interval >= prev);
    assert.ok(c.interval <= 365);
    prev = c.interval;
  }
  assert.equal(status(c), 'mature');
});

test('ef 1.3 altına düşmez', () => {
  let c;
  for (let i = 0; i < 20; i++) c = schedule(c, RATING.AGAIN, NOW);
  assert.ok(c.ef >= 1.3);
});
