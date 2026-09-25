import raw from '../../data/quotes.json';

export interface Quote {
  /** Generated from author + opening words; used for the quote's link. */
  id: string;
  text: string;
  author: string;
  source: {
    work: string;
    reference?: string;
    url?: string;
  };
  category: string;
  tags?: string[];
}

/** Internal link that respects the site's base path (e.g. /gnomikon/ on GitHub Pages). */
export function link(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^st\.?\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Link ids look like "john-chrysostom-for-the-secure-storehouse-of-good".
const seen = new Map<string, number>();
export const quotes: Quote[] = (raw as Omit<Quote, 'id'>[]).map((q) => {
  const opening = q.text.replace(/\[|\]/g, '').split(/\s+/).slice(0, 7).join(' ');
  const base = slugify(`${q.author} ${opening}`);
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return { ...q, id: n === 1 ? base : `${base}-${n}` };
});

export function citation(q: Quote): string {
  const where = [q.source.work, q.source.reference].filter(Boolean).join(', ');
  return `${q.author}, ${where}`;
}

function groupBy(key: (q: Quote) => string) {
  const map = new Map<string, Quote[]>();
  for (const q of quotes) {
    const k = key(q);
    map.set(k, [...(map.get(k) ?? []), q]);
  }
  return [...map.entries()]
    .map(([name, items]) => ({ name, slug: slugify(name), quotes: items }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const categories = groupBy((q) => q.category);
export const authors = groupBy((q) => q.author);
