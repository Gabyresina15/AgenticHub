import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Feed from './components/Feed';
import AdminPanel from './components/AdminPanel';
import CoursesView from './components/CoursesView';
import LessonDetail from './components/LessonDetail';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './components/Profile';
import CoursePlayer from './components/CoursePlayer';
import PathPage from './components/PathPage';
import StudentDashboard from './components/StudentDashboard';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import CourseCatalog from './components/CourseCatalog';
import NewsList from './components/news/NewsList';
import NewsDetail from './components/news/NewsDetail';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#1a1a1a] text-slate-200 font-sans selection:bg-indigo-500/30">
          <Navbar />
          <main className="max-w-7xl mx-auto p-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<NewsList />} />
              <Route path="/feed/:slug" element={<NewsDetail />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/courses" element={<CoursesView />} />
              <Route path="/lesson/:id" element={<LessonDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/course/:id" element={<CoursePlayer />} />
              <Route path="/path/:id" element={<PathPage />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}