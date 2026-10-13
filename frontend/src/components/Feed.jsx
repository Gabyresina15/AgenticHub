import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Feed() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.data || [];
        setPosts(fetched);
        if (id) {
          const found = fetched.findIndex((post) => post._id === id);
          if (found >= 0) setIndex(found);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold">Cargando...</div>;
  if (!posts.length) return <div className="text-center mt-20 text-slate-400 font-bold">Todavía no hay novedades.</div>;

  const post = posts[index];

  return (
    <div className="-mx-8 -mt-8 h-[calc(100vh-4.5rem)] p-4 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
      <aside className="bg-[#242424] p-5 rounded-2xl border border-slate-700/50 self-start w-full max-h-full overflow-y-auto">
        <h2 className="text-lg font-black text-slate-100">Explorar</h2>
        <p className="text-xs text-slate-400 mt-1">Novedades y avances</p>
        <div className="space-y-2 mt-4">
          {posts.map((item, itemIndex) => (
            <button
              key={item._id}
              onClick={() => setIndex(itemIndex)}
              className={`w-full text-left p-3 rounded-xl ${itemIndex === index ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-[#1a1a1a] text-slate-300 border border-slate-800'}`}
            >
              <span className="text-[11px] uppercase tracking-wider text-slate-500">{item.tag}</span>
              <span className="block font-medium truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <article className="bg-[#242424] rounded-2xl border border-slate-700/50 flex flex-col min-h-0 overflow-hidden">
        <header className="px-8 py-6 border-b border-slate-700/50 shrink-0">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{post.tag}</span>
          <h1 className="text-3xl font-black text-slate-100 mt-2">{post.title}</h1>
          {post.summary && <p className="text-slate-400 mt-3">{post.summary}</p>}
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-6 text-slate-300 whitespace-pre-line leading-relaxed">
          {post.body}
        </div>
      </article>
    </div>
  );
}
