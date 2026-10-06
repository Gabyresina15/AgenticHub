import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false); // NUEVO ESTADO
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(async (res) => {
        if (res.status === 401) {
          setUnauthorized(true);
          throw new Error('No autorizado');
        }
        return res.json();
      })
      .then(data => {
        setLesson(data.data || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // LA MAGIA: Si tiró 401, mostramos la tarjeta de bloqueo
  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-[#242424] border border-slate-700/50 rounded-2xl text-center shadow-lg">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-black text-slate-100 mb-2">Acceso Restringido</h2>
        <p className="text-slate-400 mb-8">Debés iniciar sesión para ver el contenido de esta lección y continuar tu progreso.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 py-3 rounded-xl font-bold hover:bg-indigo-600/40 transition-all"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-slate-300">Cargando contenido de la clase... ⏳</div>;
  if (!lesson) return <div className="text-center mt-20 text-xl text-rose-500">No se encontró la lección solicitada.</div>;

  const quiz = lesson.quizData;
  const isCorrect = selectedOption === quiz?.correctAnswerIndex;

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const handleComplete = async () => {
    try {
      const res = await fetch('/api/users/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: id }) // 'id' es el parámetro de la URL
      });

      const data = await res.json();
      if (res.ok) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('No se pudo marcar como completada', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <button
        onClick={() => navigate('/courses')}
        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        ← Volver a Cursos
      </button>

      {/* Cabecera y Teoría */}
      <article className="bg-[#242424] p-8 rounded-2xl shadow-sm border border-slate-700/50 space-y-6">
        <h1 className="text-3xl font-black text-slate-100">{lesson.title}</h1>

        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-line text-slate-300 leading-relaxed">
            {lesson.contentMarkdown}
          </div>
        </div>
      </article>

      {/* Quiz Interactivo */}
      {quiz && quiz.options && quiz.options.length > 0 && (
        <div className="bg-[#242424] p-8 rounded-2xl shadow-sm border border-slate-700/50 space-y-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            🧠 Poné a prueba tu conocimiento:
          </h2>
          <p className="font-medium text-slate-300">{quiz.question}</p>

          <div className="space-y-3">
            {quiz.options.map((option, index) => {
              let optionStyle = "border-slate-700 bg-[#1a1a1a] hover:border-indigo-500/50 text-slate-300";

              if (isAnswered) {
                if (index === quiz.correctAnswerIndex) {
                  optionStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold";
                } else if (index === selectedOption) {
                  optionStyle = "border-rose-500/50 bg-rose-500/10 text-rose-400 font-semibold";
                } else {
                  optionStyle = "border-slate-800 opacity-50 text-slate-500";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className={`p-4 rounded-xl text-center font-bold border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              {isCorrect ? '¡Correcto, excelente razonamiento! 🎉' : 'Incorrecto, ¡repasá la teoría de arriba! ❌'}
            </div>
          )}
        </div>
      )}
      <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`px-6 py-3 rounded-xl font-bold transition-all border ${isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-default'
              : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/40 hover:text-indigo-300'
            }`}
        >
          {isCompleted ? '✅ ¡Lección Completada!' : 'Marcar como Completada'}
        </button>
      </div>
    </div>
  );
}