import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import agentRoutes from './routes/agentRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js'; // <-- Importamos el middleware
import courseRoutes from './routes/courseRoutes.js';
import cookieParser from 'cookie-parser'; // 1. Importar cookie-parser
import authRoutes from './routes/authRoutes.js'; // 1. Importar las rutas de auth
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(cookieParser()); // 2. IMPORTANTE: Habilitar la lectura de cookies

connectDB();

// Registramos los routers
app.use('/api/agent', agentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Middleware global de errores (Debe ir SIEMPRE al final de todas las rutas)
app.use(errorHandler);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en TODAS las interfaces en el puerto ${PORT}`);
});