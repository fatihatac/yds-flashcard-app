import test from 'node:test';
import assert from 'node:assert/strict';
import { daysLeft, dayTasks, schedule, progress, scaleFor, examDayTips } from '../js/plan.js';

const NOW = new Date(2026, 9, 10, 15, 30).getTime(); // 10 Ekim 2026 Cumartesi

test('kalan gün: 10 Ekim → 17 Ekim = 7', () => {
  assert.equal(daysLeft('2026-10-17', NOW), 7);
  assert.equal(daysLeft('2026-10-10', NOW), 0);
  assert.equal(daysLeft('2026-10-09', NOW), -1);
  assert.equal(daysLeft(null, NOW), null);
});

test('plan: bugünden sınava her gün için görev üretir, ilk gün deneme içerir', () => {
  const plan = schedule('2026-10-17', NOW, 90);
  assert.equal(plan.length, 8); // 7,6,5,4,3,2,1,0
  assert.equal(plan[0].daysLeft, 7);
  assert.ok(plan[0].tasks.some((t) => t.id === 'mock'));
  assert.equal(plan.at(-1).daysLeft, 0);
  assert.equal(new Date(plan[1].date).getDate(), 11);
});

test('sınava 1-2 gün kala yeni kart yok', () => {
  for (const d of [1, 2, 0]) assert.ok(dayTasks(d, 90).every((t) => t.m !== 'new'), `d=${d}`);
});

test('günlük süre hedefleri ölçekler; 60 dk ve altında mini deneme önerilir', () => {
  assert.equal(scaleFor(90), 1);
  const a = dayTasks(6, 120).find((t) => t.id === 'vocab').target;
  const b = dayTasks(6, 45).find((t) => t.id === 'vocab').target;
  assert.ok(a > b);
  assert.match(dayTasks(7, 60).find((t) => t.id === 'mock').label, /Mini/);
  assert.match(dayTasks(7, 120).find((t) => t.id === 'mock').label, /Tam/);
});

test('ilerleme ölçümü', () => {
  const today = { reviews: 12, newByDeck: { grammar: 5 }, q: 8, sec: { vocab: 40 }, mocks: 0, queueDue: 0 };
  assert.deepEqual(progress({ m: 'reviews', target: 30 }, today), { value: 12, done: false });
  assert.equal(progress({ m: 'new', deck: 'grammar', target: 5 }, today).done, true);
  assert.equal(progress({ m: 'sec', sec: 'vocab', target: 40 }, today).done, true);
  assert.equal(progress({ m: 'queue0', target: 1 }, today).done, true);
  assert.equal(progress({ m: 'queue0', target: 1 }, { ...today, queueDue: 3 }).done, false);
  assert.equal(progress({ m: 'queue0', target: 1 }, { ...today, q: 0, mocks: 0 }).done, false); // hiç soru çözülmedi
  assert.equal(progress({ m: 'mocks', target: 1 }, today).done, false);
  assert.ok(examDayTips().length >= 4);
});
