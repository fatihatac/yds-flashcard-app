import { h } from '../ui.js';
import { get, sectionStats } from '../store.js';
import { sectionReport, neededCorrect, rawScore } from '../mock.js';
import { POINTS_PER_QUESTION, sectionById } from '../qtype.js';

const fmt = (n) => String(n).replace('.', ',');
const LINKS = {
  vocab: ['#/study/words', 'Kelime kartları'],
  grammar: ['#/study/grammar', 'Gramer kartları'],
  cloze: ['#/quiz', 'Bağlaç ve gramer soruları'],
  completion: ['#/study/conjunctions', 'Bağlaç kartları'],
  translation: ['#/mock', 'Deneme içinde çeviri'],
  reading: ['#/study/words', 'Kelime dağarcığı (okuma için)'],
  dialogue: ['#/mock', 'Deneme içinde diyalog'],
  paragraph: ['#/mock', 'Deneme içinde paragraf'],
  irrelevant: ['#/mock', 'Deneme içinde anlam bütünlüğü'],
};

export async function render(root) {
  const { mocks, settings } = get();
  const target = settings.targetScore ?? 70;
  const baseline = settings.baselineCorrect;
  const baselineScore = baseline != null ? rawScore(baseline) : null;
  const last = mocks.at(-1);
  const best = mocks.reduce((m, x) => Math.max(m, x.scaled), 0);
  const report = sectionReport(sectionStats());
  const ranked = report.filter((r) => r.potential != null).sort((a, b) => b.potential - a.potential);

  root.append(h('header', { class: 'page-head' }, h('h1', null, 'İlerleme ve Hedef'), h('p', { class: 'muted' }, `Hedef: ${target} puan (80 soruda ${neededCorrect(target)} doğru)`)));

  root.append(h('section', { class: 'card' },
    h('h2', null, 'Hedefe durum'),
    h('div', { class: 'stats' },
      stat(baselineScore != null ? fmt(baselineScore) : '–', baseline != null ? `başlangıç (${baseline} doğru)` : 'başlangıç (Ayarlar)'),
      stat(last ? fmt(last.scaled) : '–', 'son deneme'),
      stat(mocks.length ? fmt(best) : '–', 'en iyi deneme')),
    chart(mocks, target),
    last ? h('p', { class: 'muted small' }, last.scaled >= target ? 'Son denemede hedefin üzerindesin. Güvenli marj için 5-6 doğru fazlasını hedefle.' : `Son denemede hedefe ${fmt(Math.round((target - last.scaled) * 100) / 100)} puan (≈ ${Math.ceil((target - last.scaled) / POINTS_PER_QUESTION)} doğru) var.`)
      : h('p', { class: 'muted small' }, 'Henüz deneme çözmedin. İlk denemeyi çöz, burada puan grafiğin ve bölüm analizin oluşsun.'),
    h('a', { class: 'btn btn-primary', href: '#/mock' }, 'Deneme çöz')));

  root.append(h('section', { class: 'card' },
    h('h2', null, 'Soru tipine göre başarı'),
    h('p', { class: 'muted small' }, 'Uygulamada çözdüğün tüm sorulardan hesaplanır. Potansiyel: bu bölümde hâlâ kaybettiğin tahmini puan (gerçek sınav ağırlığına göre).'),
    report.map((r) => h('div', { class: 'bar-row' },
      h('div', { class: 'bar-label' }, h('span', null, r.label, h('span', { class: 'muted small' }, ` · sınavda ${r.weight} soru`)),
        h('span', { class: 'muted small' }, r.accuracy == null ? 'veri yok' : `%${Math.round(r.accuracy * 100)} (${r.correct}/${r.seen})`)),
      h('div', { class: 'progress' }, h('span', { style: `width:${(r.accuracy || 0) * 100}%` }))))));

  root.append(h('section', { class: 'card' },
    h('h2', null, 'Önce şuraya çalış'),
    ranked.length
      ? ranked.slice(0, 3).map((r, i) => h('a', { class: 'related', href: LINKS[r.id][0] }, h('strong', null, `${i + 1}. ${r.label}`), h('span', { class: 'muted small' }, `%${Math.round(r.accuracy * 100)} başarı · ≈ ${fmt(r.potential)} puan kayıp · ${LINKS[r.id][1]} →`)))
      : h('p', { class: 'muted' }, 'Henüz yeterli veri yok. Birkaç soru ve bir deneme çöz; öncelikli bölümler burada listelenecek.'),
    h('p', { class: 'muted small' }, 'Sınavda okuma 20, cümle tamamlama 10, cloze 10 ve dilbilgisi 10 soru: bu dört bölüm toplamın yarısından fazlası.')));

  if (mocks.length) {
    root.append(h('section', { class: 'card' },
      h('h2', null, 'Deneme geçmişi'),
      [...mocks].reverse().slice(0, 10).map((m) => h('div', { class: 'miss' }, h('p', null, h('b', null, `≈ ${fmt(m.scaled)} puan`), ` · ${m.correct}/${m.total} doğru`),
        h('p', { class: 'muted small' }, `${new Date(m.date).toLocaleDateString('tr-TR')} · ${m.title.replace(/YABANCI DİL BİLGİSİ SEVİYE TESPİT SINAVI/i, 'YDS').replace(/\s+/g, ' ')}`)))));
  }
}

const stat = (v, l) => h('div', { class: 'stat' }, h('strong', null, v), h('span', null, l));

// Deneme puanları ve hedef çizgisi (satır içi SVG, bağımlılık yok)
function chart(mocks, target) {
  if (mocks.length < 2) return null;
  const pts = mocks.slice(-10).map((m) => m.scaled);
  const W = 300, H = 90, pad = 8;
  const min = Math.min(40, ...pts) - 2, max = Math.max(100, ...pts);
  const x = (i) => pad + (i * (W - 2 * pad)) / Math.max(1, pts.length - 1);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);
  const ns = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => { const e = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': 'Deneme puanları' });
  svg.append(el('line', { x1: pad, x2: W - pad, y1: y(target), y2: y(target), class: 'chart-target' }));
  svg.append(el('polyline', { points: pts.map((v, i) => `${x(i)},${y(v)}`).join(' '), class: 'chart-line' }));
  pts.forEach((v, i) => svg.append(el('circle', { cx: x(i), cy: y(v), r: 3.5, class: 'chart-dot' })));
  return svg;
}
