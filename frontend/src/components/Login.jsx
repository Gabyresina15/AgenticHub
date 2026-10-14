import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData, role: 'student' };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error en la autenticación');

      if (isLogin) {
        setUser(data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/courses');
      } else {
        setIsLogin(true);
        setSuccess('Registro exitoso. Ya podés iniciar sesión.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google rechazó el ingreso');
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/courses');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-[#242424] rounded-3xl border border-slate-700/50 overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#1a1a1a] border-r border-slate-800">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">AgenticHub</p>
          <div>
            <h1 className="text-4xl font-black text-slate-100 leading-tight">
              El
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400"> agente </span>
              arma la lección.
            </h1>
            <p className="text-slate-400 mt-4">Vos completás la función y la corrés.</p>
          </div>
          <p className="text-sm text-slate-500">El progreso queda guardado.</p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-black text-slate-100">
            {isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Entrá para seguir donde lo dejaste.' : 'El registro es gratis.'}
          </p>

          {error && <div className="mt-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">{error}</div>}
          {success && <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                placeholder="Nombre"
              />
            )}
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#121212] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Email"
            />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#121212] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Contraseña"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </form>

          {googleClientId && (
            <div className="mt-5">
              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500 mb-4">
                <span className="flex-1 h-px bg-slate-800" />
                o
                <span className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setError('Login de Google fallido')}
                  useOneTap={false}
                  text="continue_with"
                  theme="filled_black"
                  shape="pill"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="mt-6 w-full text-sm text-slate-400 hover:text-indigo-300"
          >
            {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

