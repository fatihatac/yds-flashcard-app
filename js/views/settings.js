import { h } from '../ui.js';
import { loadDeck } from '../data.js';
import { get, setSetting, exportData, importData, resetAll, addCustomQuestions } from '../store.js';
import { validateQuestion } from '../validate.js';
import { VERSION } from '../version.js';

export async function render(root, { applyTheme }) {
  const s = get().settings;
  const msg = h('p', { class: 'muted small', role: 'status' });
  const say = (t) => { msg.textContent = t; };

  const num = (label, path, value, min, max) => h('label', { class: 'field' }, h('span', null, label),
    h('input', { type: 'number', min, max, value, onchange: (e) => setSetting(path, Math.min(max, Math.max(min, Number(e.target.value) || min))) }));

  const fileInput = (accept, onText) => h('input', { type: 'file', accept, class: 'hidden', onchange: async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { await onText(await f.text()); } catch (err) { say(`Hata: ${err.message}`); }
    e.target.value = '';
  } });

  const restoreInput = fileInput('application/json', (text) => { importData(text); say('Yedek yüklendi.'); });
  const questionInput = fileInput('application/json', async (text) => {
    const list = JSON.parse(text);
    if (!Array.isArray(list)) throw new Error('Dosya bir soru dizisi olmalı');
    const ids = new Set((await loadDeck('conjunctions')).map((c) => c.id));
    const bad = list.map((q, i) => [i + 1, validateQuestion(q, ids)]).filter(([, e]) => e.length);
    if (bad.length) throw new Error(`Soru ${bad[0][0]}: ${bad[0][1].join(', ')}`);
    say(`${addCustomQuestions(list)} yeni soru eklendi.`);
  });

  root.append(
    h('header', { class: 'page-head' }, h('h1', null, 'Ayarlar')),
    h('section', { class: 'card form' },
      h('h2', null, 'Günlük hedefler'),
      num('Günlük yeni bağlaç kartı', 'newPerDay.conjunctions', s.newPerDay.conjunctions, 0, 50),
      num('Günlük yeni kelime kartı', 'newPerDay.words', s.newPerDay.words, 0, 100),
      num('Günlük en fazla tekrar', 'maxReviews', s.maxReviews, 10, 500)),
    h('section', { class: 'card form' },
      h('h2', null, 'Bağlaç kartı yönü'),
      h('label', { class: 'field' }, h('span', null, 'Ön yüz'),
        h('select', { onchange: (e) => setSetting('cardDirection', e.target.value) },
          [['en-tr', 'İngilizce bağlaç → Türkçe anlam + kural'], ['tr-en', 'Türkçe anlam + kural → İngilizce bağlaç']].map(([v, l]) => h('option', { value: v, selected: (s.cardDirection || 'en-tr') === v }, l))))),
    h('section', { class: 'card form' },
      h('h2', null, 'Görünüm'),
      h('label', { class: 'field' }, h('span', null, 'Tema'),
        h('select', { onchange: (e) => { setSetting('theme', e.target.value); applyTheme(); } },
          [['auto', 'Cihaza göre'], ['light', 'Açık'], ['dark', 'Koyu']].map(([v, l]) => h('option', { value: v, selected: s.theme === v }, l))))),
    h('section', { class: 'card form' },
      h('h2', null, 'Soru ekle'),
      h('p', { class: 'muted small' }, 'Kendi soru setini JSON olarak yükle. Biçim README.md içinde anlatılıyor.'),
      h('button', { class: 'btn btn-ghost', onclick: () => questionInput.click() }, 'Soru dosyası seç'), questionInput),
    h('section', { class: 'card form' },
      h('h2', null, 'Yedek'),
      h('p', { class: 'muted small' }, 'İlerleme yalnızca bu cihazın tarayıcısında saklanır. Telefon değiştirirsen yedeği indirip yükle.'),
      h('button', { class: 'btn btn-ghost', onclick: download }, 'Yedeği indir'),
      h('button', { class: 'btn btn-ghost', onclick: () => restoreInput.click() }, 'Yedeği yükle'), restoreInput,
      h('button', { class: 'btn btn-danger', onclick: () => { if (confirm('Tüm ilerleme silinecek. Emin misin?')) { resetAll(); applyTheme(); say('İlerleme sıfırlandı.'); } } }, 'İlerlemeyi sıfırla')),
    h('p', { class: 'muted small' }, `Sürüm: ${VERSION}`),
    msg);

  function download() {
    const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
    const a = h('a', { href: url, download: `yds-yedek-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
