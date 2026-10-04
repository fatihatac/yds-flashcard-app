// Deste türüne göre kart yüzlerini çizer.
import { h, chips } from './ui.js';

const conjunction = {
  front(c) {
    return h('div', { class: 'face-front' },
      h('span', { class: 'tag' }, c.category),
      h('p', { class: 'front-tr' }, c.tr),
      h('p', { class: 'front-rule' }, '(', c.rule, ')'),
      h('p', { class: 'hint' }, 'Cevabı görmek için karta dokun'));
  },
  back(c, { onQuiz } = {}) {
    return h('div', { class: 'face-back' },
      h('p', { class: 'label' }, 'İngilizce karşılıkları'),
      chips(c.group, 'chip chip-big'),
      c.meanings && h('ul', { class: 'meanings' }, Object.entries(c.meanings).map(([k, v]) => h('li', null, h('b', null, k), ' → ', v))),
      h('p', { class: 'label' }, 'Anlamı'),
      h('p', null, c.meaning),
      h('p', { class: 'label' }, 'Ne zaman kullanılır?'),
      h('p', null, c.usage),
      h('p', { class: 'label' }, 'Örnek cümle'),
      h('blockquote', null, h('p', { class: 'en' }, c.example.en), h('p', { class: 'tr' }, c.example.tr)),
      h('div', { class: 'tip' }, h('strong', null, 'YDS Tüyosu'), h('p', null, c.tip)),
      onQuiz && h('button', { class: 'btn btn-ghost', onclick: (e) => { e.stopPropagation(); onQuiz(); } }, 'Bu konudan soru çöz →'));
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
