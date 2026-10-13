import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  { title: 'Leés el ejemplo', text: 'La lección muestra el caso resuelto con otros números. No es solo la consigna.' },
  { title: 'Completás la función', text: 'El editor abre con la firma vacía. El código de la solución no está.' },
  { title: 'Corrés los tests', text: 'Si el return coincide, la lección queda hecha y podés seguir.' },
];

export default function LandingPage() {
  const [path, setPath] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses/paths').then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/posts').then((res) => res.json()).catch(() => ({ data: [] })),
    ]).then(([pathData, postData]) => {
      setPath((pathData.data || [])[0] || null);
      setPosts((postData.data || []).slice(0, 3));
    });
  }, []);

  return (
    <div className="text-slate-200">
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Ruta de lógica</p>
        <h1 className="mt-4 text-5xl md:text-7xl font-black tracking-tight text-slate-100 leading-tight">
          Aprendé a programar
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400">resolviendo funciones.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          {(path?.courses?.length || 3)} tramos, en orden. Cada lección explica con un ejemplo y te deja el código incompleto.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link to={path ? `/path/${path._id}` : '/courses'} className="px-8 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            Empezar la ruta
          </Link>
          <Link to="/courses" className="px-8 py-4 rounded-xl font-bold bg-[#242424] text-slate-300 border border-slate-700">
            Ver cursos
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <article key={step.title} className="bg-[#242424] border border-slate-700/50 rounded-2xl p-6 text-left">
            <span className="text-xs font-bold text-indigo-300">0{index + 1}</span>
            <h2 className="text-xl font-black text-slate-100 mt-3">{step.title}</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">{step.text}</p>
          </article>
        ))}
      </section>

      {path && (
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="bg-[#242424] border border-slate-700/50 rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-300">{path.level}</p>
                <h2 className="text-3xl font-black text-slate-100 mt-2">{path.title}</h2>
                <p className="text-slate-400 mt-2 max-w-xl">{path.description}</p>
              </div>
              <Link to={`/path/${path._id}`} className="text-sm font-bold text-indigo-300">Abrir ruta →</Link>
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {(path.courses || []).map((course, index) => (
                <Link key={course._id} to={`/course/${course._id}`} className="bg-[#1a1a1a] border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40">
                  <span className="text-3xl font-black text-slate-700">0{index + 1}</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-4">{course.title}</h3>
                  <p className="text-slate-500 text-sm mt-2">{course.lessons?.length || 0} lecciones</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-100">Novedades</h2>
            <Link to="/feed" className="text-sm text-indigo-300">Ver todas</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link key={post._id} to={`/feed/${post._id}`} className="bg-[#242424] border border-slate-700/50 rounded-2xl p-5 hover:border-slate-500">
                <span className="text-xs uppercase tracking-wider text-emerald-300">{post.tag}</span>
                <h3 className="text-lg font-bold text-slate-100 mt-2">{post.title}</h3>
                <p className="text-slate-400 text-sm mt-2 line-clamp-3">{post.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
