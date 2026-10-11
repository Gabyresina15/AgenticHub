import { useState } from 'react';

export default function InteractiveChallenge({ challenge, lessonId, onSolve, fill = false }) {
  const [code, setCode] = useState(challenge.initialCode || '');
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const language = challenge.language || 'javascript';

  const persistCompletion = async () => {
    if (!lessonId) {
      setStatus('success');
      setFeedback(challenge.successMessage || 'Paso los tests.');
      if (onSolve) onSolve();
      return;
    }
    const res = await fetch('/api/users/complete-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lessonId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus('error');
      setFeedback(res.status === 401
        ? 'Pasaste los tests, pero tenés que iniciar sesión para guardar el progreso.'
        : data.error || 'Pasaste los tests, pero no se pudo guardar.');
      return;
    }
    setStatus('success');
    setFeedback(challenge.successMessage || 'Lección completada.');
    if (onSolve) onSolve(data.completedLessons);
  };

  const handleRunCode = async () => {
    setStatus('checking');
    setFeedback('');
    try {
      if (!challenge.tests?.length) {
        const ok = challenge.solutionKey && code.includes(challenge.solutionKey);
        if (!ok) {
          setStatus('error');
          setFeedback(challenge.errorMessage || 'Faltan tests ejecutables en este reto.');
          return;
        }
        await persistCompletion();
        return;
      }
      const res = await fetch('/api/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, tests: challenge.tests }),
      });
      const payload = await res.json();
      const passed = payload.data?.passed;
      const first = payload.data?.results?.[0];
      const detail = first
        ? `Tu funcion devolvio ${JSON.stringify(first.returned)} | El test esperaba ${JSON.stringify(first.expected)}`
        : "";
      if (!passed) {
        setStatus('error');
        setFeedback(detail || first?.stderr || payload.data?.message || challenge.errorMessage || 'La salida no coincide con el test.');
        return;
      }
      await persistCompletion();
    } catch (error) {
      setStatus('error');
      setFeedback(error.message);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={`bg-[#161616] border border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-0 ${fill ? 'h-full' : 'my-8'}`}>
      <div className="bg-[#242424] px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <span className="text-xs font-mono text-slate-400">{language}</span>
      </div>
      <div className="p-5 flex flex-col gap-4 min-h-0 flex-1">
        <div className="shrink-0">
          <h3 className="text-lg font-bold text-indigo-400 mb-1">Desafio: {challenge.title}</h3>
          <p className="text-slate-300 text-sm">{challenge.description}</p>
        </div>
        <div className="flex-1 min-h-0 flex rounded-xl border border-slate-800 bg-[#0d0d0d] overflow-hidden">
          <div className="select-none text-slate-600 font-mono text-sm py-4 pl-3 pr-2 text-right overflow-hidden">
            {lines.map((_, index) => <div key={index} className="leading-relaxed">{index + 1}</div>)}
          </div>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            spellCheck="false"
            className="flex-1 min-h-0 bg-transparent text-emerald-400 font-mono text-sm py-4 pr-4 focus:outline-none resize-none leading-relaxed"
          />
        </div>
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            {status === 'success' && <span className="text-emerald-400 font-bold text-sm">{feedback}</span>}
            {status === 'error' && <span className="text-rose-400 font-bold text-sm">{feedback}</span>}
            {status === 'checking' && <span className="text-amber-400 font-bold text-sm">Compilando y ejecutando...</span>}
          </div>
          <button
            onClick={handleRunCode}
            disabled={status === 'success' || status === 'checking'}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm shrink-0 ${
              status === 'success'
                ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {status === 'success' ? 'Completado' : 'Ejecutar'}
          </button>
        </div>
      </div>
    </div>
  );
}
