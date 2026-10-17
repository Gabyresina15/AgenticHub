import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch('/api/users/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setForm({ name: data.name || '', email: data.email || '', password: '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, password: form.password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setUser((prev) => ({ ...prev, ...data.user }));
      setForm((prev) => ({ ...prev, password: '' }));
      setMessage('Perfil guardado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetProgress = async () => {
    setResetting(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users/reset-progress', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo borrar el progreso');
      setMessage('Progreso borrado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="text-center text-slate-400 mt-20 font-bold">Cargando tu perfil...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-indigo-300">← Volver al dashboard</Link>
        <h1 className="text-3xl font-black text-slate-100 mt-3">Tu perfil</h1>
        <p className="text-slate-400 mt-1">El mail no se cambia. El nombre sí.</p>
      </div>

      {message && <p className="text-emerald-300 text-sm">{message}</p>}
      {error && <p className="text-rose-300 text-sm">{error}</p>}

      <form onSubmit={save} className="bg-[#242424] border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-300">Nombre</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#121212] text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            value={form.email}
            disabled
            className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#1a1a1a] text-slate-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Nueva contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Dejala vacía para no cambiarla"
            className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#121212] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </label>
        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </form>

      <div className="bg-[#242424] border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100">Progreso</h2>
        <p className="text-slate-400 text-sm mt-1">Borra las lecciones completadas. Los cursos siguen inscriptos.</p>
        <button
          type="button"
          onClick={resetProgress}
          disabled={resetting}
          className="mt-4 text-sm font-bold text-rose-300 border border-rose-500/30 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {resetting ? 'Borrando...' : 'Borrar progreso'}
        </button>
      </div>
    </div>
  );
}
