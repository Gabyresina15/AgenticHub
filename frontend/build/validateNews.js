import { fileURLToPath } from 'node:url';
import { loadNewsFromDirectory } from './newsPlugin.js';

const contentDir = fileURLToPath(new URL('../../content/news', import.meta.url));

try {
  const articles = await loadNewsFromDirectory(contentDir);
  console.log(`[news] ${articles.length} article(s) valid in ${contentDir}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
