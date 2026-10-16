import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildNewsCollection } from '../src/news/newsSchema.js';

const VIRTUAL_ID = 'virtual:news';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

export async function loadNewsFromDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map((entry) => entry.name)
    .sort();
  const files = await Promise.all(
    fileNames.map(async (fileName) => ({
      fileName,
      raw: await readFile(path.join(directory, fileName), 'utf8'),
    })),
  );
  return buildNewsCollection(files);
}

/**
 * Exposes validated articles from `contentDir` as the `virtual:news` module.
 * Validation runs at build/dev time, so an invalid file fails `vite build`.
 */
export default function newsPlugin({ contentDir }) {
  const directory = path.resolve(contentDir);
  return {
    name: 'agentichub-news',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      this.addWatchFile(directory);
      const articles = await loadNewsFromDirectory(directory);
      return `export default ${JSON.stringify(articles)};`;
    },
    configureServer(server) {
      server.watcher.add(directory);
      const reload = (file) => {
        if (path.dirname(path.resolve(file)) !== directory) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },
  };
}
