import express from 'express';
import { register, login, googleLogin, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);

// Esta ruta la usará React cada vez que el usuario entre a la página para saber si sigue logueado
router.get('/me', requireAuth, me); 

export default router;