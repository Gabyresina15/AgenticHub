import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import {
  buildNewsCollection,
  NewsValidationError,
  parseNewsFile,
  sortNewsByDateDesc,
} from '../src/news/newsSchema.js';
import { loadNewsFromDirectory } from '../build/newsPlugin.js';

const fixtures = (name) => fileURLToPath(new URL(`./fixtures/news/${name}`, import.meta.url));
const contentDir = fileURLToPath(new URL('../../content/news', import.meta.url));

const doc = (frontmatter, body = 'Cuerpo') => `---\n${frontmatter}\n---\n${body}\n`;
const VALID_FM = [
  'title: "Título"',
  'date: 2026-10-16',
  'summary: "Resumen"',
  'sources:',
  '  - https://example.com/a',
  'tags: [ia]',
].join('\n');

describe('parseNewsFile', () => {
  it('parses a valid article and derives the slug from the file name', () => {
    const article = parseNewsFile('2026-10-16-hola-mundo.md', doc(VALID_FM, '# Hola'));
    expect(article).toEqual({
      slug: 'hola-mundo',
      title: 'Título',
      date: '2026-10-16',
      summary: 'Resumen',
      sources: ['https://example.com/a'],
      tags: ['ia'],
      content: '# Hola',
    });
  });

  it('defaults tags to an empty array when omitted', () => {
    const fm = VALID_FM.replace('tags: [ia]', '');
    expect(parseNewsFile('2026-10-16-x.md', doc(fm)).tags).toEqual([]);
  });

  it.each([
    ['2026-10-16-Hola.md', 'uppercase slug'],
    ['2026-10-16-hola_mundo.md', 'underscore'],
    ['2026-10-16-ñandu.md', 'non-ascii'],
    ['2026-10-16-hola-.md', 'trailing dash'],
    ['hola.md', 'no date prefix'],
    ['2026-10-16-hola.markdown', 'wrong extension'],
  ])('rejects invalid file name %s (%s)', (fileName) => {
    expect(() => parseNewsFile(fileName, doc(VALID_FM))).toThrow(/YYYY-MM-DD-slug\.md/);
  });

  it('rejects a date prefix that does not match the frontmatter date', () => {
    expect(() => parseNewsFile('2026-10-15-hola.md', doc(VALID_FM))).toThrow(
      '[news] Invalid article "2026-10-15-hola.md": date in file name (2026-10-15) does not match frontmatter date (2026-10-16)',
    );
  });

  it.each([
    ['title', VALID_FM.replace('title: "Título"', ''), /title/],
    ['summary', VALID_FM.replace('summary: "Resumen"', 'summary: "   "'), /summary is required/],
    ['date format', VALID_FM.replace('date: 2026-10-16', 'date: 16/10/2026'), /date must be an ISO date/],
    ['impossible date', VALID_FM.replace('date: 2026-10-16', 'date: 2026-02-30'), /not a real calendar date/],
    ['empty sources', VALID_FM.replace('sources:\n  - https://example.com/a', 'sources: []'), /sources must contain at least one URL/],
    ['non-URL source', VALID_FM.replace('https://example.com/a', 'not-a-url'), /sources\.0 must be an http\(s\) URL/],
    ['javascript: source', VALID_FM.replace('https://example.com/a', '"javascript:alert(1)"'), /sources\.0 must be an http\(s\) URL/],
    ['tags not array', VALID_FM.replace('tags: [ia]', 'tags: ia'), /tags/],
    ['unknown field', `${VALID_FM}\nauthor: x`, /author/],
  ])('rejects invalid frontmatter: %s', (_label, fm, message) => {
    const run = () => parseNewsFile('2026-10-16-hola.md', doc(fm));
    expect(run).toThrow(NewsValidationError);
    expect(run).toThrow(/"2026-10-16-hola\.md"/);
    expect(run).toThrow(message);
  });

  it('rejects files without frontmatter and malformed YAML', () => {
    expect(() => parseNewsFile('2026-10-16-a.md', '# Sin frontmatter')).toThrow(/missing YAML frontmatter/);
    expect(() => parseNewsFile('2026-10-16-a.md', doc('title: [roto'))).toThrow(/malformed YAML/);
    expect(() => parseNewsFile('2026-10-16-a.md', doc('- lista'))).toThrow(/must be a YAML mapping/);
  });
});

describe('sorting and collection', () => {
  it('sorts by date descending with slug as a stable tie-breaker', () => {
    const sorted = sortNewsByDateDesc([
      { slug: 'b', date: '2026-01-01' },
      { slug: 'c', date: '2026-03-01' },
      { slug: 'a', date: '2026-01-01' },
    ]);
    expect(sorted.map((a) => a.slug)).toEqual(['c', 'a', 'b']);
  });

  it('rejects duplicate slugs across dates', () => {
    const files = [
      { fileName: '2026-10-16-hola.md', raw: doc(VALID_FM) },
      { fileName: '2026-10-15-hola.md', raw: doc(VALID_FM.replace('2026-10-16', '2026-10-15')) },
    ];
    expect(() => buildNewsCollection(files)).toThrow(/duplicate slug "hola"/);
  });
});

describe('loadNewsFromDirectory', () => {
  it('loads and sorts the valid fixtures', async () => {
    const articles = await loadNewsFromDirectory(fixtures('valid'));
    expect(articles.map((a) => a.slug)).toEqual(['agentes-en-produccion', 'modelo-abierto']);
    expect(articles[1].content).toContain('<script>');
  });

  it('fails loudly naming the invalid file', async () => {
    await expect(loadNewsFromDirectory(fixtures('invalid'))).rejects.toThrow(
      /"2026-10-15-no-sources\.md": sources must contain at least one URL/,
    );
  });

  it('validates the real content/news folder', async () => {
    await expect(loadNewsFromDirectory(contentDir)).resolves.toBeInstanceOf(Array);
  });
});
