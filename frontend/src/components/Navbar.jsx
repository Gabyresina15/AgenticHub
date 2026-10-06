import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login'); 
  };

  return (
    <nav className="bg-[#242424] border-b border-slate-700/50 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link to="/" className="text-2xl font-black tracking-tight text-indigo-400">
        Agentic<span className="text-slate-100">Hub</span>
      </Link>
      
      <div className="space-x-6 font-medium flex items-center">
        <Link to="/courses" className="text-slate-300 hover:text-indigo-400 font-bold transition-colors">📚 Cursos</Link>
        <Link to="/feed" className="text-slate-300 hover:text-indigo-400 font-bold transition-colors">Explorar 📰</Link>

        {user ? (
          <div className="relative group cursor-pointer ml-4">
            <span className="text-slate-200 font-bold bg-slate-700/50 px-4 py-2 rounded-lg flex items-center gap-2">
              👤 Mi Perfil
            </span>

            {/* El puente invisible con z-50 para que no quede por debajo del contenido */}
            <div className="absolute right-0 top-full pt-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-50">
              <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-xl flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 text-sm text-slate-400">
                  Hola, {user.name}
                </div>
                
                <Link to="/dashboard" className="px-4 py-3 text-sm text-slate-300 hover:bg-[#242424] hover:text-indigo-400 font-bold border-b border-slate-700/50">
                  📊 Mi Dashboard
                </Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-3 text-sm text-indigo-400 hover:bg-[#242424] font-bold border-b border-slate-700/50">
                    ⚙️ Panel Admin
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-3 text-sm text-rose-400 hover:bg-[#242424] text-left font-bold w-full transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-600/40 transition-colors ml-4">
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}