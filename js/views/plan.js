import { h } from '../ui.js';
import { get, todayStats } from '../store.js';
import { daysLeft, schedule, progress, examDayTips } from '../plan.js';

const fmtDate = (ts) => new Date(ts).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

// Ana sayfada ve plan ekranında kullanılan görev satırı
export function taskRow(task, today) {
  const p = progress(task, today);
  const text = task.m === 'queue0' ? (p.done ? 'tamam' : `${today.queueDue} soru bekliyor`) : `${p.value}/${task.target}`;
  return h('a', { class: `task ${p.done ? 'done' : ''}`, href: task.href },
    h('span', { class: 'task-check' }, p.done ? '✓' : '○'),
    h('span', { class: 'task-label' }, task.label, task.optional ? h('span', { class: 'muted small' }, ' (isteğe bağlı)') : null),
    h('span', { class: 'task-prog muted small' }, text));
}

export function planSummary() {
  const { settings } = get();
  const left = daysLeft(settings.examDate);
  if (left == null) return null;
  const days = schedule(settings.examDate, Date.now(), settings.dailyMinutes ?? 90);
  return { left, today: days[0], days, stats: todayStats() };
}

export async function render(root) {
  const sum = planSummary();
  root.append(h('header', { class: 'page-head' }, h('h1', null, 'Sınav Planı')));
  if (!sum) {
    root.append(h('div', { class: 'empty' }, h('p', null, 'Sınav tarihi ayarlı değil.'), h('a', { class: 'btn btn-primary', href: '#/settings' }, 'Ayarlar')));
    return;
  }
  const { left, days, stats } = sum;
  const examDate = get().settings.examDate;
  if (left < 0) {
    root.append(h('div', { class: 'empty' }, h('h2', null, 'Sınav tarihi geçti'), h('p', { class: 'muted' }, 'Yeni bir sınav tarihi için Ayarlar\'ı kullan.'), h('a', { class: 'btn btn-ghost', href: '#/settings' }, 'Ayarlar')));
    return;
  }
  root.append(
    h('p', { class: 'muted' }, left === 0 ? 'Sınav bugün. Başarılar!' : `Sınava ${left} gün kaldı (${fmtDate(new Date(examDate.replace(/-/g, '/')).getTime())}). Günlük süre: ${get().settings.dailyMinutes ?? 90} dk (Ayarlar'dan değiştirilebilir).`),
    ...days.map((d, i) => h('section', { class: `card ${i === 0 ? 'today-card' : ''}` },
      h('h2', null, i === 0 ? 'Bugün' : d.daysLeft === 0 ? 'Sınav günü' : fmtDate(d.date), h('span', { class: 'muted small' }, d.daysLeft === 0 ? '' : ` · sınava ${d.daysLeft} gün`)),
      d.tasks.length ? d.tasks.map((t) => (i === 0 ? taskRow(t, stats) : h('div', { class: 'task future' }, h('span', { class: 'task-check' }, '○'), h('span', { class: 'task-label' }, t.label), h('span', { class: 'task-prog muted small' }, t.m === 'queue0' ? '' : `${t.target}`))))
        : h('p', { class: 'muted' }, 'Görev yok.'),
      d.daysLeft === 1 ? h('p', { class: 'muted small' }, 'Yeni konu başlama; erken yat. Uyku, sınavda bilgiden daha değerlidir.') : null)),
    h('section', { class: 'card' },
      h('h2', null, 'Sınav günü taktikleri'),
      h('ul', { class: 'lesson' }, examDayTips().map((t) => h('li', null, t)))),
    h('p', { class: 'muted small' }, 'Görevler uygulamadaki çalışmandan otomatik işaretlenir. Plan, günlük süreye ve kalan güne göre yenilenir.'));
}
