// Ham YDS sınav dosyalarını (questionText / options "A) ..." / correctAnswer harfi) uygulamanın soru biçimine çevirir.
export const examIdFromFile = (file) => file.replace(/\.json$/, '');

// Eski dosyalarda doğru cevap harf ("A"), yeni dosyalarda şık metnidir; soru numarası olmayabilir (sıra no kullanılır).
export function normalizeQuestion(raw, examId, index = 0) {
  const m = /^\s*(\d+)\s*\.\s*([\s\S]*)$/.exec(raw.questionText);
  const number = m ? Number(m[1]) : index + 1;
  const stem = (m ? m[2] : raw.questionText).replace(/-{3,}/g, '____').replace(/\s+/g, ' ').trim();
  const options = raw.options.map((o) => o.replace(/^\s*[A-E]\)\s*/, '').trim());
  return {
    id: `${examId}:${number}`,
    number,
    kind: 'exam',
    stem,
    options,
    answer: answerIndex(raw, options),
    explanation: raw.explanation || '',
    grammarTopic: raw.grammarTopic || undefined,
  };
}

// Okuma parçası gerektiren sorularda metin veri setinde yok; bunlar çözülemez.
export function isSolvable(q) {
  return q.answer >= 0 && !/\b(passage|paragraph|the text|the author|the writer)\b/i.test(q.stem);
}

function answerIndex(raw, options) {
  const a = String(raw.correctAnswer).trim();
  if (/^[A-E]$/.test(a)) return 'ABCDE'.indexOf(a);
  return options.indexOf(a.replace(/^[A-E]\)\s*/, ''));
}
