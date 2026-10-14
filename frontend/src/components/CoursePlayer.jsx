import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import InteractiveChallenge from './InteractiveChallenge';

export default function CoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${id}`).then(res => res.json()),
      fetch('/api/users/profile', { credentials: 'include' }).then(res => res.json()).catch(() => null)
    ])
      .then(([courseData, profileData]) => {
        setCourse(courseData.data || courseData);
        if (profileData?.completedLessons) setCompletedLessons(profileData.completedLessons);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setChallengeSolved(false);
  }, [currentLessonIndex]);

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold">Cargando...</div>;
  if (!course?.lessons?.length) return <div className="text-center mt-20 text-slate-400 font-bold">Este curso aún no tiene lecciones.</div>;

  const currentLesson = course.lessons[currentLessonIndex];
  const currentLessonId = currentLesson._id || currentLesson;
  const isCurrentCompleted = completedLessons.some(lId => (lId._id || lId).toString() === currentLessonId.toString());
  const hasRealChallenge = Boolean(currentLesson.challenge?.initialCode || currentLesson.challenge?.tests?.length);
  const canAdvance = !hasRealChallenge || challengeSolved || isCurrentCompleted;

  const handleNextLesson = async () => {
    if (!isCurrentCompleted) {
      try {
        const res = await fetch('/api/users/complete-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ lessonId: currentLessonId })
        });
        if (res.ok) setCompletedLessons(prev => [...prev, currentLessonId]);
      } catch (err) {
        console.error('Error al completar lección', err);
      }
    }
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      return;
    }
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-[#242424] border border-slate-700/50 rounded-3xl p-10">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Curso terminado</p>
          <h1 className="text-4xl font-black text-slate-100 mt-3">Completaste {course.title}.</h1>
          <p className="text-slate-400 mt-3">{course.lessons.length} lecciones. El progreso quedó guardado.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/courses" className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white">Volver a cursos</Link>
            <Link to="/" className="px-6 py-3 rounded-xl font-bold bg-[#1a1a1a] text-slate-300 border border-slate-700">Ir al home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`-mx-8 -mt-8 h-[calc(100vh-4.5rem)] p-4 grid grid-cols-1 gap-4 ${hasRealChallenge ? 'lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.15fr)]' : 'lg:grid-cols-[220px_minmax(0,1fr)]'}`}>
      <aside className="bg-[#242424] p-5 rounded-2xl border border-slate-700/50 self-start w-full max-h-full overflow-y-auto">
        <Link to="/dashboard" className="text-xs text-indigo-400 hover:underline font-bold">← Volver al Dashboard</Link>
        <h2 className="text-lg font-black text-slate-100 mt-3">{course.title}</h2>
        <p className="text-xs text-slate-400 mt-1">{course.lessons.length} lecciones en total</p>
        <div className="space-y-2 mt-4">
          {course.lessons.map((lesson, index) => {
            const lessonId = lesson._id || lesson;
            const active = currentLessonIndex === index;
            const completed = completedLessons.some(lId => (lId._id || lId).toString() === lessonId.toString());
            return (
              <button
                key={lessonId}
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium flex items-center justify-between ${active ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-[#1a1a1a] text-slate-300 border border-slate-800'}`}
              >
                <span className="truncate pr-2">{index + 1}. {lesson.title || `Lección ${index + 1}`}</span>
                <span>{completed ? '✅' : '⚪'}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="bg-[#242424] rounded-2xl border border-slate-700/50 flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-start gap-4 shrink-0">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Lección {currentLessonIndex + 1} de {course.lessons.length}</span>
            <h1 className="text-3xl font-black text-slate-100 mt-1">{currentLesson.title || 'Lección'}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${isCurrentCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
            {isCurrentCompleted ? 'Completada ✓' : 'En progreso'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-10 py-8 text-slate-300">
          <div className="prose prose-invert max-w-none leading-relaxed">
            <ReactMarkdown>{(currentLesson.contentMarkdown || currentLesson.content || 'Sin contenido.').replace(/^# .+\n+/, '')}</ReactMarkdown>
          </div>
          {currentLesson.teaches && (
            <div>
              <h2 className="text-slate-100 font-bold mb-2">Qué te enseña</h2>
              <p className="leading-relaxed">{currentLesson.teaches}</p>
            </div>
          )}
          {currentLesson.howToSolve && (
            <div>
              <h2 className="text-slate-100 font-bold mb-2">Cómo se resuelve</h2>
              <p className="leading-relaxed">{currentLesson.howToSolve}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-700/50 flex justify-between shrink-0">
          <button onClick={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))} disabled={currentLessonIndex === 0} className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 disabled:opacity-40 text-sm">← Anterior</button>
          <button onClick={handleNextLesson} disabled={!canAdvance} className={`px-6 py-2.5 rounded-xl font-bold text-sm ${canAdvance ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
            {currentLessonIndex === course.lessons.length - 1 ? 'Finalizar Curso' : 'Siguiente Lección →'}
          </button>
        </div>
      </section>

      {hasRealChallenge && (
      <section className="min-h-0">
          <InteractiveChallenge
            key={String(currentLessonId)}
            challenge={currentLesson.challenge}
            lessonId={currentLessonId}
            fill
            onSolve={() => {
              setChallengeSolved(true);
              setCompletedLessons(prev => prev.some(item => String(item) === String(currentLessonId)) ? prev : [...prev, currentLessonId]);
            }}
          />
      </section>
      )}
    </div>
  );
}
