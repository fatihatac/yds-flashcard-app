import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const sw = fs.readFileSync(new URL('sw.js', root), 'utf8');
const shell = JSON.parse(`[${sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].replace(/'/g, '"').replace(/,\s*$/, '')}]`);
const list = (dir) => fs.readdirSync(new URL(dir, root)).map((f) => `${dir}${f}`);

test('çevrimdışı: uygulamanın tüm dosyaları service worker önbellek listesinde', () => {
  const exams = JSON.parse(fs.readFileSync(new URL('data/exams.json', root), 'utf8')).map((e) => `data/${e.file}`);
  const covered = new Set([...shell, ...exams]);
  const needed = ['index.html', 'manifest.webmanifest', ...list('css/'), ...list('icons/'), ...list('js/').filter((f) => f.endsWith('.js')), ...list('js/views/'), ...list('data/')];
  assert.deepEqual(needed.filter((f) => !covered.has(f)), []);
  for (const f of shell) if (f !== './') assert.ok(fs.existsSync(new URL(f, root)), `listede olup olmayan dosya: ${f}`);
});
