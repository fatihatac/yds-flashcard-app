// YDS soru tipleri (bölümler). 80 soruluk sınavlarda soru numarası bölümü belirler; diğer dosyalarda içerikten tahmin edilir.
export const POINTS_PER_QUESTION = 1.25; // 80 soru = 100 puan

export const SECTIONS = [
  { id: 'vocab', label: 'Kelime', weight: 6, range: [1, 6], hint: 'Kelime ve phrasal verb çalış' },
  { id: 'grammar', label: 'Dilbilgisi', weight: 10, range: [7, 16], hint: 'Gramer ve bağlaç kartları, tuzak soruları' },
  { id: 'cloze', label: 'Cloze test', weight: 10, range: [17, 26], hint: 'Bağlaç, edat ve gramer; çıkmış cloze soruları' },
  { id: 'completion', label: 'Cümle tamamlama', weight: 10, range: [27, 36], hint: 'Bağlaç kartları (yan cümle başlatan ifadeler)' },
  { id: 'translation', label: 'Çeviri', weight: 6, range: [37, 42], hint: 'Çeviri sorularını süreli deneme içinde çöz' },
  { id: 'reading', label: 'Okuma', weight: 20, range: [43, 62], hint: 'Okuma parçalı sorular (bu uygulamada parça metni yok)' },
  { id: 'dialogue', label: 'Diyalog', weight: 5, range: [63, 67], hint: 'Diyalog tamamlama sorularını denemede çöz' },
  { id: 'paragraph', label: 'Paragraf tamamlama', weight: 8, range: [68, 75], hint: 'Paragraf tamamlama sorularını denemede çöz' },
  { id: 'irrelevant', label: 'Anlam bütünlüğünü bozan cümle', weight: 5, range: [76, 80], hint: 'Anlam bütünlüğü sorularını denemede çöz' },
];

export const sectionById = (id) => SECTIONS.find((s) => s.id === id);
export const sectionByNumber = (n) => SECTIONS.find((s) => n >= s.range[0] && n <= s.range[1])?.id || null;

// Dil tespiti: Türkçe'ye özgü harfler ve sık Türkçe işlev sözcükleri, İngilizce işlev sözcükleriyle karşılaştırılır.
const TR_WORDS = /\b(ve|bir|için|ile|olarak|gibi|daha|çok|bu|ancak|fakat|olan|kadar|her|ise|veya|ya da|ne de|çünkü|sonra|önce|ayrıca|ama)\b/gi;
const EN_WORDS = /\b(the|of|and|to|is|in|that|with|are|was|for|as|by|it|an|be|have|has|which|from)\b/gi;
export function isTurkish(text) {
  const letters = (text.match(/[çğıöşüÇĞİÖŞÜ]/g) || []).length;
  const tr = (text.match(TR_WORDS) || []).length;
  const en = (text.match(EN_WORDS) || []).length;
  return letters >= 2 ? letters + tr > en : tr > en * 2 && tr >= 2;
}
const TURKISH = { test: (s) => isTurkish(s) };
const FUNCTION_OPTION = /^(in|on|at|of|to|for|with|from|by|about|into|over|although|despite|however|because|since|while|whereas|therefore|unless|if|so|but|and|or|as|than|that|which|who|whose|what|whether|is|are|was|were|has|have|had|will|would|can|could|may|might|must|should|do|does|did|to \w+|\w+ing|\w+ed)$/i;

// 80 soruluk olmayan dosyalar için içerikten tahmin.
export function contentSection(q) {
  const opts = q.options.map((o) => o.trim());
  if (opts.every((o) => /^(I|II|III|IV|V)$/.test(o))) return 'irrelevant';
  const turkishStem = TURKISH.test(q.stem);
  const turkishOpts = opts.filter((o) => TURKISH.test(o)).length >= 3;
  if (turkishStem !== turkishOpts) return 'translation';
  if (/^[A-Z][a-z]+:/.test(q.stem)) return 'dialogue';
  if (/\(\d+\)\s*____/.test(q.stem) || /^\(\d+\)/.test(q.stem)) return 'cloze';
  if (!q.stem.includes('____') || /\b(passage|paragraph|the text|the author|the writer|inferred|according to the)\b/i.test(q.stem)) return 'reading';
  if (opts.some((o) => o.split(/\s+/).length > 5)) return (q.stem.match(/[.!?]\s/g) || []).length >= 2 ? 'paragraph' : 'completion';
  return opts.filter((o) => FUNCTION_OPTION.test(o)).length >= 3 ? 'grammar' : 'vocab';
}

export function questionSection(q, total = 0) {
  if (total === 80 && q.number >= 1 && q.number <= 80) return sectionByNumber(q.number);
  return contentSection(q);
}
