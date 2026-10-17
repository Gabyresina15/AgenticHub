import express from 'express';
import { completeLesson, enrollInCourse, getUserProfile, resetProgress, updateProfile } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas del estudiante
router.post('/complete-lesson', requireAuth, completeLesson);
router.post('/reset-progress', requireAuth, resetProgress);
router.post('/enroll', requireAuth, enrollInCourse); // NUEVA RUTA
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateProfile);

export default router;