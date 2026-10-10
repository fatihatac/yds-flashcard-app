// Deneme sınavı puanlama ve hedef hesapları (saf fonksiyonlar).
import { POINTS_PER_QUESTION, SECTIONS } from './qtype.js';

// answers: soruId -> seçilen orijinal şık indeksi (cevaplanmayan sorular yok)
export function scoreMock(questions, answers) {
  const bySection = {};
  let correct = 0;
  let wrong = 0;
  for (const q of questions) {
    const s = (bySection[q.section || 'grammar'] ||= { correct: 0, wrong: 0, blank: 0, total: 0 });
    s.total += 1;
    const a = answers[q.id];
    if (a == null) s.blank += 1;
    else if (a === q.answer) { s.correct += 1; correct += 1; } else { s.wrong += 1; wrong += 1; }
  }
  const total = questions.length;
  return { correct, wrong, blank: total - correct - wrong, total, scaled: scaledScore(correct, total), bySection };
}

// Çözülebilir soru sayısı 80'den azsa (okuma parçaları yok) doğru oranını 100 puana ölçekler.
export const scaledScore = (correct, total) => (total ? Math.round((correct / total) * 10000) / 100 : 0);
export const rawScore = (correct) => Math.round(correct * POINTS_PER_QUESTION * 100) / 100;
export const neededCorrect = (target = 70, total = 80) => Math.ceil((target / 100) * total - 1e-9);

// Bölüm başarısı ve kaybedilen puan potansiyeli: ağırlık × (1 - başarı) × 1,25
export function sectionReport(statsBySection) {
  return SECTIONS.map((s) => {
    const st = statsBySection[s.id];
    const acc = st && st.seen ? st.correct / st.seen : null;
    return { ...s, seen: st?.seen || 0, correct: st?.correct || 0, accuracy: acc, potential: acc == null ? null : Math.round(s.weight * (1 - acc) * POINTS_PER_QUESTION * 10) / 10 };
  });
}
