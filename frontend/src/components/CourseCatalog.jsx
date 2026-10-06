import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CourseCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    // Traemos todos los cursos
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.data || []);
        setLoading(false);
      })
      .catch(err => console.error(err));

    // Si hay usuario logueado, traemos su perfil para saber en qué está inscripto
    if (user) {
      fetch('/api/users/profile')
        .then(res => res.json())
        .then(data => {
          if (data.enrolledCourses) {
            setEnrolledIds(data.enrolledCourses.map(c => typeof c === 'object' ? c._id : c));
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await fetch('/api/users/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      if (res.ok) {
        navigate('/dashboard'); // Si se inscribe joya, lo mandamos a su panel
      }
    } catch (error) {
      console.error("Error al inscribirse:", error);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold text-slate-400 text-xl">Cargando catálogo de cursos... 🚀</div>;

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-100">
          Catálogo de <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400">Cursos</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Programas completos diseñados para llevarte desde las bases hasta el dominio total. Elegí tu próximo desafío.
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="text-center p-12 bg-[#242424] rounded-2xl border border-slate-700">
          <p className="text-slate-400">Próximamente publicaremos nuevos cursos completos. ¡Mantenete atento!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => {
            const isEnrolled = enrolledIds.includes(course._id);

            return (
              <div key={course._id} className="bg-[#1a1a1a] p-8 rounded-2xl border border-slate-700/50 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/20">
                      {course.level || 'Todos los niveles'}
                    </span>
                    <span className="text-slate-500 text-sm font-bold">
                      {course.lessons?.length || 0} Clases
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-100 mb-3">{course.title}</h2>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-4 leading-relaxed">
                    {course.description || 'Sumate a este curso para dominar nuevas habilidades tecnológicas.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800 mt-auto">
                  {isEnrolled ? (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-emerald-600/20 text-emerald-400 font-bold py-3 rounded-xl border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                    >
                      Continuar Aprendiendo →
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(course._id)}
                      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      {user ? 'Inscribirme ahora' : 'Ingresar para Inscribirse'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}