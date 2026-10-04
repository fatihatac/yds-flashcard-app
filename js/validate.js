// Soru ve kart verisi doğrulama. Hem uygulama (içe aktarma) hem de scripts/validate-data.mjs kullanır.
export function validateQuestion(q, cardIds) {
  const errs = [];
  if (!q || typeof q !== 'object') return ['soru bir nesne değil'];
  if (!q.id || typeof q.id !== 'string') errs.push('id eksik');
  if (!q.stem || typeof q.stem !== 'string') errs.push('stem (soru metni) eksik');
  if (!Array.isArray(q.options) || q.options.length < 2) errs.push('options en az 2 şık içermeli');
  else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) errs.push('answer geçerli bir şık indeksi olmalı');
  if (q.cardIds != null) {
    if (!Array.isArray(q.cardIds)) errs.push('cardIds dizi olmalı');
    else if (cardIds) for (const id of q.cardIds) if (!cardIds.has(id)) errs.push(`bilinmeyen kart: ${id}`);
  }
  return errs;
}

export function validateCard(c) {
  const errs = [];
  for (const k of ['id', 'category', 'tr', 'rule', 'meaning', 'usage', 'tip']) if (!c[k]) errs.push(`${k} eksik`);
  if (!Array.isArray(c.group) || !c.group.length) errs.push('group boş');
  if (!c.example?.en || !c.example?.tr) errs.push('example.en / example.tr eksik');
  return errs;
}
