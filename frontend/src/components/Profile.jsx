import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        setProfileData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  
  if (loading) {
    return <div className="text-center text-slate-400 mt-20 font-bold">Cargando tu perfil...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Encabezado del Perfil */}
      <div className="bg-[#242424] p-8 rounded-2xl border border-slate-700/50 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-slate-100">
            Hola, <span className="text-indigo-400">{profileData.name}</span> ✌️
          </h1>
          <p className="text-slate-400 mt-2">Acá tenés el resumen de tu aprendizaje.</p>
        </div>
        <div className="h-20 w-20 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center text-3xl font-bold border border-indigo-500/30">
          {profileData.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#242424] p-6 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-sm font-medium mb-1">Cursos Activos</div>
          <div className="text-4xl font-black text-slate-100">{profileData.enrolledCourses?.length || 0}</div>
        </div>
        <div className="bg-[#242424] p-6 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-sm font-medium mb-1">Lecciones Completadas</div>
          <div className="text-4xl font-black text-emerald-400">{profileData.completedLessons?.length || 0}</div>
        </div>
        <div className="bg-[#242424] p-6 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-sm font-medium mb-1">Rol en plataforma</div>
          <div className="text-xl font-black text-orange-400 mt-2 capitalize">{profileData.role} 🚀</div>
        </div>
      </div>

      {/* Cursos en Progreso - Renderizado Dinámico */}
      <div>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          🚀 Tus cursos
        </h2>
        
        {profileData.enrolledCourses?.length === 0 ? (
          <div className="bg-[#242424] p-8 rounded-xl border border-slate-700/50 text-center">
            <p className="text-slate-400 mb-4">Todavía no te inscribiste a ningún curso.</p>
            <Link to="/courses" className="text-indigo-400 font-bold hover:text-indigo-300">
              Explorar el catálogo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData.enrolledCourses.map((course) => (
              <Link 
                to={`/course/${course._id}`} 
                key={course._id} 
                className="bg-[#242424] p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{course.description}</p>
                </div>
                
                {/* Barra de progreso real */}
                <div>
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Progreso</span>
                    <span className="text-indigo-400 font-bold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}