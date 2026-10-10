// Çıkmış YDS sorularını şık yapısına ve soru kökündeki ipuçlarına bakarak gramer konularına bağlayan kurallar.
// Yanlış etiket riskini azaltmak için kurallar temkinlidir: emin olunmayan soru etiketsiz kalır.

const lc = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

const PREPS = new Set(['in', 'on', 'at', 'of', 'to', 'for', 'with', 'from', 'by', 'about', 'into', 'over', 'under', 'between', 'among', 'through', 'within', 'without', 'against', 'towards', 'toward', 'upon', 'off', 'along', 'across', 'behind', 'beyond', 'around', 'onto', 'as', 'per', 'after', 'before', 'during', 'since', 'until', 'above', 'below', 'beside', 'besides', 'beneath', 'near', 'out', 'up', 'down']);
const REL = new Set(['who', 'whom', 'whose', 'which', 'that', 'where', 'when', 'why']);
const NOUN_CL = new Set(['what', 'whatever', 'whether', 'that', 'how', 'if', 'who', 'which', 'where', 'when', 'why', 'whoever', 'whichever']);
const QUANT = new Set(['many', 'much', 'few', 'little', 'a few', 'a little', 'fewer', 'less', 'several', 'some', 'any', 'each', 'every', 'most', 'all', 'both', 'either', 'neither', 'none', 'another', 'other', 'others', 'the other', 'the others', 'no', 'plenty of', 'a number of', 'the number of', 'a great deal of', 'a lot of', 'lots of', 'enough', 'one', 'half', 'the rest']);
const ARTICLES = new Set(['a', 'an', 'the', 'no article', '-', '—', '(no article)', 'zero article', '∅', 'some']);
const PRON = new Set(['himself', 'herself', 'itself', 'themselves', 'myself', 'yourself', 'ourselves', 'each other', 'one another', 'oneself', 'one', 'ones', 'that', 'those', 'it', 'them', 'him', 'her', 'they', 'he', 'she', 'theirs', 'his', 'hers', 'its', 'their']);
const AGREE = new Set(['is', 'are', 'was', 'were', 'has', 'have', 'does', 'do', 'had', 'did', 'being']);
const NEG_ADV = /^(not only|never|rarely|seldom|hardly|scarcely|barely|little|no sooner|only (after|when|if|by|then|in this way|with)|not until|under no|at no time|in no way|on no account|nowhere|not since|so (much|many|great|little))\b/i;

const IRREG = 'made|done|seen|given|taken|known|shown|found|held|kept|left|lost|paid|put|run|sent|set|told|thought|brought|bought|built|caught|taught|led|met|read|sold|spent|understood|won|written|chosen|driven|eaten|fallen|forgotten|gone|grown|hidden|spoken|stolen|worn|begun|drawn|broken|torn|thrown|flown|sung|become|come|got|gotten|had|been|cut|hit|hurt|let|shut|split|spread|lent|meant|slept|stood|struck|swept|woken|ridden|risen|beaten|bitten|blown|borne|bound|dealt|dug|fed|felt|fought|forbidden|forgiven|frozen|heard|hung|laid|lain|lit|overcome|proven|proved|rung|said|sat|shaken|shot|shrunk|sunk|swum|sworn|undertaken|withdrawn|wound';
const BE = '(?:is|are|was|were|be|been|being|am)';
const PASSIVE = new RegExp(`\\b${BE}\\s+(?:not\\s+)?(?:\\w+ed|\\w+en|${IRREG})\\b`);

const words = (s) => lc(s).split(' ');
const mainVerb = (opt) => {
  const w = words(opt).filter((x) => !['to', 'not', 'being', 'having'].includes(x));
  return w.length ? w[w.length - 1] : '';
};
const sharePrefix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
};
// Şıkların çoğu aynı fiilin farklı biçimiyse (develop / developed / to develop ...) biçim sorusudur.
function sameLemma(options) {
  const verbs = options.map(mainVerb);
  let best = 0;
  for (const v of verbs) best = Math.max(best, verbs.filter((x) => sharePrefix(x, v) >= Math.min(4, v.length, x.length) && Math.abs(x.length - v.length) <= 4).length);
  return best >= 3;
}
const fraction = (opts, set) => opts.filter((o) => set.has(o)).length;

// Gramer sorusu sayılma ön koşulu: boşluklu İngilizce kök ve kısa şıklar (çeviri, paragraf ve okuma soruları elenir).
export function isGrammarShaped(q) {
  if (!q.stem.includes('____')) return false;
  if (q.options.some((o) => o.includes('/') || o.split(/\s+/).length > 5)) return false; // iki boşluklu veya uzun şıklar
  if (q.options.every((o) => /^(I|II|III|IV|V)$/.test(o.trim()) || /^option [a-e]$/i.test(o.trim()))) return false;
  return !/[çğıöşüÇĞİÖŞÜ]/.test(q.stem) && !/closest in meaning|underlined|passage|paragraph/i.test(q.stem);
}

export function classify(q) {
  if (!isGrammarShaped(q)) return null;
  const stem = q.stem;
  const stemBare = stem.replace(/^\(\d+\)\s*/, '').replace(/\(\d+\)\s*____/g, '____');
  const opts = q.options.map(lc);
  const ans = opts[q.answer];
  const blankFirst = /^\(?\d*\)?\s*____/.test(stem);
  const hasIf = /\b(if|unless|provided|supposing)\b/i.test(stem) || /^(had|were|should)\b/i.test(ans) && blankFirst;

  // 1) Çıkış tek sözcüklük kapalı kümeler
  if (fraction(opts, PREPS) >= 5 && !blankFirst) return ['g-prepositions', 'edat şıkları'];
  if (fraction(opts, ARTICLES) >= 3) return ['g-articles', 'article şıkları'];
  if (fraction(opts, QUANT) >= 4) return ['g-quantifiers', 'miktar belirleyici şıkları'];
  const relHits = fraction(opts, REL);
  if (relHits >= 4) {
    if (/^it (is|was|has been|will be)\b/i.test(stemBare) && ['that', 'who', 'which'].includes(ans)) return ['g-cleft', 'cleft cümlesi'];
    return ['g-relative-clauses', 'ilgi zamiri şıkları'];
  }
  if (fraction(opts, NOUN_CL) >= 4 && !blankFirst) return ['g-noun-clauses', 'noun clause şıkları'];
  if (fraction(opts, NOUN_CL) >= 4 && blankFirst && ['what', 'whatever', 'whoever', 'that', 'whether'].includes(ans)) return ['g-noun-clauses', 'noun clause şıkları'];
  if (opts.filter((o) => /^(himself|herself|itself|themselves|myself|yourself|ourselves|each other|one another|oneself)$/.test(o)).length >= 2) return ['g-pronouns', 'reflexive / each other şıkları'];
  if (fraction(opts, AGREE) >= 4) return ['g-agreement', 'özne-fiil uyumu şıkları'];

  // 2) Devrik yapı
  if (NEG_ADV.test(stemBare) && stemBare.includes('____') && opts.filter((o) => /^(did|do|does|had|has|have|would|could|can|will|is|are|was|were|should|might|may) /.test(o)).length >= 3) return ['g-inversion', 'olumsuz zarf + devrik'];

  // 3) Sıfat / zarf ikilisi (hard / hardly vb.)
  const lyPairs = opts.filter((o) => opts.some((p) => p !== o && p === `${o}ly`)).length;
  if (lyPairs >= 1 && !sameLemma(opts) && opts.every((o) => !o.includes(' '))) return ['g-adj-adv', 'sıfat / zarf ikilisi'];

  // 4) Karşılaştırma
  const compOpts = opts.filter((o) => /^(more|most|less|least|the most|the least|as|far more|much more|\w{3,}er|the \w{3,}est|\w+ than)\b/.test(o)).length;
  if (compOpts >= 3 && (/\bthan\b|\bas\b[^.]*\bas\b|\bthe ____,? the\b/i.test(stemBare))) return ['g-comparison', 'karşılaştırma yapısı'];

  // 5) Fiil biçimi soruları
  const lemma = sameLemma(opts);
  const aux = opts.filter((o) => /^(has|have|had|is|are|was|were|will|would|can|could|may|might|must|should|ought|do|does|did|be|been|being|to be|needn't|can't|couldn't|shouldn't)\b/.test(o)).length;
  if (!(lemma || aux >= 3)) return null;

  if (/\bwish(es|ed)?\b|\bif only\b|\bwould rather\b|\b(it is|it's|it was) (high |about )?time\b/i.test(stemBare)) return ['g-wish', 'wish / would rather yapısı'];
  if (/\b(suggest|recommend|insist|demand|propose|request|require|urge|advise|order)\w*\s+that\b|\b(essential|vital|important|necessary|imperative|crucial|desirable)\s+that\b/i.test(stemBare)) return ['g-subjunctive', 'öneri / zorunluluk + that'];

  // Koşul: if cümleciği + would / had / were / will biçimleri
  if (hasIf && opts.filter((o) => /\b(would|had|were|will)\b/.test(o)).length >= 2 && /\b(would|could|might|will)\b|^(had|were) (?!to\b)/.test(ans)) return ['g-conditionals', 'if cümlesi'];

  // Zaman / koşul yan cümlesinde gelecek: "when ... ____" cevabı Present, şıklarda will
  if (/\b(when|as soon as|until|before|after|once|by the time|while)\b/i.test(stemBare) && opts.some((o) => /^will\b/.test(o)) && opts.some((o) => /^\w+ed$/.test(o)) && /^(\w+s|[a-z]{2,6}|(is|are|am) \w+ing)$/.test(ans) && !/ed$/.test(ans)) return ['g-time-clause-tense', 'zaman bağlacı sonrası present'];

  if (/\b(has|have) been \w+ing\b/.test(ans)) return ['g-present-perfect-continuous', 'have been V-ing'];
  if (/\bhad been \w+ing\b/.test(ans)) return ['g-past-perfect', 'had been V-ing'];
  if (/\b(must|might|may|could|should|ought to|needn't|can't|couldn't|shouldn't) have \w+/.test(ans)) return ['g-modals-perfect', 'modal + have + V3'];
  if (/\bwould have \w+/.test(ans) && hasIf) return ['g-conditionals', 'would have V3 + if'];
  if (/\b(will have|will be \w+ing|is going to|are going to|am going to|will)\b/.test(ans) && !/^(would)\b/.test(ans)) return ['g-future-forms', 'gelecek zaman yapısı'];
  if (PASSIVE.test(ans) && (opts.some((o) => !PASSIVE.test(o)) || opts.filter((o) => PASSIVE.test(o)).length >= 4)) return ['g-passive-basic', 'edilgen çatı şıkkı'];
  if (/^had (?!to\b|better\b)\w+/.test(ans)) return ['g-past-perfect', 'had V3'];
  if (/^(has|have) (?!to\b)\w+/.test(ans)) return ['g-past-vs-perfect', 'has / have V3'];
  if (/^(can|could|may|might|must|should|ought to|have to|has to|had to|needn't|can't|couldn't|shouldn't|mustn't|am able to|is able to|are able to) \w+/.test(ans)) return ['g-modals-present', 'modal + V1'];
  if (/^(am|is|are) \w+ing$/.test(ans) || /^(am|is|are) being \w+/.test(ans)) return ['g-present-simple-continuous', 'present continuous'];

  // fiilimsiler
  const toForms = opts.filter((o) => /^to \w+/.test(o)).length;
  const ingForms = opts.filter((o) => /^(\w+ing|having \w+|being \w+)$/.test(o)).length;
  if (/(^|,\s*)____[^,.]{0,60},/.test(stemBare) && opts.some((o) => /^(having|being) /.test(o) || /ing$/.test(o))) {
    if (/^(having \w+|being \w+|\w+ing|\w+ed|\w+en|\w+n|\w+t)$/.test(ans)) return ['g-participles', 'başta participle ifadesi'];
  }
  if (toForms >= 1 && ingForms >= 1) {
    // Cevap yalın V3 / having V3 ise ya da şıklarda yalın V3 de varsa soru fiil yönetimi değil participle (kısaltılmış cümle) sorusudur.
    const plainV3 = opts.some((o) => new RegExp(`^(\\w+(ed|en|wn)|${IRREG})$`).test(o));
    if (new RegExp(`^(\\w+(ed|en|wn)|${IRREG}|having \\w+|being \\w+)$`).test(ans) || (plainV3 && /^\w+ing$/.test(ans))) return ['g-participles', 'participle / kısaltılmış cümle'];
    return ['g-gerund-infinitive', 'to V1 / V-ing ayrımı'];
  }

  // Aynı fiilin farklı zamanları arasında seçim: cevap Past Simple ise 'Past Simple ↔ Present Perfect', Present Simple ise 'Present Simple'
  const PAST = /^(\w+ed|went|saw|took|made|came|gave|began|became|grew|knew|wrote|spoke|rose|fell|built|held|led|lost|won|paid|sent|set|spent|told|thought|found|got|left|kept|met|ran|sold|stood|taught|understood|wore|brought|bought|caught|began|drew|chose|broke|drove)$/;
  if (lemma && opts.filter((o) => /^(was|were|had|will|would|has|have|is|are) /.test(o)).length >= 2 && PAST.test(ans)) return ['g-past-vs-perfect', 'Past Simple seçimi'];
  if (lemma && opts.filter((o) => /^(was|were|had|will|would|has|have|is|are) /.test(o)).length >= 2 && /^\w+s?$/.test(ans) && !PAST.test(ans) && !/ing$/.test(ans)) return ['g-present-simple-continuous', 'Present Simple seçimi'];

  // Basit zaman karşıtlığı: şıklarda has / have V3 ve V2 birlikte
  if (opts.some((o) => /^(has|have) \w+/.test(o)) && /^\w+ed$|^(went|saw|took|made|came|gave|began|became|grew|knew|wrote|spoke|rose|fell|built|held|led|lost|won|paid|sent|set|spent|told|thought|found|got|left|kept|met|ran|sold|stood|taught|understood|wore|brought|bought|caught)$/.test(ans)) return ['g-past-vs-perfect', 'Past Simple ↔ Present Perfect'];
  if (opts.some((o) => /^(has|have) \w+/.test(o)) && /^(has|have) /.test(ans)) return ['g-past-vs-perfect', 'Present Perfect'];

  return null;
}
