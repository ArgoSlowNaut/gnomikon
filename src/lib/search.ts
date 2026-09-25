import MiniSearch from 'minisearch';
import type { Quote } from './quotes';

// Everyday words people type, mapped to the words the Fathers (and older
// translations) actually use. Extend freely.
const SYNONYMS: Record<string, string[]> = {
  anger: ['wrath', 'rage', 'wrathful'],
  angry: ['anger', 'wrath', 'wrathful'],
  anxiety: ['care', 'cares', 'worry', 'fear', 'trouble'],
  anxious: ['anxiety', 'care', 'worry'],
  worry: ['care', 'cares', 'anxiety', 'fear'],
  depression: ['despondency', 'despair', 'sorrow', 'dejection', 'acedia'],
  depressed: ['despondency', 'despair', 'sorrow'],
  sad: ['sorrow', 'grief', 'mourning', 'despondency'],
  grief: ['sorrow', 'mourning', 'death', 'tears'],
  death: ['die', 'dying', 'mortality', 'departed'],
  pride: ['vainglory', 'arrogance', 'haughtiness', 'boasting'],
  ego: ['pride', 'vainglory'],
  humble: ['humility', 'lowliness', 'lowly'],
  humility: ['lowliness', 'lowly', 'humble'],
  lust: ['fornication', 'impurity', 'passion', 'chastity'],
  greed: ['avarice', 'covetousness', 'money', 'riches', 'wealth'],
  money: ['riches', 'wealth', 'gold', 'possessions', 'avarice'],
  rich: ['riches', 'wealth', 'wealthy'],
  poor: ['poverty', 'alms', 'almsgiving', 'needy'],
  charity: ['almsgiving', 'alms', 'mercy', 'love'],
  forgive: ['forgiveness', 'remission', 'pardon', 'enemies'],
  forgiveness: ['forgive', 'remission', 'pardon'],
  enemy: ['enemies', 'forgive'],
  gossip: ['slander', 'judging', 'condemn', 'tongue'],
  judge: ['judging', 'condemn', 'condemnation'],
  judging: ['judge', 'condemn', 'condemnation'],
  lazy: ['sloth', 'idleness', 'negligence', 'acedia'],
  laziness: ['sloth', 'idleness', 'negligence'],
  pray: ['prayer', 'prayers', 'praying'],
  prayer: ['pray', 'praying', 'supplication'],
  fasting: ['fast', 'abstinence'],
  confession: ['repentance', 'confess', 'penitence'],
  repent: ['repentance', 'penitence', 'confession'],
  temptation: ['tempted', 'trial', 'temptations', 'devil'],
  suffering: ['affliction', 'afflictions', 'tribulation', 'trials', 'pain'],
  illness: ['sickness', 'disease', 'affliction'],
  sick: ['sickness', 'illness', 'disease'],
  marriage: ['married', 'wife', 'husband'],
  quiet: ['silence', 'stillness', 'hesychia'],
  silence: ['silent', 'stillness', 'tongue'],
  hypocrite: ['hypocrisy'],
  deification: ['theosis', 'divinization'],
  theosis: ['deification', 'divinization'],
};

// Archaic spellings in 19th-century translations, normalized so that
// "hath" matches "has", "thou" matches "you", and so on.
const ARCHAIC: Record<string, string> = {
  hath: 'has', doth: 'does', dost: 'do', thou: 'you', thee: 'you',
  thy: 'your', thine: 'your', ye: 'you', shalt: 'shall', wilt: 'will',
  canst: 'can', saith: 'says', spake: 'spoke',
};

function processTerm(term: string): string | null {
  const t = term.toLowerCase().replace(/[’']s$/, '').replace(/[’']/g, '');
  if (!t) return null;
  return ARCHAIC[t] ?? t;
}

export interface Filters {
  category?: string;
  author?: string;
}

export function createSearch(quotes: Quote[]) {
  const mini = new MiniSearch<Quote>({
    idField: 'id',
    fields: ['text', 'author', 'work', 'category', 'tags'],
    extractField: (doc, field) => {
      if (field === 'id') return doc.id;
      if (field === 'work') return doc.source.work;
      if (field === 'tags') return (doc.tags ?? []).join(' ');
      return (doc as unknown as Record<string, string>)[field];
    },
    processTerm,
    searchOptions: {
      boost: { category: 3, tags: 2, author: 2, text: 1, work: 1 },
      prefix: (term) => term.length > 2,
      fuzzy: (term) => (term.length > 4 ? 0.2 : false),
      combineWith: 'OR',
    },
  });
  mini.addAll(quotes);
  const byId = new Map(quotes.map((q) => [q.id, q]));

  return function search(query: string, filters: Filters = {}) {
    const matches = (q: Quote) =>
      (!filters.category || q.category === filters.category) &&
      (!filters.author || q.author === filters.author);

    const trimmed = query.trim();
    if (!trimmed) return { results: quotes.filter(matches), terms: [] as string[] };

    // "exact phrase" search when the whole query is wrapped in double quotes.
    const phrase = trimmed.match(/^"(.+)"$/);
    if (phrase) {
      const needle = phrase[1].toLowerCase();
      return {
        results: quotes.filter((q) => matches(q) && q.text.toLowerCase().includes(needle)),
        terms: [phrase[1]],
      };
    }

    const words = trimmed.toLowerCase().split(/\s+/);
    const synonyms = [...new Set(words.flatMap((w) => SYNONYMS[w] ?? []))].filter(
      (w) => !words.includes(w),
    );

    // Hits on the words actually typed rank above hits on synonyms.
    const hits = new Map<string, { score: number; terms: string[] }>();
    const run = (q: string, weight: number) => {
      for (const r of mini.search(q)) {
        const prev = hits.get(String(r.id));
        hits.set(String(r.id), {
          score: (prev?.score ?? 0) + r.score * weight,
          terms: [...(prev?.terms ?? []), ...r.terms],
        });
      }
    };
    run(words.join(' '), 1);
    if (synonyms.length) run(synonyms.join(' '), 0.5);

    const results = [...hits.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .map(([id]) => byId.get(id)!)
      .filter(matches);
    const terms = [...new Set([...hits.values()].flatMap((h) => h.terms))];
    return { results, terms };
  };
}
