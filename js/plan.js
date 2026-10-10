// Sınava kalan güne göre günlük çalışma planı (saf fonksiyonlar).
const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const parseDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };

// Sınav gününe kalan gün sayısı (bugün sınavsa 0, geçtiyse negatif)
export function daysLeft(examIso, now = Date.now()) {
  if (!examIso) return null;
  return Math.round((parseDate(examIso) - startOfDay(now)) / DAY);
}

// Günlük süreye göre hedef çarpanı: 90 dk = 1
export const scaleFor = (minutes = 90) => Math.min(1.6, Math.max(0.4, minutes / 90));

// Görev ölçümleri: today = { reviews, newByDeck, q, sec, mocks, queueDue }
export function measure(task, today) {
  switch (task.m) {
    case 'reviews': return today.reviews || 0;
    case 'new': return today.newByDeck?.[task.deck] || 0;
    case 'q': return today.q || 0;
    case 'sec': return today.sec?.[task.sec] || 0;
    case 'mocks': return today.mocks || 0;
    case 'queue0': return today.queueDue === 0 && (today.q > 0 || today.mocks > 0) ? 1 : 0; // bugün soru çözülmeden boş kuyruk sayılmaz
    default: return 0;
  }
}

export function progress(task, today) {
  const value = Math.min(task.target, measure(task, today));
  return { value, done: value >= task.target };
}

const EXAM_DAY_TIPS = [
  'Sınav giriş belgesini, kimliği ve kalemleri akşamdan hazırla.',
  'Zaman: 80 soru için 180 dakika, soru başına ortalama 2 dk 15 sn. Kelime ve dilbilgisi sorularını hızlı geç (soru başına ~45-60 sn), okumaya ve çeviriye süre bırak.',
  'Bilmediğin soruda takılma: işaretleyip ilerle, sonda dön. Hiçbir soruyu boş bırakma (yanlışların doğruları götürüp götürmediğini ÖSYM kılavuzundan teyit et).',
  'Dilbilgisi ve bağlaç sorularında önce boşluğun türünü belirle (fiil, bağlaç, edat, zarf), şıkları gramerle ele, sonra anlama bak.',
  'Son 30 dakikada cevap kâğıdına aktarmayı ve işaretlediğin soruları kontrol et.',
];
export const examDayTips = () => EXAM_DAY_TIPS.slice();

// d: sınava kalan gün. minutes: günlük çalışma süresi.
export function dayTasks(d, minutes = 90) {
  const k = scaleFor(minutes);
  const n = (x) => Math.max(1, Math.round((x * k) / 5) * 5);
  const mini = minutes <= 60;
  const mock = { id: 'mock', m: 'mocks', target: 1, label: mini ? 'Mini deneme çöz (30 soru, süreli)' : 'Tam süreli deneme çöz', href: '#/mock' };
  const redo = { id: 'redo', m: 'queue0', target: 1, label: 'Tekrar modundaki yanlışları bitir', href: '#/quiz?mode=review' };
  const cards = (x, label = 'Kart tekrarları (kelime, bağlaç, gramer)') => ({ id: 'cards', m: 'reviews', target: n(x), label: `${label}`, href: '#/study' });
  const vocab = (x, label) => ({ id: 'vocab', m: 'sec', sec: 'vocab', target: n(x), label, href: '#/quiz?area=vocab' });
  const quiz = (x, label) => ({ id: 'quiz', m: 'q', target: n(x), label, href: '#/quiz' });
  if (d < 0) return [];
  if (d === 0) return [{ ...cards(15, 'Hafif tekrar (isteğe bağlı)'), optional: true }];
  if (d === 1) return [redo, cards(30, 'Hafif kart tekrarı (yeni kart yok)')];
  if (d === 2) return [quiz(40, 'Zayıf konulardan soru çöz (İlerleme → önce şuraya çalış)'), vocab(20, 'Kelime / phrasal verb testi'), cards(30)];
  if (d === 3) return [mock, redo, cards(30)];
  if (d === 4) return [quiz(40, 'Bağlaç ve gramer soruları (tuzak soruları dahil)'), vocab(30, 'Kelime ve phrasal verb testi'), cards(30)];
  if (d === 5) return [mock, redo, { id: 'newg', m: 'new', deck: 'grammar', target: n(5), label: 'Yeni gramer kartları', href: '#/study/grammar' }, cards(25)];
  if (d === 6) return [vocab(40, 'Kelime testi (İngilizce ↔ Türkçe, eş anlamlı)'), { id: 'neww', m: 'new', deck: 'words', target: n(15), label: 'Yeni kelime kartları', href: '#/study/words' }, cards(30)];
  // 7 ve öncesi: ilk ölçüm günü ve genel hazırlık
  const base = [{ id: 'newc', m: 'new', deck: 'conjunctions', target: n(10), label: 'Yeni bağlaç kartları', href: '#/study/conjunctions' }, cards(30)];
  return d % 3 === 1 || d === 7 ? [mock, redo, ...base] : [...base, quiz(30, 'Karışık soru çöz')];
}

// Bugünden sınava kadar gün gün plan (en fazla maxDays gün)
export function schedule(examIso, now = Date.now(), minutes = 90, maxDays = 14) {
  const left = daysLeft(examIso, now);
  if (left == null || left < 0) return [];
  const out = [];
  for (let d = Math.min(left, maxDays); d >= 0; d--) {
    out.push({ daysLeft: d, date: startOfDay(now) + (left - d) * DAY, tasks: dayTasks(d, minutes) });
  }
  return out;
}
