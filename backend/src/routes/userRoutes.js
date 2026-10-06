import express from 'express';
import { markLessonComplete, enrollInCourse, getUserProfile, completeLesson } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas del estudiante
router.post('/complete-lesson', requireAuth, markLessonComplete);
router.post('/enroll', requireAuth, enrollInCourse); // NUEVA RUTA
router.get('/profile', requireAuth, getUserProfile);
router.post('/complete-lesson', requireAuth, completeLesson); // La nueva para sumar progreso

export default router;