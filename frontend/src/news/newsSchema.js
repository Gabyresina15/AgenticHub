import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

export const NEWS_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be an ISO date (YYYY-MM-DD)')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'is not a real calendar date');

const httpUrl = z.url({ protocol: /^https?$/, error: 'must be an http(s) URL' });

export const newsFrontmatterSchema = z.strictObject({
  title: z.string().trim().min(1, 'is required'),
  date: isoDate,
  summary: z.string().trim().min(1, 'is required'),
  sources: z.array(httpUrl).min(1, 'must contain at least one URL'),
  tags: z.array(z.string().trim().min(1, 'tags cannot be empty strings')).default([]),
});

export class NewsValidationError extends Error {
  constructor(fileName, message) {
    super(`[news] Invalid article "${fileName}": ${message}`);
    this.name = 'NewsValidationError';
    this.fileName = fileName;
  }
}

function formatIssues(error) {
  return error.issues
    .map((issue) => `${issue.path.length ? issue.path.join('.') : '(root)'} ${issue.message}`)
    .join('; ');
}

/**
 * Parses and validates a single news Markdown file.
 * YAML is parsed with the core schema so dates stay as strings (no implicit Date coercion).
 */
export function parseNewsFile(fileName, raw) {
  const nameMatch = NEWS_FILENAME_PATTERN.exec(fileName);
  if (!nameMatch) {
    throw new NewsValidationError(
      fileName,
      'file name must follow "YYYY-MM-DD-slug.md" (slug: lowercase ASCII kebab-case)',
    );
  }
  const [, fileDate, slug] = nameMatch;

  const fmMatch = FRONTMATTER_PATTERN.exec(raw.replace(/^\uFEFF/, ''));
  if (!fmMatch) {
    throw new NewsValidationError(fileName, 'missing YAML frontmatter delimited by "---" lines');
  }
  const [, yamlSource, body] = fmMatch;

  let data;
  try {
    data = parseYaml(yamlSource, { schema: 'core', prettyErrors: true });
  } catch (error) {
    throw new NewsValidationError(fileName, `malformed YAML frontmatter: ${error.message}`);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new NewsValidationError(fileName, 'frontmatter must be a YAML mapping');
  }

  const result = newsFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new NewsValidationError(fileName, formatIssues(result.error));
  }
  if (result.data.date !== fileDate) {
    throw new NewsValidationError(
      fileName,
      `date in file name (${fileDate}) does not match frontmatter date (${result.data.date})`,
    );
  }

  return { slug, ...result.data, content: body.trim() };
}

export function sortNewsByDateDesc(articles) {
  return [...articles].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

/** @param {{ fileName: string, raw: string }[]} files */
export function buildNewsCollection(files) {
  const articles = files.map(({ fileName, raw }) => parseNewsFile(fileName, raw));
  const seen = new Map();
  for (const article of articles) {
    const previous = seen.get(article.slug);
    if (previous) {
      throw new NewsValidationError(
        `${article.date}-${article.slug}.md`,
        `duplicate slug "${article.slug}" (also used by ${previous.date}-${previous.slug}.md)`,
      );
    }
    seen.set(article.slug, article);
  }
  return sortNewsByDateDesc(articles);
}
