import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';

export default function Feed() {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para registrar la opción elegida por lección
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => {
        let fetchedLessons = data.data || [];
        
        // 👇 3. Si hay un ID, filtramos para dejar solo esa lección
        if (id) {
          fetchedLessons = fetchedLessons.filter(l => l._id === id);
        }
        
        setLessons(fetchedLessons);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar lecciones:", err);
        setLoading(false);
      });
  }, [id]);


  const cleanMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/^```(markdown)?\n/i, '').replace(/\n```$/i, '');
  };

  const handleSelectOption = (lessonId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [lessonId]: optionIndex
    }));
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold">Cargando academia... ⏳</div>;
  if (lessons.length === 0) return <div className="text-center mt-20 text-xl">No hay clases publicadas todavía.</div>;

  return (
    <div className="space-y-12">
      {lessons.map(lesson => {
        const selectedOption = userAnswers[lesson._id];
        const hasAnswered = selectedOption !== undefined;
        const isCorrect = hasAnswered && selectedOption === lesson.quizData?.correctAnswerIndex;

        return (
          <article key={lesson._id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <header className="mb-6 border-b border-slate-100 pb-4">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                Clase Interactiva 🚀
              </span>
              <h2 className="text-3xl font-black mt-4 text-slate-900">{lesson.title}</h2>
            </header>
            
            {/* Contenido Teórico */}
            <div className="prose prose-indigo max-w-none text-slate-700 mb-8">
              <ReactMarkdown>{cleanMarkdown(lesson.contentMarkdown)}</ReactMarkdown>
            </div>

            {/* Sección del Quiz generado por la IA */}
            {lesson.quizData && lesson.quizData.question && (
              <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  🧠 Poné a prueba tu conocimiento: {lesson.quizData.question}
                </h3>
                
                <div className="space-y-3">
                  {lesson.quizData.options.map((option, index) => {
                    let btnStyle = "w-full text-left p-3 rounded-lg border transition-all font-medium ";
                    
                    if (!hasAnswered) {
                      btnStyle += "bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-800";
                    } else if (index === lesson.quizData.correctAnswerIndex) {
                      btnStyle += "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                    } else if (index === selectedOption) {
                      btnStyle += "bg-rose-50 border-rose-500 text-rose-900";
                    } else {
                      btnStyle += "bg-white border-slate-200 opacity-50 text-slate-500";
                    }

                    return (
                      <button
                        key={index}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(lesson._id, index)}
                        className={btnStyle}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback visual instantáneo */}
                {hasAnswered && (
                  <div className={`mt-4 p-3 rounded-lg font-bold text-center ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {isCorrect ? '¡Correcto! Entendiste el concepto a la perfección 🎉' : 'Incorrecto, ¡repasá la teoría de arriba! ❌'}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}