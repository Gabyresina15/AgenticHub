import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json()); // Permite recibir JSON en los requests

// Ruta de prueba para verificar que la API respira
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agentic Hub API funcionando 🚀' });
});

export default app;