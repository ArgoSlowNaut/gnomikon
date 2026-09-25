// Checks data/quotes.json before a build. Run with: npm run validate
import { readFileSync } from 'node:fs';

const file = new URL('../data/quotes.json', import.meta.url);
let quotes;
try {
  quotes = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`data/quotes.json is not valid JSON:\n  ${err.message}`);
  process.exit(1);
}

const FIELDS = ['text', 'author', 'source', 'category', 'tags'];
const SOURCE_FIELDS = ['work', 'reference', 'url'];
const errors = [];
const texts = new Map();
const isText = (v) => typeof v === 'string' && v.trim() !== '';

if (!Array.isArray(quotes)) errors.push('The file must contain a JSON array of quotes.');
else quotes.forEach((q, i) => {
  const at = `quote #${i + 1}${q && isText(q.text) ? ` ("${q.text.slice(0, 40)}…")` : ''}`;
  if (!q || typeof q !== 'object') return errors.push(`${at}: must be an object`);
  for (const k of Object.keys(q)) if (!FIELDS.includes(k)) errors.push(`${at}: unknown field "${k}"`);
  if (!isText(q.text)) errors.push(`${at}: "text" is required`);
  if (!isText(q.author)) errors.push(`${at}: "author" is required`);
  if (!isText(q.category)) errors.push(`${at}: "category" is required`);
  if (!q.source || typeof q.source !== 'object') errors.push(`${at}: "source" is required`);
  else {
    for (const k of Object.keys(q.source)) if (!SOURCE_FIELDS.includes(k)) errors.push(`${at}: unknown field "source.${k}"`);
    if (!isText(q.source.work)) errors.push(`${at}: "source.work" is required`);
    if (q.source.url && !/^https?:\/\//.test(q.source.url)) errors.push(`${at}: "source.url" must start with http(s)://`);
  }
  if (q.tags !== undefined && !(Array.isArray(q.tags) && q.tags.every(isText)))
    errors.push(`${at}: "tags" must be a list of words, e.g. ["pride", "anger"]`);
  if (isText(q.text)) {
    const key = q.text.trim().toLowerCase();
    if (texts.has(key)) errors.push(`${at}: same text as quote #${texts.get(key)}`);
    else texts.set(key, i + 1);
  }
});

if (errors.length) {
  console.error(`data/quotes.json has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`data/quotes.json OK: ${quotes.length} quotes.`);
