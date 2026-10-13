import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const [posts, setPosts] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/posts').then(res => res.json()).catch(() => ({ data: [] })),
            fetch('/api/courses').then(res => res.json()).catch(() => ({ data: [] })),
        ]).then(([postData, courseData]) => {
            setPosts(postData.data || []);
            setCourses(courseData.data || courseData || []);
            setLoading(false);
        });
    }, []);

    return (
        <div className="bg-[#121212] text-slate-200">

            {/* HERO SECTION (El gancho principal) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-8">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-100 leading-tight">
                    El hub definitivo para <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400">
                        aprender y explorar
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Únete a AgenticHub. Explora nuestro newsletter de lecciones generadas de forma inteligente, sigue tu progreso y domina nuevas habilidades tecnológicas hoy mismo.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    {/* Botón principal: va al Login para que se registren/entren si quieren los cursos completos */}
                    <Link to="/login" className="px-8 py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">
                        Comenzar gratis 🚀
                    </Link>

                    {/* Botón secundario: va directo al Feed para probar */}
                    <Link to="/feed" className="px-8 py-4 rounded-xl font-bold text-lg bg-[#242424] text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all">
                        Ver novedades
                    </Link>
                </div>
            </section>

            {/* SECCIÓN NEWSLETTER / EXPLORAR */}
            <section className="bg-[#1a1a1a] border-t border-slate-800 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-100">
                            Explorar Newsletter 📰
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
                            Un feed constante de conocimiento. Echa un vistazo a nuestras últimas lecciones públicas disponibles para la comunidad sin necesidad de registro.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center font-bold text-slate-500 text-xl">Cargando las últimas novedades... 📡</div>
                    ) : posts.length === 0 ? (
                        <div className="text-center text-slate-500 italic bg-[#242424] p-12 rounded-2xl border border-slate-700/50 max-w-3xl mx-auto">
                            Aún no hay contenido publicado en el newsletter. ¡Vuelve pronto!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <Link
                                    key={post._id}
                                    to={`/feed/${post._id}`}
                                    className="bg-[#242424] p-8 rounded-2xl border border-slate-700/50 flex flex-col justify-between space-y-4 shadow-lg hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{post.tag || 'Novedad'}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-4 line-clamp-3 leading-relaxed">
                                            {post.summary || post.body}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-700/50 flex justify-end text-xs">
                                        <span className="bg-emerald-500/10 text-emerald-400 font-bold px-4 py-2 rounded-lg border border-emerald-500/20">Leer</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-black text-slate-100 mb-8">Cursos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(Array.isArray(courses) ? courses : []).map(course => (
                        <Link key={course._id} to={`/course/${course._id}`} className="bg-[#242424] p-6 rounded-2xl border border-slate-700/50">
                            <h3 className="text-xl font-bold text-slate-100">{course.title}</h3>
                            <p className="text-slate-400 mt-2 text-sm">{course.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    );
}