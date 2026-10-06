import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cargamos los cursos y los datos del usuario en paralelo para saber a cuáles está inscripto
    Promise.all([
      fetch('/api/courses').then(res => res.json()),
      fetch('/api/users/profile').then(res => res.json()).catch(() => null)
    ])
      .then(([coursesData, profileData]) => {
        setCourses(coursesData.data || coursesData || []);
        if (profileData && profileData.enrolledCourses) {
          // Guardamos un array con los IDs de los cursos a los que ya está inscripto
          const enrolledIds = profileData.enrolledCourses.map(c => c._id || c);
          setEnrolledCourses(enrolledIds);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar datos:", err);
        setLoading(false);
      });
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const res = await fetch('/api/users/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (res.ok) {
        setEnrolledCourses(prev => [...prev, courseId]);
      }
    } catch (err) {
      console.error('Error en inscripción', err);
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-slate-300">Cargando niveles... ⏳</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-100 tracking-tight">Rutas de Aprendizaje 🚀</h1>
        <p className="text-lg text-slate-400">Elegí tu nivel y empezá a dominar las inteligencias artificiales.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => {
          const isAlreadyEnrolled = enrolledCourses.includes(course._id);
          const isThisEnrolling = enrollingId === course._id;

          return (
            <div key={course._id} className="bg-[#242424] rounded-2xl p-8 shadow-lg border border-slate-700/50 hover:border-indigo-500/50 transition-all flex flex-col h-full group">
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-wider rounded-full mb-4 border border-indigo-500/20">
                  Nivel {course.level || 'General'}
                </span>
                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">{course.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {course.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">
                    📚 {course.lessons?.length || 0} lecciones
                  </span>
                </div>

                {/* Botón de Inscribirse / Ir al Curso */}
                {isAlreadyEnrolled ? (
                  <button
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-bold hover:bg-emerald-600/40 transition-all text-center shadow-lg shadow-emerald-500/10"
                  >
                    📖 Ir al Reproductor 🚀
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={isThisEnrolling}
                    className="w-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 py-3 rounded-xl font-bold hover:bg-indigo-600/40 hover:text-indigo-300 transition-all text-center shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                  >
                    {isThisEnrolling ? 'Inscribiendo...' : '🚀 Inscribirme ahora'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}