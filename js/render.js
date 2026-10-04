// Deste türüne göre kart yüzlerini çizer.
import { h, chips } from './ui.js';
import { get } from './store.js';

// Kart yönü ayarı: 'en-tr' (ön yüz İngilizce bağlaç grubu, arka yüz Türkçe anlam + kural) veya 'tr-en' (ters).
const direction = () => get().settings.cardDirection === 'tr-en' ? 'tr-en' : 'en-tr';

const meaningList = (c) => c.meanings && h('ul', { class: 'meanings' }, Object.entries(c.meanings).map(([k, v]) => h('li', null, h('b', null, k), ' → ', v)));

const details = (c, onQuiz) => [
  h('p', { class: 'label' }, 'Anlamı'),
  h('p', null, c.meaning),
  h('p', { class: 'label' }, 'Ne zaman kullanılır?'),
  h('p', null, c.usage),
  h('p', { class: 'label' }, 'Örnek cümle'),
  h('blockquote', null, h('p', { class: 'en' }, c.example.en), h('p', { class: 'tr' }, c.example.tr)),
  h('div', { class: 'tip' }, h('strong', null, 'YDS Tüyosu'), h('p', null, c.tip)),
  onQuiz && h('button', { class: 'btn btn-ghost', onclick: (e) => { e.stopPropagation(); onQuiz(); } }, 'Bu konudan soru çöz →'),
];

const conjunction = {
  front(c) {
    if (direction() === 'en-tr') {
      return h('div', { class: 'face-front' },
        h('span', { class: 'tag' }, c.category),
        h('div', { class: 'front-group' }, c.group.map((g) => h('p', { class: 'front-en' }, g))),
        h('p', { class: 'hint' }, 'Türkçe anlamını ve kuralını düşün, sonra karta dokun'));
    }
    return h('div', { class: 'face-front' },
      h('span', { class: 'tag' }, c.category),
      h('p', { class: 'front-tr' }, c.tr),
      h('p', { class: 'front-rule' }, '(', c.rule, ')'),
      h('p', { class: 'hint' }, 'Cevabı görmek için karta dokun'));
  },
  back(c, { onQuiz } = {}) {
    if (direction() === 'en-tr') {
      return h('div', { class: 'face-back' },
        chips(c.group, 'chip'),
        h('p', { class: 'label' }, 'Türkçe anlamı ve gramer kuralı'),
        h('p', { class: 'front-tr small-tr' }, c.tr),
        h('p', { class: 'front-rule small-rule' }, '(', c.rule, ')'),
        meaningList(c),
        details(c, onQuiz));
    }
    return h('div', { class: 'face-back' },
      h('p', { class: 'label' }, 'İngilizce karşılıkları'),
      chips(c.group, 'chip chip-big'),
      meaningList(c),
      details(c, onQuiz));
  },
};

const word = {
  front(w) {
    return h('div', { class: 'face-front' },
      h('span', { class: 'tag' }, w.type),
      h('p', { class: 'front-word' }, w.word),
      h('p', { class: 'hint' }, 'Anlamı görmek için karta dokun'));
  },
  back(w) {
    return h('div', { class: 'face-back' },
      h('p', { class: 'word-small' }, w.word, ' ', h('span', { class: 'muted' }, '· ', w.type)),
      h('p', { class: 'label' }, 'Türkçe anlamları'),
      chips(w.meanings, 'chip chip-big'),
      w.synonyms?.length ? [h('p', { class: 'label' }, 'Eş anlamlılar'), chips(w.synonyms, 'chip chip-soft')] : null);
  },
};

export const renderers = { conjunction, word };
