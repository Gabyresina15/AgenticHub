import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InteractiveChallenge from './InteractiveChallenge';

export default function CoursePlayer() {
  const { id } = useParams(); // ID del curso
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [challengeSolved, setChallengeSolved] = useState(false);

  useEffect(() => {
    // 1. Cargamos el curso y el perfil del usuario en paralelo para tener sus lecciones completadas reales
    Promise.all([
      fetch(`/api/courses/${id}`).then(res => res.json()),
      fetch('/api/users/profile').then(res => res.json()).catch(() => null)
    ])
      .then(([courseData, profileData]) => {
        const courseRes = courseData.data || courseData;
        setCourse(courseRes);

        // Si el usuario ya tiene lecciones completadas guardadas en su perfil, las cargamos
        if (profileData && profileData.completedLessons) {
          setCompletedLessons(profileData.completedLessons);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando el reproductor:", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setChallengeSolved(false);
  }, [currentLessonIndex]);

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold">Cargando experiencia de aprendizaje... 🚀</div>;
  if (!course || !course.lessons || course.lessons.length === 0) {
    return <div className="text-center mt-20 text-slate-400 font-bold">Este curso aún no tiene lecciones disponibles.</div>;
  }

  const currentLesson = course.lessons[currentLessonIndex]
  console.log("DATOS DE LA LECCIÓN ACTUAL:", currentLesson);;
  // Validamos si la lección actual está completada (manejando tanto si son strings de IDs como objetos)
  const currentLessonId = currentLesson._id || currentLesson;
  const isCurrentCompleted = completedLessons.some(lId => (lId._id || lId).toString() === currentLessonId.toString());

  
  const hasChallenge = currentLesson.challenge != null;
  const canAdvance = !hasChallenge || challengeSolved || isCurrentCompleted;


  // Función para marcar la lección como completada y avanzar automáticamente
  const handleNextLesson = async () => {
    if (!isCurrentCompleted) {
      try {
        const res = await fetch('/api/users/complete-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: currentLessonId })
        });
        if (res.ok) {
          setCompletedLessons(prev => [...prev, currentLessonId]);
        }
      } catch (err) {
        console.error("Error al completar lección", err);
      }
    }

    // Si hay una lección siguiente, avanzamos el índice
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* SIDEBAR DE LECCIONES (Izquierda) */}
      <div className="bg-[#242424] p-6 rounded-2xl border border-slate-700/50 lg:col-span-1 h-fit space-y-4 shadow-lg">
        <div>
          <Link to="/dashboard" className="text-xs text-indigo-400 hover:underline font-bold">
            ← Volver al Dashboard
          </Link>
          <h2 className="text-lg font-black text-slate-100 mt-2">{course.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{course.lessons.length} lecciones en total</p>
        </div>

        <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {course.lessons.map((lesson, index) => {
            const lessonId = lesson._id || lesson;
            const active = currentLessonIndex === index;
            const completed = completedLessons.some(lId => (lId._id || lId).toString() === lessonId.toString());

            return (
              <button
                key={lessonId}
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${active
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold shadow-sm'
                  : 'bg-[#1a1a1a] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
              >
                <span className="truncate pr-2">
                  {index + 1}. {lesson.title || `Lección ${index + 1}`}
                </span>
                <span>{completed ? '✅' : '⚪'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL DE LA CLASE (Derecha) */}
      <div className="bg-[#242424] p-8 rounded-2xl border border-slate-700/50 lg:col-span-3 space-y-6 shadow-lg">
        <div className="border-b border-slate-700/50 pb-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Lección {currentLessonIndex + 1} de {course.lessons.length}
            </span>
            <h1 className="text-3xl font-black text-slate-100 mt-1">{currentLesson.title || 'Lección'}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isCurrentCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
            {isCurrentCompleted ? 'Completada ✓' : 'En progreso ⏳'}
          </span>
        </div>

        {/* Video opcional */}
        {currentLesson.videoUrl && (
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700">
            <iframe
              src={currentLesson.videoUrl}
              title={currentLesson.title}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Texto Markdown de la lección */}
        <div className="text-slate-300 leading-relaxed space-y-4 whitespace-pre-line bg-[#1a1a1a] p-6 rounded-xl border border-slate-800">
          {currentLesson.contentMarkdown || currentLesson.content || 'Sin contenido detallado.'}
        </div>

        {/* 👇 ACÁ INYECTAMOS EL RETO DE PRUEBA 👇 */}
        {currentLesson.challenge && (
          <InteractiveChallenge
            challenge={currentLesson.challenge}
            onSolve={() => setChallengeSolved(true)}
          />
        )}

        {/* Barra de navegación inferior */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
          <button
            onClick={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))}
            disabled={currentLessonIndex === 0}
            className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-all text-sm"
          >
            ← Anterior
          </button>

          <button
            onClick={handleNextLesson}
            disabled={!canAdvance}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${canAdvance
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
          >
            {currentLessonIndex === course.lessons.length - 1 ? 'Finalizar Curso 🏆' : 'Siguiente Lección →'}
          </button>
        </div>
      </div>
    </div>
  );
}