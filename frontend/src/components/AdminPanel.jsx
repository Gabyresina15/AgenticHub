import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('Básico');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Estados para Modales (Confirmación y Edición)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [editModal, setEditModal] = useState({
    isOpen: false,
    type: '', // 'course' o 'lesson'
    id: '',
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    level: 'Básico'
  });

  // Estado exclusivo para manejar la info del Reto Interactivo
  const [lessonForm, setLessonForm] = useState({
    hasChallenge: false,
    challenge: {
      title: '',
      description: '',
      initialCode: '',
      solutionKey: '',
      successMessage: '¡Excelente! El código es válido. ✔️',
      errorMessage: 'Mmm, revisá bien. Parece que falta algo. ❌'
    }
  });

  const fetchDrafts = () => {
    fetch('/api/lessons/drafts')
      .then(res => res.json())
      .then(data => {
        setDrafts(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar borradores:", err);
        setLoading(false);
      });
  };

  const fetchCoursesAndLessons = async () => {
    try {
      const [coursesRes, lessonsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/lessons')
      ]);
      const coursesData = await coursesRes.json();
      const lessonsData = await lessonsRes.json();

      setCourses(coursesData.data || []);
      setLessons(lessonsData.data || []);
    } catch (error) {
      console.error("Error al cargar cursos o lecciones:", error);
    }
  };

  useEffect(() => {
    fetchDrafts();
    fetchCoursesAndLessons();
  }, []);

  const handlePublish = async (id) => {
    setModalConfig({
      isOpen: true,
      title: '¿Publicar borrador?',
      message: 'Esta lección generada por IA pasará a estar disponible en la plataforma.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/lessons/${id}/publish`, { method: 'PATCH' });
          if (res.ok) {
            fetchDrafts();
            fetchCoursesAndLessons();
          }
        } catch (error) {
          console.error("Error al publicar:", error);
        }
      }
    });
  };

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsAgentWorking(true);
    try {
      const res = await fetch('/api/agent/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (res.ok) {
        setTopic('');
        fetchDrafts();
      }
    } catch (error) {
      console.error("Error al iniciar investigación:", error);
    } finally {
      setIsAgentWorking(false);
    }
  };

  const handleLinkLesson = async (courseId, lessonId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });
      if (res.ok) {
        fetchCoursesAndLessons();
      }
    } catch (error) {
      console.error("Error al vincular lección:", error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    setModalConfig({
      isOpen: true,
      title: '¿Crear nuevo curso?',
      message: `Estás por dar de alta el curso "${newCourseTitle}". ¿Confirmás?`,
      onConfirm: async () => {
        setIsCreatingCourse(true);
        try {
          const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newCourseTitle,
              description: newCourseDescription,
              level: newCourseLevel
            })
          });

          if (res.ok) {
            setNewCourseTitle('');
            setNewCourseDescription('');
            setNewCourseLevel('Básico');
            fetchCoursesAndLessons();
          }
        } catch (error) {
          console.error("Error al crear curso:", error);
        } finally {
          setIsCreatingCourse(false);
        }
      }
    });
  };

  // ACÁ ESTÁ LA MAGIA: Integré tu guardado manual con el reto de código
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    setModalConfig({
      isOpen: true,
      title: '¿Guardar nueva lección?',
      message: `Se creará la lección manual "${newLessonTitle}".`,
      onConfirm: async () => {
        setIsCreatingLesson(true);
        try {
          const res = await fetch('/api/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newLessonTitle,
              content: newLessonContent,
              videoUrl: newLessonVideoUrl,
              status: 'published',
              // Mandamos el reto SÓLO si el switch está encendido
              challenge: lessonForm.hasChallenge ? lessonForm.challenge : null
            })
          });

          if (res.ok) {
            // Limpiamos todo al terminar
            setNewLessonTitle('');
            setNewLessonContent('');
            setNewLessonVideoUrl('');
            setLessonForm(prev => ({
              ...prev,
              hasChallenge: false,
              challenge: {
                title: '', description: '', initialCode: '', solutionKey: '',
                successMessage: '¡Excelente! El código es válido. ✔️',
                errorMessage: 'Mmm, revisá bien. Parece que falta algo. ❌'
              }
            }));
            fetchCoursesAndLessons();
          }
        } catch (error) {
          console.error("Error al crear lección manual:", error);
        } finally {
          setIsCreatingLesson(false);
        }
      }
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { type, id, title, description, content, videoUrl, level } = editModal;

    try {
      let url = '';
      let bodyData = {};

      if (type === 'course') {
        url = `/api/courses/${id}`;
        bodyData = { title, description, level };
      } else {
        url = `/api/lessons/${id}`;
        bodyData = { title, content, videoUrl };
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setEditModal({ isOpen: false, type: '', id: '', title: '', description: '', content: '', videoUrl: '', level: 'Básico' });
        fetchCoursesAndLessons();
        fetchDrafts();
      } else {
        alert('Error al actualizar los datos.');
      }
    } catch (err) {
      console.error("Error al guardar edición:", err);
    }
  };

  const confirmDeleteCourse = (courseId) => {
    setModalConfig({
      isOpen: true,
      title: '¿Eliminar curso?',
      message: 'Esta acción borrará el curso por completo. No se puede deshacer.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
          if (res.ok) {
            setCourses(prev => prev.filter(c => c._id !== courseId));
            if (selectedCourseId === courseId) setSelectedCourseId('');
          }
        } catch (err) {
          console.error("Error eliminando curso:", err);
        }
      }
    });
  };

  const confirmDeleteLesson = (lessonId) => {
    setModalConfig({
      isOpen: true,
      title: '¿Eliminar lección?',
      message: '¿Estás seguro de borrar esta lección definitivamente?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
          if (res.ok) {
            setLessons(prev => prev.filter(l => l._id !== lessonId));
            fetchDrafts();
            fetchCoursesAndLessons();
          }
        } catch (err) {
          console.error("Error eliminando lección:", err);
        }
      }
    });
  };

  const confirmUnlinkLesson = (courseId, lessonId) => {
    setModalConfig({
      isOpen: true,
      title: '¿Quitar del curso?',
      message: 'La lección se desvinculará de este curso pero seguirá estando disponible.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' });
          if (res.ok) fetchCoursesAndLessons();
        } catch (err) {
          console.error("Error al desvincular:", err);
        }
      }
    });
  };

  if (loading) return <div className="text-center mt-20 font-bold text-slate-300">Cargando panel de administración... 🚀</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12 relative">

      {/* MODALES OCULTOS POR ESPACIO ... */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-slate-100">{modalConfig.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{modalConfig.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModalConfig({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  modalConfig.onConfirm();
                  setModalConfig({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                }}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors"
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-slate-700 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-indigo-400">
              Editar {editModal.type === 'course' ? 'Curso 📚' : 'Lección 📝'}
            </h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Título</label>
                <input
                  type="text"
                  value={editModal.title}
                  onChange={(e) => setEditModal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              {editModal.type === 'course' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Nivel</label>
                    <select
                      value={editModal.level}
                      onChange={(e) => setEditModal(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    >
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Descripción</label>
                    <textarea
                      value={editModal.description}
                      onChange={(e) => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                    ></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">URL de Video (opcional)</label>
                    <input
                      type="url"
                      value={editModal.videoUrl}
                      onChange={(e) => setEditModal(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Contenido de la lección</label>
                    <textarea
                      value={editModal.content}
                      onChange={(e) => setEditModal(prev => ({ ...prev, content: e.target.value }))}
                      rows="4"
                      className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                      required
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sección del Agente */}
      <div className="bg-[#242424] p-8 rounded-2xl border border-indigo-500/30">
        <h2 className="text-2xl font-black text-indigo-400 mb-2">Comandar Agente 🤖</h2>
        <p className="text-slate-400 mb-6">Ingresá un tema y la IA investigará, redactará y creará un borrador automáticamente.</p>

        <form onSubmit={handleResearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Ej: Novedades de React 19..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isAgentWorking}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAgentWorking || !topic.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-600/50 transition-colors"
          >
            {isAgentWorking ? 'Investigando...' : 'Generar Lección'}
          </button>
        </form>
      </div>

      {/* Sección de Borradores */}
      <div className="bg-[#242424] p-8 rounded-2xl shadow-sm border border-slate-700/50">
        <h2 className="text-2xl font-black text-slate-100 mb-6">Borradores Pendientes</h2>

        {drafts.length === 0 ? (
          <p className="text-slate-500">No hay borradores pendientes. ¡Poné a trabajar al agente!</p>
        ) : (
          <div className="space-y-4">
            {drafts.map(draft => (
              <div key={draft._id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-[#1a1a1a]">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {draft.topicId?.name || 'Tema Desconocido'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-200">{draft.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePublish(draft._id)}
                    className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg font-medium hover:bg-emerald-600/40 transition-colors text-sm"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => confirmDeleteLesson(draft._id)}
                    className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg font-bold text-sm transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gestión de Cursos */}
      <div className="border-t border-slate-800 pt-8 mt-8">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-slate-100">Gestión de Cursos 📚</h2>
          <p className="text-slate-400 mt-2">Armá tus rutas de aprendizaje vinculando lecciones a los cursos.</p>
        </header>

        {/* Formulario Crear Curso */}
        <div className="bg-[#242424] p-6 rounded-2xl border border-indigo-500/30 mb-8">
          <h3 className="text-lg font-bold text-indigo-400 mb-4">Crear Nuevo Nivel / Curso ➕</h3>
          <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Título del curso"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="col-span-1 md:col-span-2 px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
            <select
              value={newCourseLevel}
              onChange={(e) => setNewCourseLevel(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
            <button
              type="submit"
              disabled={isCreatingCourse || !newCourseTitle.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-600/50 transition-colors"
            >
              {isCreatingCourse ? 'Creando...' : 'Crear Curso'}
            </button>
            <input
              type="text"
              placeholder="Breve descripción..."
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              className="col-span-1 md:col-span-4 px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </form>
        </div>

        {/* Formulario Crear Lección Manual (ACÁ INTEGRAMOS EL RETO) */}
        <div className="bg-[#242424] p-6 rounded-2xl border border-emerald-500/30 mb-8">
          <h3 className="text-lg font-bold text-emerald-400 mb-4">Crear Lección Manual 📝</h3>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título de la lección"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
              <input
                type="url"
                placeholder="URL del Video (opcional)"
                value={newLessonVideoUrl}
                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <textarea
              placeholder="Contenido en texto de la lección..."
              value={newLessonContent}
              onChange={(e) => setNewLessonContent(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-[#1a1a1a] text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              required
            ></textarea>

            {/* 👇 BLOQUE DEL RETO INTERACTIVO 👇 */}
            <div className="mt-6 border-t border-slate-700/50 pt-6 mb-4">
              <label className="flex items-center gap-3 cursor-pointer mb-6 w-fit hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  checked={lessonForm.hasChallenge}
                  onChange={(e) => setLessonForm({ ...lessonForm, hasChallenge: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded bg-slate-800 border-slate-700 cursor-pointer"
                />
                <span className="text-slate-200 font-bold text-sm">¿Agregar Reto de Código Interactivo? 💻</span>
              </label>

              {lessonForm.hasChallenge && (
                <div className="bg-[#121212] p-5 rounded-2xl border border-emerald-500/30 space-y-4 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-400 mb-1">Título del Reto</label>
                      <input
                        type="text"
                        required={lessonForm.hasChallenge}
                        value={lessonForm.challenge.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, challenge: { ...lessonForm.challenge, title: e.target.value } })}
                        className="w-full bg-[#1a1a1a] text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-400 mb-1">Palabra Clave (Solución)</label>
                      <input
                        type="text"
                        required={lessonForm.hasChallenge}
                        value={lessonForm.challenge.solutionKey}
                        onChange={(e) => setLessonForm({ ...lessonForm, challenge: { ...lessonForm.challenge, solutionKey: e.target.value } })}
                        className="w-full bg-[#1a1a1a] text-slate-200 font-mono px-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1">Instrucciones para el alumno</label>
                    <textarea
                      required={lessonForm.hasChallenge}
                      value={lessonForm.challenge.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, challenge: { ...lessonForm.challenge, description: e.target.value } })}
                      className="w-full bg-[#1a1a1a] text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 h-16 outline-none resize-none text-sm"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-emerald-400 mb-1">Código Inicial (con error/incompleto)</label>
                    <textarea
                      required={lessonForm.hasChallenge}
                      spellCheck="false"
                      value={lessonForm.challenge.initialCode}
                      onChange={(e) => setLessonForm({ ...lessonForm, challenge: { ...lessonForm.challenge, initialCode: e.target.value } })}
                      className="w-full bg-[#050505] text-emerald-400 font-mono text-sm px-4 py-4 rounded-xl border border-slate-700 focus:border-emerald-500 h-32 outline-none resize-none"
                      placeholder="// Escribí el código base acá..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <input
                      type="text"
                      value={lessonForm.challenge.successMessage}
                      onChange={(e) => setLessonForm({ ...lessonForm, challenge: { ...lessonForm.challenge, successMessage: e.target.value } })}
                      className="w-full bg-[#1a1a1a] text-emerald-400 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none"
                      placeholder="Mensaje de éxito..."
                    />
                    <input
                      type="text"
                      value={lessonForm.challenge.errorMessage}
                      onChange={(e) => setLessonForm({ ...lessonForm, challenge: { ...lessonForm.challenge, errorMessage: e.target.value } })}
                      className="w-full bg-[#1a1a1a] text-rose-400 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:border-rose-500 outline-none"
                      placeholder="Mensaje de error..."
                    />
                  </div>
                </div>
              )}
            </div>
            {/* 👆 FIN BLOQUE DEL RETO 👆 */}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreatingLesson || !newLessonTitle.trim()}
                className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-lg font-bold hover:bg-emerald-600/40 disabled:opacity-50 transition-colors"
              >
                {isCreatingLesson ? 'Creando...' : 'Guardar Lección'}
              </button>
            </div>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Cursos Activos */}
          <div className="bg-[#242424] p-6 rounded-2xl shadow-sm border border-slate-700/50">
            <h3 className="text-xl font-bold mb-4 text-slate-200">Cursos Activos</h3>
            <div className="space-y-4">
              {courses.map(course => (
                <div
                  key={course._id}
                  onClick={() => setSelectedCourseId(course._id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedCourseId === course._id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-[#1a1a1a] hover:border-indigo-500/50'}`}
                >
                  <div>
                    <h4 className="font-bold text-slate-200">{course.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Lecciones vinculadas: {course.lessons?.length || 0}</p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditModal({
                        isOpen: true,
                        type: 'course',
                        id: course._id,
                        title: course.title,
                        description: course.description || '',
                        level: course.level || 'Básico'
                      })}
                      className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-lg font-bold text-xs transition-all"
                      title="Editar curso"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDeleteCourse(course._id)}
                      className="px-2.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg font-bold text-xs transition-all"
                      title="Eliminar curso"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lecciones Disponibles */}
          <div className="bg-[#242424] p-6 rounded-2xl shadow-sm border border-slate-700/50">
            <h3 className="text-xl font-bold mb-4 text-slate-200">Lecciones Disponibles</h3>
            {!selectedCourseId ? (
              <div className="flex items-center justify-center h-32 bg-[#1a1a1a] rounded-xl border border-dashed border-slate-700">
                <span className="text-slate-500 italic text-sm">Seleccioná un curso a la izquierda primero.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map(lesson => {
                  const currentCourse = courses.find(c => c._id === selectedCourseId);
                  const isLinked = currentCourse?.lessons?.some(l =>
                    (typeof l === 'string' ? l : l._id) === lesson._id
                  );

                  return (
                    <div key={lesson._id} className="flex justify-between items-center p-3 bg-[#1a1a1a] rounded-xl border border-slate-700">
                      <span className="font-medium text-sm text-slate-300 truncate max-w-40" title={lesson.title}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-2">
                        {isLinked ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded">Vinculada ✓</span>
                            <button
                              onClick={() => confirmUnlinkLesson(selectedCourseId, lesson._id)}
                              className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 px-2 py-1 rounded text-xs font-bold transition-colors"
                              title="Quitar del curso"
                            >
                              Quitar ✖
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleLinkLesson(selectedCourseId, lesson._id)}
                            className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/40 px-3 py-1 rounded text-xs font-bold transition-colors"
                          >
                            Vincular +
                          </button>
                        )}
                        <button
                          onClick={() => setEditModal({
                            isOpen: true,
                            type: 'lesson',
                            id: lesson._id,
                            title: lesson.title,
                            content: lesson.content || lesson.contentMarkdown || '',
                            videoUrl: lesson.videoUrl || ''
                          })}
                          className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded font-bold text-xs transition-all"
                          title="Editar lección"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => confirmDeleteLesson(lesson._id)}
                          className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded font-bold text-xs transition-all"
                          title="Eliminar lección"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN EXPLORAR / NEWSLETTER */}
      <div className="border-t border-slate-800 pt-8 mt-12">
        <header className="mb-6">
          <h2 className="text-3xl font-black text-slate-100">Explorar Contenido Global 📰</h2>
          <p className="text-slate-400 mt-1">Vista previa en vivo del feed general o "Newsletter" de lecciones publicadas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lessons.filter(l => l.status === 'published' || !l.status).length === 0 ? (
            <p className="text-slate-500 italic">No hay contenido publicado para explorar todavía.</p>
          ) : (
            lessons.filter(l => l.status === 'published' || !l.status).map(lesson => (
              <div key={lesson._id} className="bg-[#242424] p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Lección Pública</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">{lesson.title}</h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-3">
                    {lesson.content || lesson.contentMarkdown || 'Sin descripción detallada.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
                  <span>🎥 {lesson.videoUrl ? 'Con video' : 'Solo texto'}</span>
                  <span className="text-emerald-400 font-bold">Activa 🟢</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}