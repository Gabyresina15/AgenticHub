import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LEVELS = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];
const LANGUAGES = ['Todos', 'javascript', 'python', 'general'];

export default function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('Todos');
  const [language, setLanguage] = useState('Todos');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((res) => res.json()),
      fetch('/api/courses/paths').then((res) => res.json()).catch(() => ({ data: [] })),
    ]).then(([courseData, pathData]) => {
      setCourses(courseData.data || []);
      setPaths(pathData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => courses.filter((course) => {
    const text = `${course.title} ${course.description || ''}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesLevel = level === 'Todos' || course.level === level;
    const matchesLanguage = language === 'Todos' || (course.language || 'general') === language;
    return matchesQuery && matchesLevel && matchesLanguage;
  }), [courses, query, level, language]);

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-slate-100">Cursos</h1>
        <p className="text-slate-400">Filtrá por lenguaje y dificultad. Las rutas son el orden, no otro catálogo.</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar curso"
          className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-700 bg-[#242424] text-slate-200"
        />
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((item) => (
            <button key={item} onClick={() => setLevel(item)} className={`px-3 py-1.5 rounded-full text-sm border ${level === item ? 'border-indigo-500 text-indigo-300' : 'border-slate-700 text-slate-400'}`}>{item}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((item) => (
            <button key={item} onClick={() => setLanguage(item)} className={`px-3 py-1.5 rounded-full text-sm border ${language === item ? 'border-emerald-500 text-emerald-300' : 'border-slate-700 text-slate-400'}`}>{item}</button>
          ))}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-100">Rutas</h2>
        {paths.length === 0 && <p className="text-slate-500">Todavía no hay rutas. Corré el seed de práctica.</p>}
        {paths.map((path) => (
          <article key={path._id} className="bg-[#242424] rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100">{path.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{path.description}</p>
              </div>
              <span className="text-xs uppercase tracking-wider text-indigo-300">{path.level}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(path.courses || []).map((course, index) => (
                <button key={course._id} onClick={() => navigate(`/course/${course._id}`)} className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-slate-800 text-slate-200 text-sm">
                  {index + 1}. {course.title}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <button key={course._id} onClick={() => navigate(`/course/${course._id}`)} className="text-left bg-[#242424] rounded-2xl p-6 border border-slate-700/50">
            <div className="flex gap-2 text-xs uppercase tracking-wider text-slate-500">
              <span>{course.level || 'General'}</span>
              <span>{course.language || 'general'}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-3">{course.title}</h2>
            <p className="text-slate-400 text-sm mt-2 line-clamp-3">{course.description}</p>
            <p className="text-slate-500 text-sm mt-4">{course.lessons?.length || 0} lecciones</p>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-slate-500">Ningún curso con esos filtros.</p>}
      </section>
    </div>
  );
}
