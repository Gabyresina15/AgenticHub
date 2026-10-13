import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PathPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/paths/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPath(data.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-slate-400">Cargando ruta...</div>;
  if (!path) return <div className="text-center mt-20 text-slate-400">Ruta no encontrada.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <button onClick={() => navigate('/courses')} className="text-sm text-indigo-400">← Volver a cursos</button>
      <header>
        <span className="text-xs uppercase tracking-wider text-indigo-300">{path.level}</span>
        <h1 className="text-4xl font-black text-slate-100 mt-2">{path.title}</h1>
        <p className="text-slate-400 mt-2">{path.description}</p>
      </header>
      <ol className="space-y-3">
        {(path.courses || []).map((course, index) => (
          <li key={course._id}>
            <button onClick={() => navigate(`/course/${course._id}`)} className="w-full text-left bg-[#242424] border border-slate-700/50 rounded-2xl p-5 hover:border-slate-500">
              <span className="text-xs text-slate-500">Curso {index + 1}</span>
              <h2 className="text-xl font-bold text-slate-100">{course.title}</h2>
              <p className="text-slate-400 text-sm mt-1">{course.description}</p>
              <p className="text-slate-500 text-sm mt-3">{course.lessons?.length || 0} lecciones</p>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
