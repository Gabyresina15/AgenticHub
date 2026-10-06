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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#242424] p-8 rounded-2xl shadow-lg border border-slate-700/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-100">
            {isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Ingresá para continuar aprendiendo.' : 'Unite y seguí las lecciones.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-medium text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Tu nombre"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        {googleClientId && (
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError('Login de Google fallido')}
              useOneTap={false}
              text="continue_with"
            />
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-sm font-medium text-slate-400 hover:text-indigo-400"
          >
            {isLogin ? '¿No tenés cuenta? Registrate acá' : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
