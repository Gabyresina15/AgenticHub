import { Link } from 'react-router-dom';
import { getAllNews } from '../../news/newsRepository';
import { formatNewsDate } from '../../news/formatDate';
import NewsTags from './NewsTags';

export default function NewsList() {
  const articles = getAllNews();

  return (
    <section className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-slate-100 mb-8">Noticias de IA</h1>
      {articles.length === 0 ? (
        <p className="text-slate-400">Todavía no hay noticias publicadas.</p>
      ) : (
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <article className="bg-[#242424] border border-slate-700/50 rounded-xl p-6 space-y-3">
                <time dateTime={article.date} className="text-sm text-slate-400">
                  {formatNewsDate(article.date)}
                </time>
                <h2 className="text-xl font-bold">
                  <Link to={`/news/${article.slug}`} className="text-slate-100 hover:text-indigo-400 transition-colors">
                    {article.title}
                  </Link>
                </h2>
                <p className="text-slate-300">{article.summary}</p>
                <NewsTags tags={article.tags} />
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
