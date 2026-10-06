import { useState } from 'react';

export default function InteractiveChallenge({ challenge, onSolve }) {
  const [code, setCode] = useState(challenge.initialCode);
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [feedback, setFeedback] = useState('');

  const handleRunCode = () => {
    setStatus('checking');
    
    // Simulamos un delay de "procesamiento" en el servidor
    setTimeout(() => {
      // Validación básica: comprobamos si el código escrito incluye la palabra clave esperada
      if (code.includes(challenge.solutionKey)) {
        setStatus('success');
        setFeedback(challenge.successMessage);
        if (onSolve) onSolve(); // Avisamos al componente padre que lo resolvió
      } else {
        setStatus('error');
        setFeedback(challenge.errorMessage || 'Mmm, revisá bien. Parece que la lógica no está completa.');
      }
    }, 800);
  };

  return (
    <div className="bg-[#1a1a1a] border border-slate-700 rounded-2xl overflow-hidden shadow-xl my-8">
      {/* Cabecera tipo consola */}
      <div className="bg-[#242424] px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <span className="text-xs font-mono text-slate-400">reto_interactivo.js</span>
      </div>

      <div className="p-6 space-y-4">
        {/* Instrucciones */}
        <div>
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Desafío: {challenge.title}</h3>
          <p className="text-slate-300 text-sm">{challenge.description}</p>
        </div>

        {/* Editor (Textarea simulado) */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (status !== 'idle') setStatus('idle'); // Resetea el estado si vuelve a tipear
            }}
            spellCheck="false"
            className="w-full h-48 bg-[#0d0d0d] text-emerald-400 font-mono text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Botonera y Feedback */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            {status === 'success' && <span className="text-emerald-400 font-bold text-sm animate-pulse">{feedback}</span>}
            {status === 'error' && <span className="text-rose-400 font-bold text-sm">{feedback}</span>}
            {status === 'checking' && <span className="text-amber-400 font-bold text-sm">Ejecutando código... ⚙️</span>}
          </div>

          <button
            onClick={handleRunCode}
            disabled={status === 'success' || status === 'checking'}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              status === 'success' 
                ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
            }`}
          >
            {status === 'success' ? 'Completado ✔️' : 'Ejecutar Código 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}