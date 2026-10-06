import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para cargar el perfil (con el progreso) y todos los cursos
    const fetchData = async () => {
        try {
            const [profileRes, coursesRes] = await Promise.all([
                fetch('/api/users/profile'), // Llama a tu tremendo controlador con populate y cálculos
                fetch('/api/courses')
            ]);

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setUser(profileData);
            }

            if (coursesRes.ok) {
                const coursesData = await coursesRes.json();
                setAllCourses(coursesData.data || []);
            }
        } catch (error) {
            console.error("🔥 Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Función para inscribirse a un curso nuevo
    const handleEnroll = async (courseId) => {
        try {
            const res = await fetch('/api/users/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });

            if (res.ok) {
                // Si sale bien, recargamos los datos para que el curso pase a "Mis Cursos" al instante
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || 'Hubo un error al inscribirse');
            }
        } catch (error) {
            console.error("Error en inscripción:", error);
        }
    };

    if (loading) {
        return <div className="text-center mt-20 font-bold text-slate-300 text-xl">Cargando tu espacio de aprendizaje... 🚀</div>;
    }

    // Filtramos los cursos para la sección "Explorar": solo mostramos en los que NO está inscrito
    const enrolledCourseIds = user?.enrolledCourses?.map(c => c._id) || [];
    const exploreCourses = allCourses.filter(c => !enrolledCourseIds.includes(c._id));

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">

            {/* HEADER DEL ALUMNO */}
            <header className="bg-linear-to-r from-indigo-600/20 to-emerald-600/20 border border-slate-700/50 rounded-2xl p-8 shadow-lg">
                <h1 className="text-4xl font-black text-slate-100 mb-2">
                    ¡Hola de nuevo! 👋
                </h1>
                <p className="text-slate-400 text-lg">
                    Listo para seguir sumando conocimientos. Mirá tu progreso y descubrí nuevas rutas.
                </p>
            </header>

            {/* MIS CURSOS (Progreso Real) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                    Mis Cursos 📚
                </h2>

                {user?.enrolledCourses?.length === 0 ? (
                    <div className="bg-[#242424] border border-dashed border-slate-700 rounded-2xl p-10 text-center">
                        <p className="text-slate-400">Todavía no te inscribiste a ningún curso.</p>
                        <p className="text-indigo-400 font-bold mt-2">¡Revisá la sección de abajo para empezar!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {user.enrolledCourses.map(course => (
                            <div key={course._id} className="bg-[#242424] border border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md uppercase tracking-wider">
                                            {course.level || 'Básico'}
                                        </span>
                                        <span className="text-emerald-400 font-bold text-sm">{course.progress}%</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-200 mb-2">{course.title}</h3>

                                    {/* BARRA DE PROGRESO */}
                                    <div className="w-full bg-[#1a1a1a] rounded-full h-3 mb-6 border border-slate-700/50 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                                >
                                    {course.progress === 0 ? 'Empezar Curso' : course.progress === 100 ? 'Repasar' : 'Continuar'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* SECCIÓN EXPLORAR (Cursos Disponibles) */}
            <section className="space-y-6 pt-8 border-t border-slate-800">
                <h2 className="text-2xl font-black text-slate-100">
                    Explorar Nuevos Cursos 🚀
                </h2>

                {exploreCourses.length === 0 ? (
                    <p className="text-slate-500 italic">¡Ya estás inscripto en todos los cursos disponibles! Sos una máquina.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {exploreCourses.map(course => (
                            <div key={course._id} className="bg-[#1a1a1a] border border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-600 transition-colors">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-200 mb-2">{course.title}</h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                                        {course.description || 'Sumate a este curso y potenciá tus habilidades al máximo nivel.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleEnroll(course._id)}
                                    className="w-full bg-slate-800 text-slate-200 font-bold py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
                                >
                                    Inscribirme
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}