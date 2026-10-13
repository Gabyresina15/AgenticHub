import express from 'express';
import { 
  getCourses, 
  createCourse, 
  getCourseById, 
  getPaths,
  getPathById,
  createPath, 
  addLessonToCourse, 
  updateCourse, 
  deleteCourse, 
  removeLessonFromCourse 
} from '../controllers/courseController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas de Cursos
router.get('/', getCourses);
router.get('/paths', getPaths);
router.get('/paths/:id', getPathById);
router.post('/paths', requireAuth, requireAdmin, createPath);
router.get('/:id', getCourseById);

// Rutas protegidas (Admin)
router.post('/', requireAuth, requireAdmin, createCourse);
router.put('/:id', requireAuth, requireAdmin, updateCourse);
router.delete('/:id', requireAuth, requireAdmin, deleteCourse);

// Gestión de Lecciones dentro del Curso
router.post('/:courseId/lessons', requireAuth, requireAdmin, addLessonToCourse);
router.delete('/:courseId/lessons/:lessonId', requireAuth, requireAdmin, removeLessonFromCourse); // 👈 2. Registramos la ruta DELETE para desvincular

export default router;