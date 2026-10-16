import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getNewsBySlug } from '../../news/newsRepository';
import { formatNewsDate } from '../../news/formatDate';
import NewsTags from './NewsTags';

const markdownComponents = {
  a: ({ href, title, children }) => (
    <a href={href} title={title} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export default function NewsDetail() {
  const { slug } = useParams();
  const article = getNewsBySlug(slug);

  if (!article) {
    return (
      <section className="max-w-3xl mx-auto text-center space-y-4" role="alert">
        <h1 className="text-3xl font-black text-slate-100">404 · Noticia no encontrada</h1>
        <p className="text-slate-400">No existe ninguna noticia con el identificador “{slug}”.</p>
        <Link to="/news" className="text-indigo-400 hover:underline font-bold">← Volver a noticias</Link>
      </section>
    );
  }

  return (
    <article className="max-w-3xl mx-auto space-y-6">
      <Link to="/news" className="text-indigo-400 hover:underline font-bold">← Volver a noticias</Link>
      <header className="space-y-3">
        <time dateTime={article.date} className="text-sm text-slate-400">{formatNewsDate(article.date)}</time>
        <h1 className="text-3xl font-black text-slate-100">{article.title}</h1>
        <p className="text-lg text-slate-300">{article.summary}</p>
        <NewsTags tags={article.tags} />
      </header>
      {/* react-markdown escapes raw HTML by default (no rehype-raw), so content cannot inject markup. */}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown components={markdownComponents}>{article.content}</ReactMarkdown>
      </div>
      <footer className="border-t border-slate-700/50 pt-4">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Fuentes</h2>
        <ul className="list-disc pl-6 space-y-1">
          {article.sources.map((source) => (
            <li key={source}>
              <a href={source} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">
                {source}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
