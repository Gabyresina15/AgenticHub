import { useState } from 'react';

export default function InteractiveChallenge({ challenge, onSolve }) {
  const [code, setCode] = useState(challenge.initialCode || '');
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const language = challenge.language || 'javascript';

  const handleRunCode = async () => {
    setStatus('checking');
    setFeedback('');
    try {
      if (!challenge.tests?.length) {
        const ok = challenge.solutionKey && code.includes(challenge.solutionKey);
        setStatus(ok ? 'success' : 'error');
        setFeedback(ok ? challenge.successMessage : challenge.errorMessage || 'Faltan tests ejecutables en este reto.');
        if (ok && onSolve) onSolve();
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
      setStatus(passed ? 'success' : 'error');
      setFeedback(passed
        ? challenge.successMessage
        : first?.stderr || payload.data?.message || challenge.errorMessage || 'La salida no coincide con el test.');
      if (passed && onSolve) onSolve();
    } catch (error) {
      setStatus('error');
      setFeedback(error.message);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-slate-700 rounded-2xl overflow-hidden shadow-xl my-8">
      <div className="bg-[#242424] px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <span className="text-xs font-mono text-slate-400">{language}</span>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Desafio: {challenge.title}</h3>
          <p className="text-slate-300 text-sm">{challenge.description}</p>
        </div>
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          spellCheck="false"
          className="w-full h-48 bg-[#0d0d0d] text-emerald-400 font-mono text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            {status === 'success' && <span className="text-emerald-400 font-bold text-sm">{feedback}</span>}
            {status === 'error' && <span className="text-rose-400 font-bold text-sm">{feedback}</span>}
            {status === 'checking' && <span className="text-amber-400 font-bold text-sm">Compilando y ejecutando...</span>}
          </div>
          <button
            onClick={handleRunCode}
            disabled={status === 'success' || status === 'checking'}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
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
