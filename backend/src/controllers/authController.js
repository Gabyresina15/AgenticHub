import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto_agentic_hub_2026';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña tiene que tener al menos 8 caracteres.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const user = new User({ name, email: email.toLowerCase(), password, role: 'student' });
    await user.save();
    res.status(201).json({ success: true, message: 'Usuario registrado. Ya podés iniciar sesión.' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions());
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.status(200).json({ success: true, message: 'Sesión cerrada' });
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Sesión inválida.' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}; 

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificamos si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Creamos el usuario (la contraseña se encripta sola por el modelo)
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ success: true, message: 'Usuario registrado con éxito. ¡Ya podés iniciar sesión!' });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscamos al usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Comparamos la contraseña encriptada
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Creamos el pase VIP (JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' } // Dura una semana
    );

    // Inyectamos el JWT en una Cookie HTTP-Only ultra segura
    res.cookie('token', token, {
      httpOnly: true, // Frontend no puede leerla (anti-XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict', // Protege contra ataques CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
    });

    res.status(200).json({ 
      success: true, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Sesión cerrada' });
};

// Endpoint para que el Frontend pregunte "¿Quién soy?" y vea si la sesión sigue viva
export const me = async (req, res) => {
  try {
    // Si llegó hasta acá, es porque el middleware (que armaremos en el paso 2) validó la cookie
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};