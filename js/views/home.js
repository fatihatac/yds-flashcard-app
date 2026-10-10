import { h } from '../ui.js';
import { DECKS, loadDeck, loadQuestions } from '../data.js';
import { get, getCard, newDoneToday, streak, todayKey, reviewDueIds } from '../store.js';
import { isDue, status } from '../srs.js';
import { planSummary, taskRow } from './plan.js';
import { progress } from '../plan.js';

export async function counts(deckId) {
  const cards = await loadDeck(deckId);
  const now = Date.now();
  let due = 0, learning = 0, mature = 0, fresh = 0;
  for (const c of cards) {
    const s = getCard(deckId, c.id);
    const st = status(s);
    if (st === 'new') fresh += 1;
    else { if (st === 'mature') mature += 1; else learning += 1; if (isDue(s, now)) due += 1; }
  }
  const limit = get().settings.newPerDay[deckId] ?? 10;
  const newAvail = Math.min(fresh, Math.max(0, limit - newDoneToday(deckId)));
  return { total: cards.length, due: Math.min(due, get().settings.maxReviews), newAvail, learning, mature, fresh };
}

export async function render(root) {
  const log = get().log[todayKey()] || { reviews: 0, correct: 0 };
  const qStats = Object.values(get().questions);
  const answered = qStats.reduce((a, q) => a + q.seen, 0);
  const right = qStats.reduce((a, q) => a + q.correct, 0);

  root.append(
    h('header', { class: 'page-head' }, h('h1', null, 'YDS Hazırlık Kartları'), h('p', { class: 'muted' }, 'Aralıklı tekrarla bağlaçları, gramer konularını ve kelimeleri kalıcı öğren.')),
    h('div', { class: 'stats' },
      stat(streak(), 'gün seri'),
      stat(log.reviews, 'bugün tekrar'),
      stat(answered ? `%${Math.round((right / answered) * 100)}` : '–', 'soru başarısı')));

  const plan = planSummary();
  if (plan && plan.left >= 0) {
    const tasks = plan.today.tasks;
    const doneCount = tasks.filter((t) => progress(t, plan.stats).done).length;
    root.append(h('section', { class: 'card deck today-card' },
      h('div', { class: 'deck-head' }, h('span', { class: 'deck-icon' }, '📅'), h('div', null,
        h('h2', null, plan.left === 0 ? 'Sınav bugün!' : `Sınava ${plan.left} gün kaldı`),
        h('p', { class: 'muted' }, `Bugünün planı: ${doneCount}/${tasks.length} görev tamam`))),
      h('div', { class: 'progress' }, h('span', { style: `width:${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` })),
      tasks.map((t) => taskRow(t, plan.stats)),
      h('a', { class: 'btn btn-ghost', href: '#/plan' }, 'Tüm planı gör')));
  }
  const { mocks, settings } = get();
  const target = settings.targetScore ?? 70;
  const last = mocks.at(-1);
  const baseline = settings.baselineCorrect;
  root.append(h('section', { class: 'card deck' },
    h('div', { class: 'deck-head' }, h('span', { class: 'deck-icon' }, '🎯'), h('div', null, h('h2', null, `Hedef: ${target} puan`),
      h('p', { class: 'muted' }, last ? `Son deneme ≈ ${String(last.scaled).replace('.', ',')} puan (${last.correct}/${last.total} doğru)` : baseline != null ? `Başlangıç: ${baseline} doğru (≈ ${String(baseline * 1.25).replace('.', ',')} puan)` : 'Süreli deneme çöz, bölüm analizini gör'))),
    h('div', { class: 'row-btns' }, h('a', { class: 'btn btn-primary', href: '#/mock' }, 'Deneme çöz'), h('a', { class: 'btn btn-ghost', href: '#/stats' }, 'İlerleme'))));

  const list = h('div', { class: 'deck-list' });
  root.append(list);
  for (const deck of DECKS) {
    const c = await counts(deck.id);
    const todo = c.due + c.newAvail;
    list.append(h('section', { class: 'card deck' },
      h('div', { class: 'deck-head' }, h('span', { class: 'deck-icon' }, deck.icon), h('div', null, h('h2', null, deck.title), h('p', { class: 'muted' }, deck.desc))),
      h('div', { class: 'deck-counts' },
        pill(c.newAvail, 'yeni', 'new'), pill(c.due, 'tekrar', 'due'), pill(c.mature, 'öğrenildi', 'ok')),
      h('div', { class: 'progress', title: 'Öğrenilen / toplam' }, h('span', { style: `width:${(c.mature / c.total) * 100}%` })),
      h('p', { class: 'muted small' }, `${c.mature + c.learning} / ${c.total} kart görüldü`),
      h('a', { class: `btn ${todo ? 'btn-primary' : 'btn-ghost'}`, href: `#/study/${deck.id}` }, todo ? `Çalışmaya başla (${todo})` : 'Bugünlük bitti – yine de çalış')));
  }

  const qs = await loadQuestions();
  const due = reviewDueIds().length;
  root.append(h('section', { class: 'card deck' },
    h('div', { class: 'deck-head' }, h('span', { class: 'deck-icon' }, '📝'), h('div', null, h('h2', null, 'Soru Çözümü'), h('p', { class: 'muted' }, `${qs.length} bağlaç ve gramer sorusu, çıkmış YDS sınavları`))),
    due ? h('a', { class: 'btn btn-primary', href: '#/quiz?mode=review' }, `Tekrar modu (${due} soru)`) : null,
    h('a', { class: 'btn btn-ghost', href: '#/quiz' }, 'Soru çözmeye git')));
}

const stat = (v, l) => h('div', { class: 'stat' }, h('strong', null, v), h('span', null, l));
const pill = (n, l, cls) => h('span', { class: `pill pill-${cls}` }, h('strong', null, n), ' ', l);
