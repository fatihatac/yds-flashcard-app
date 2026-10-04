// Aralıklı tekrar (SM-2 tabanlı, 4 dereceli). Saf fonksiyonlar: DOM / depolama bilgisi yok.
export const RATING = { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 3 };

const MINUTE = 60 * 1000;
const MAX_INTERVAL = 365;
const MATURE_DAYS = 21;
const FIRST_STEPS = [1, 2, 4]; // Hard / Good / Easy için ilk aralıklar (gün)

export function newCardState() {
  return { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: 0, last: 0 };
}

export function addDays(ts, days) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function schedule(card, rating, now = Date.now()) {
  const c = { ...newCardState(), ...(card || {}) };
  if (rating === RATING.AGAIN) {
    c.lapses += 1;
    c.reps = 0;
    c.interval = 0;
    c.ef = Math.max(1.3, c.ef - 0.2);
    c.due = now + 10 * MINUTE;
    c.last = now;
    return c;
  }
  let days;
  if (c.reps === 0 || c.interval < 1) {
    days = FIRST_STEPS[rating - 1];
  } else if (rating === RATING.HARD) {
    days = Math.max(c.interval, Math.round(c.interval * 1.2));
  } else if (rating === RATING.GOOD) {
    days = Math.max(c.interval + 1, Math.round(c.interval * c.ef));
  } else {
    days = Math.max(c.interval + 2, Math.round(c.interval * c.ef * 1.3));
  }
  days = Math.min(MAX_INTERVAL, days);
  if (rating === RATING.HARD) c.ef = Math.max(1.3, c.ef - 0.15);
  if (rating === RATING.EASY) c.ef += 0.15;
  c.reps += 1;
  c.interval = days;
  c.due = addDays(now, days);
  c.last = now;
  return c;
}

export function isDue(card, now = Date.now()) {
  return !!card && card.due <= now;
}

export function status(card) {
  if (!card || card.reps === 0 && card.lapses === 0 && !card.last) return 'new';
  return card.interval >= MATURE_DAYS ? 'mature' : 'learning';
}

export function previewLabels(card, now = Date.now()) {
  return [RATING.AGAIN, RATING.HARD, RATING.GOOD, RATING.EASY].map((r) => {
    const next = schedule(card, r, now);
    return r === RATING.AGAIN ? '10 dk' : formatDays(next.interval);
  });
}

export function formatDays(days) {
  if (days < 1) return '10 dk';
  if (days < 30) return `${days} g`;
  if (days < 365) return `${Math.round(days / 30)} ay`;
  return '1 yıl';
}
