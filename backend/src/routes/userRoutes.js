import express from 'express';
import { completeLesson, enrollInCourse, getUserProfile, resetProgress } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas del estudiante
router.post('/complete-lesson', requireAuth, completeLesson);
router.post('/reset-progress', requireAuth, resetProgress);
router.post('/enroll', requireAuth, enrollInCourse); // NUEVA RUTA
router.get('/profile', requireAuth, getUserProfile);

export default router;