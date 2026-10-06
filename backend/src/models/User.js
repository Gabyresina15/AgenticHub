import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  
  // NUEVO: Cursos a los que el usuario se anotó
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course' // Le avisa a Mongoose que estos IDs pertenecen a la colección Course
  }],
  
  // NUEVO: Lecciones que el usuario ya terminó
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson' // Le avisa a Mongoose que estos IDs pertenecen a la colección Lesson
  }]
  
}, { timestamps: true });

// Middleware de Mongoose: Encriptar la contraseña sin usar 'next'
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Método para comparar la contraseña que tipea el usuario
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);