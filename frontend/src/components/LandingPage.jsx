import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [path, setPath] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses/paths').then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/posts').then((res) => res.json()).catch(() => ({ data: [] })),
    ]).then(([pathData, postData]) => {
      setPath((pathData.data || [])[0] || null);
      setPosts((postData.data || []).slice(0, 2));
    });
  }, []);

  return (
    <div className="text-slate-200">
      <section className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Ruta de lógica</p>
        <h1 className="text-5xl md:text-6xl font-black text-slate-100 leading-tight">
          Aprendé a programar resolviendo funciones.
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Tres cursos, en orden. Cada lección explica con un ejemplo y te deja el código incompleto. Lo corrés, y si pasa los tests, seguís.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to={path ? `/path/${path._id}` : '/courses'} className="px-8 py-4 rounded-xl font-bold bg-indigo-600 text-white">
            Empezar la ruta
          </Link>
          <Link to="/courses" className="px-8 py-4 rounded-xl font-bold bg-[#242424] text-slate-300 border border-slate-700">
            Ver cursos
          </Link>
        </div>
      </section>

      {path && (
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <article className="bg-[#242424] rounded-2xl border border-slate-700/50 p-8">
            <h2 className="text-2xl font-black text-slate-100">{path.title}</h2>
            <p className="text-slate-400 mt-2">{path.description}</p>
            <ol className="mt-6 space-y-3">
              {(path.courses || []).map((course, index) => (
                <li key={course._id}>
                  <Link to={`/course/${course._id}`} className="flex items-center justify-between bg-[#1a1a1a] border border-slate-800 rounded-xl px-4 py-3">
                    <span className="text-slate-100">{index + 1}. {course.title}</span>
                    <span className="text-xs text-slate-500">{course.lessons?.length || 0} lecciones</span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        </section>
      )}

      {posts.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-100">Novedades</h2>
            <Link to="/feed" className="text-sm text-indigo-300">Ver todas</Link>
          </div>
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post._id} to={`/feed/${post._id}`} className="bg-[#242424] border border-slate-700/50 rounded-2xl p-5">
                <span className="text-xs uppercase tracking-wider text-slate-500">{post.tag}</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{post.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{post.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
