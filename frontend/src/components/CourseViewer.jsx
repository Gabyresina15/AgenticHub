import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CourseViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourseAndProgress = async () => {
    try {
      const [courseRes, profileRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch('/api/users/profile')
      ]);

      if (courseRes.ok && profileRes.ok) {
        const courseData = await courseRes.json();
        const profileData = await profileRes.json();

        // Ajustamos según cómo devuelva el objeto tu backend
        const courseObj = courseData.data || courseData;
        setCourse(courseObj);

        // Guardamos los IDs de las lecciones que el alumno ya terminó
        const completedIds = profileData.completedLessons?.map(l => typeof l === 'object' ? l._id : l.toString()) || [];
        setCompletedLessonIds(completedIds);

        // Seleccionamos la primera lección por defecto
        if (courseObj.lessons?.length > 0) {
          setActiveLesson(courseObj.lessons[0]);
        }
      }
    } catch (error) {
      console.error("Error cargando curso:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndProgress();
  }, [id]);

  const handleCompleteLesson = async (lessonId) => {
    try {
      const res = await fetch('/api/users/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedLessonIds(data.completedLessons || []);
      }
    } catch (error) {
      console.error("Error al completar lección:", error);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold text-slate-300 text-xl">Cargando la academia... 🚀</div>;
  if (!course) return <div className="text-center mt-20 font-bold text-red-400 text-xl">Curso no encontrado.</div>;

  return (
    <div className="flex h-screen bg-[#121212] text-slate-200">
      
      {/* Sidebar - Índice de Lecciones */}
      <aside className="w-80 bg-[#1a1a1a] border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700 bg-[#242424]">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-400 hover:text-indigo-300 font-bold mb-4 flex items-center gap-2 transition-colors">
            ← Volver al Dashboard
          </button>
          <h2 className="text-xl font-black text-slate-100 leading-tight">{course.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {course.lessons?.map((lesson, index) => {
            const isCompleted = completedLessonIds.includes(lesson._id);
            const isActive = activeLesson?._id === lesson._id;

            return (
              <button
                key={lesson._id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between ${
                  isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-[#242424] border-slate-700 text-slate-300 hover:border-slate-500'
                } border`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black opacity-50">{index + 1}</span>
                  <span className="text-sm font-bold truncate max-w-42.5">{lesson.title}</span>
                </div>
                {isCompleted && <span className="text-emerald-400 font-bold text-lg">✓</span>}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main - Contenido de la Lección */}
      <main className="flex-1 overflow-y-auto bg-[#121212] p-10">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-4xl font-black text-slate-100 mb-2">{activeLesson.title}</h1>
              <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
            </header>

            {/* Renderizado opcional de video */}
            {activeLesson.videoUrl && (
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                <iframe
                  src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={activeLesson.title}
                ></iframe>
              </div>
            )}

            {/* Contenido en texto / markdown */}
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-slate-700 text-slate-300 leading-relaxed whitespace-pre-wrap shadow-sm">
              {activeLesson.content || activeLesson.contentMarkdown || "El contenido de esta lección se está procesando..."}
            </div>

            {/* Botón de Progreso */}
            <div className="flex justify-end pt-6 border-t border-slate-800 pb-20">
              {completedLessonIds.includes(activeLesson._id) ? (
                <button className="bg-emerald-500/10 text-emerald-400 font-bold py-3 px-8 rounded-xl border border-emerald-500/30 cursor-default flex items-center gap-2">
                  ¡Lección Completada! <span className="text-xl">🎉</span>
                </button>
              ) : (
                <button
                  onClick={() => handleCompleteLesson(activeLesson._id)}
                  className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Marcar como completada ✔️
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 italic">
            Seleccioná una lección del menú para arrancar.
          </div>
        )}
      </main>
    </div>
  );
}