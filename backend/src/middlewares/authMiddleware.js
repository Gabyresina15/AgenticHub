import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto_agentic_hub_2026';

// Middleware para verificar si el usuario está logueado (tiene un token válido)
export const requireAuth = (req, res, next) => {
  // Leemos el token desde las cookies (gracias a cookie-parser)
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Debes iniciar sesión para ver esto.' });
  }

  try {
    // Verificamos si el token es real y no fue alterado
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario en la request (id y rol)
    next(); // Lo dejamos pasar
  } catch (error) {
    return res.status(401).json({ error: 'Sesión expirada o token inválido.' });
  }
};

// Middleware para verificar si además de logueado, es ADMINISTRADOR
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Es jefe, lo dejamos pasar al panel
  } else {
    res.status(403).json({ error: 'Acceso prohibido. No tienes permisos de administrador.' });
  }
};