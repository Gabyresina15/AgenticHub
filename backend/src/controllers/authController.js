import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

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

function startSession(res, user) {
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOptions());
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export const googleLogin = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'Falta GOOGLE_CLIENT_ID.' });
    const credential = req.body?.credential;
    if (!credential) return res.status(400).json({ error: 'Falta el token de Google.' });

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    if (!email || !payload.email_verified) {
      return res.status(401).json({ error: 'Google no verificó ese email.' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        role: 'student',
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    res.status(200).json({ success: true, user: startSession(res, user) });
  } catch (error) {
    console.error('Error en Google login:', error);
    res.status(401).json({ error: 'No se pudo validar el login de Google.' });
  }
};
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const userPayload = startSession(res, user);
    res.status(200).json({ success: true, user: userPayload });
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
