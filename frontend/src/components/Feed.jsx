import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InteractiveChallenge from './InteractiveChallenge';

export default function Feed() {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [solved, setSolved] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/api/lessons').then((res) => res.json()),
      fetch('/api/users/profile', { credentials: 'include' }).then((res) => res.json()).catch(() => null),
    ])
      .then(([lessonData, profile]) => {
        const fetched = lessonData.data || [];
        setLessons(fetched);
        if (id) {
          const found = fetched.findIndex((lesson) => lesson._id === id);
          if (found >= 0) setIndex(found);
        }
        if (profile?.completedLessons) setCompletedLessons(profile.completedLessons);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setSolved(false);
  }, [index]);

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold">Cargando...</div>;
  if (!lessons.length) return <div className="text-center mt-20 text-slate-400 font-bold">No hay clases publicadas todavía.</div>;

  const lesson = lessons[index];
  const completed = completedLessons.some((item) => String(item._id || item) === String(lesson._id));
  const canAdvance = !lesson.challenge || solved || completed;
  const selected = answers[lesson._id];

  const next = () => {
    if (index < lessons.length - 1) setIndex((prev) => prev + 1);
  };

  return (
    <div className="-mx-8 -mt-8 h-[calc(100vh-4.5rem)] p-4 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.15fr)] gap-4">
      <aside className="bg-[#242424] p-5 rounded-2xl border border-slate-700/50 self-start w-full max-h-full overflow-y-auto">
        <h2 className="text-lg font-black text-slate-100">Explorar</h2>
        <p className="text-xs text-slate-400 mt-1">{lessons.length} lecciones publicadas</p>
        <div className="space-y-2 mt-4">
          {lessons.map((item, itemIndex) => {
            const active = itemIndex === index;
            const done = completedLessons.some((entry) => String(entry._id || entry) === String(item._id));
            return (
              <button
                key={item._id}
                onClick={() => setIndex(itemIndex)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium flex items-center justify-between ${active ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-[#1a1a1a] text-slate-300 border border-slate-800'}`}
              >
                <span className="truncate pr-2">{itemIndex + 1}. {item.title}</span>
                <span>{done ? '✅' : '⚪'}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="bg-[#242424] rounded-2xl border border-slate-700/50 flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-start gap-4 shrink-0">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Lección {index + 1} de {lessons.length}</span>
            <h1 className="text-3xl font-black text-slate-100 mt-1">{lesson.title}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
            {completed ? 'Completada ✓' : 'En progreso'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-slate-300">
          <div className="whitespace-pre-line leading-relaxed">{lesson.contentMarkdown || 'Sin contenido.'}</div>
          {lesson.teaches && <div><h2 className="text-slate-100 font-bold mb-2">Qué te enseña</h2><p>{lesson.teaches}</p></div>}
          {lesson.howToSolve && <div><h2 className="text-slate-100 font-bold mb-2">Cómo se resuelve</h2><p>{lesson.howToSolve}</p></div>}
          {lesson.quizData?.question && (
            <div className="space-y-3">
              <h2 className="text-slate-100 font-bold">{lesson.quizData.question}</h2>
              {lesson.quizData.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  disabled={selected !== undefined}
                  onClick={() => setAnswers((prev) => ({ ...prev, [lesson._id]: optionIndex }))}
                  className="w-full text-left p-3 rounded-lg border border-slate-700 text-slate-200"
                >
                  {option}
                </button>
              ))}
              {selected !== undefined && (
                <p className={selected === lesson.quizData.correctAnswerIndex ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {selected === lesson.quizData.correctAnswerIndex ? 'Correcto.' : 'Incorrecto.'}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-700/50 flex justify-between shrink-0">
          <button onClick={() => setIndex((prev) => Math.max(0, prev - 1))} disabled={index === 0} className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 disabled:opacity-40 text-sm">← Anterior</button>
          <button onClick={next} disabled={!canAdvance || index === lessons.length - 1} className={`px-6 py-2.5 rounded-xl font-bold text-sm ${canAdvance && index < lessons.length - 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
            Siguiente Lección →
          </button>
        </div>
      </section>

      <section className="min-h-0">
        {lesson.challenge ? (
          <InteractiveChallenge
            key={lesson._id}
            challenge={lesson.challenge}
            lessonId={lesson._id}
            fill
            onSolve={() => {
              setSolved(true);
              setCompletedLessons((prev) => prev.some((item) => String(item) === String(lesson._id)) ? prev : [...prev, lesson._id]);
            }}
          />
        ) : (
          <div className="h-full rounded-2xl border border-slate-700 bg-[#161616] p-6 text-slate-400">Esta lección no tiene reto.</div>
        )}
      </section>
    </div>
  );
}
