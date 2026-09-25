# Gnomikon

Sayings of the Orthodox Church Fathers and Church Mothers in English, with search built for how people actually look for quotes.
It was inspired by the Russian collection at [azbyka.ru/quotes](https://azbyka.ru/quotes/).

What the search does:

- **Everyday words find older ones.** `anger` also finds *wrath*, `worry` finds *cares*, and `ego` finds *pride* and *vainglory*.
- **Typos are tolerated.** `humilty` still finds humility.
- **Old English matches modern English.** `has` matches *hath*, and `you` matches *thou* and *thee*.
- **Exact phrases.** Wrap the query in double quotes: `"storehouse of good works"`.
- **Filters.** Narrow by topic and by saint. Matching words are highlighted.
- **Shareable searches.** The search and filters are saved in the URL, so you can bookmark or share them.
- **Per-quote pages.** Each quote has its own link, and a **Copy** button that copies the text with its citation.
- **Situation prompts.** One-click searches such as "When I am angry" or "When I cannot pray" (edit them in `src/pages/index.astro`).
- **Keyboard.** Press `/` to jump to the search box.

Built with [Astro](https://astro.build) as a static site, and search is done by [MiniSearch](https://lucaong.github.io/minisearch/) in the browser.
There is no server or database: the entire collection is one JSON file.

## Running it locally

You need [Node.js](https://nodejs.org) 20 or newer, and Git.

```bash
git clone https://github.com/ArgoSlowNaut/gnomikon.git
cd gnomikon
npm install
npm run dev
```

Then open <http://localhost:4321>. The site reloads as you edit files, including `data/quotes.json`.
Press `Ctrl+C` in the terminal to stop the server.

Other commands:

| Command            | What it does                                                      |
| ------------------ | ----------------------------------------------------------------- |
| `npm run validate` | Checks `data/quotes.json` for mistakes (see below)                |
| `npm run build`    | Validates the quotes, then builds the static site into `dist/`    |
| `npm run preview`  | Serves the built `dist/` folder to check it before deploying      |

The `dist/` folder can be hosted on any static host, such as GitHub Pages, Netlify, or Cloudflare Pages.

## How quotes are stored

Every quote is stored in **`data/quotes.json`**, which is a single JSON array.
To add a quote, add an object to that array:

```json
{
  "text": "For the secure storehouse of good works is to forget our good works.",
  "author": "St. John Chrysostom",
  "source": {
    "work": "Homilies on the Gospel of Matthew",
    "reference": "Homily 3, §7",
    "url": "https://ccel.org/ccel/schaff/npnf110"
  },
  "category": "Humility",
  "tags": ["vainglory", "almsgiving", "good works"]
}
```

| Field              | Required | Description                                                                                          |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `text`             | yes      | The quote itself, copied exactly as printed. Use `[brackets]` for words you add and `…` for words you leave out. Leave off the outer quotation marks; the site adds them. |
| `author`           | yes      | The author's name. Spell it the same way every time, because each spelling gets its own author page. |
| `source.work`      | yes      | The title of the book, homily, or letter.                                                            |
| `source.reference` | no       | Where in the work: chapter, homily, section, or page.                                                |
| `source.url`       | no       | A link to the source text online.                                                                    |
| `category`         | yes      | One main topic, such as `Humility`, `Prayer`, or `Repentance`. Topics are created automatically from whatever values you use, so keep the spelling and capitalization consistent. |
| `tags`             | no       | Extra keywords that help search. Useful for words the quote doesn't contain, e.g. `["anxiety"]` on a quote about "cares". |

Topics and authors don't need to be set up anywhere else.
Each distinct `author` and `category` value automatically gets its own page and appears in the filters.

You don't write an id for a quote.
The site builds each quote's link from the author and the quote's first few words, e.g. `/quote/john-chrysostom-for-the-secure-storehouse-of-good-works`.
If you change the start of a quote's text or its author, its link changes too, so old shared links to it will stop working.

**After editing, run `npm run validate`.**
It catches invalid JSON (usually a missing comma), missing required fields, misspelled field names, duplicate quotes, and badly formatted URLs.
`npm run build` runs the same check and stops if it fails.

### Improving search

Search maps everyday words to the older words the Fathers use.
Those mappings are the `SYNONYMS` list in [`src/lib/search.ts`](src/lib/search.ts).
If a search you'd expect to work comes up empty, add a line there, for example `envy: ['jealousy', 'malice']`.

### Copyright

Use public-domain translations wherever you can.
Good sources are the *Ante-Nicene* and *Nicene and Post-Nicene Fathers* series (1885–1900), which are free at [ccel.org](https://ccel.org).
Many well-known modern translations are still under copyright, for example the Palmer/Sherrard/Ware *Philokalia* and most translations of 20th-century elders.
For those, keep quotes short and always cite the source.

## Design

The look is taken from Byzantine manuscripts and Greek church art:

- **Colors:** parchment and ink, with lapis blue for links, gold leaf for ornaments, and cinnabar red for the first letter of each quote, the way manuscripts marked initials in red. Dark mode uses deep lapis blue and gold, and turns on automatically when your system is set to dark.
- **Ornaments:** a Greek key band across the header and footer, and a Greek cross with IC XC NIKA ("Jesus Christ conquers").
- **Fonts:** [GFS Didot](https://fonts.google.com/specimen/GFS+Didot), a Greek typeface, for headings, and [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) for text. Both load from Google Fonts.

All colors are CSS variables at the top of [`src/layouts/Base.astro`](src/layouts/Base.astro), with the light theme first and the dark theme below it.
Change a value there and it applies to the whole site.

## Project layout

```
data/quotes.json                 all quotes (the only file you need to edit to add content)
scripts/validate-quotes.mjs      checks the quotes file
src/lib/quotes.ts                loads quotes, builds quote links and the topic and author lists
src/lib/search.ts                search engine setup and synonym list
src/pages/index.astro            the search page, including the situation prompts
src/pages/categories.astro       list of topics  (category/[slug].astro is one topic's page)
src/pages/authors.astro          list of saints  (author/[slug].astro is one saint's page)
src/pages/quote/[id].astro       the page for a single quote
src/components/QuoteCard.astro   how a quote is displayed
src/components/Cross.astro       the Greek cross ornament
src/layouts/Base.astro           page frame, header and footer, colors, and shared styles
public/favicon.svg               browser tab icon
```
