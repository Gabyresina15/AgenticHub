import User from '../models/User.js';
import Lesson from '../models/Lesson.js';

export const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;

    // $addToSet evita que se duplique si ya estaba completada
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { completedLessons: lessonId } },
      { returnDocument: 'after' }
    ).select('-password');

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("🔥 Error al marcar lección como completada:", error);
    res.status(500).json({ error: 'Error al completar la lección' });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { courseId } = req.body;

    // $addToSet asegura que el usuario no se pueda inscribir dos veces al mismo curso
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true }
    ).select('-password');

    res.status(200).json({ 
      success: true, 
      message: '¡Inscripción exitosa!', 
      enrolledCourses: updatedUser.enrolledCourses 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la inscripción' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // Poblamos los cursos y sus lecciones directamente
    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses',
        populate: { path: 'lessons' } // 👈 Poblamos las lecciones de cada curso inscripto
      })
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userObj = user.toObject();

    if (userObj.enrolledCourses && Array.isArray(userObj.enrolledCourses)) {
      for (let course of userObj.enrolledCourses) {
        // Obtenemos el array de lecciones reales del curso
        const courseLessons = course.lessons || [];
        const totalLessons = courseLessons.length;

        if (totalLessons === 0) {
          course.progress = 0;
        } else {
          // Comparamos cuántos IDs de las lecciones del curso están en las completadas del usuario
          const completedUserLessons = (userObj.completedLessons || []).map(id => id.toString());
          
          const completedInCourse = courseLessons.filter(lesson => {
            const lessonId = lesson._id ? lesson._id.toString() : lesson.toString();
            return completedUserLessons.includes(lessonId);
          }).length;

          // Calculamos el porcentaje real
          course.progress = Math.round((completedInCourse / totalLessons) * 100);
        }
      }
    } else {
      userObj.enrolledCourses = [];
    }

    res.status(200).json(userObj);
  } catch (error) {
    console.error("🔥 ERROR AL CARGAR PERFIL:", error);
    res.status(500).json({ error: 'Error al cargar el perfil' });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { lessonId } = req.body; // Recibimos el ID de la lección por el body

    // Usamos $addToSet para que si ya la completó antes, no se duplique
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { completedLessons: lessonId } },
      { new: true }
    ).select('-password');

    res.status(200).json({ 
      success: true, 
      message: '¡Lección completada!', 
      completedLessons: updatedUser.completedLessons 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar la lección como completada' });
  }
};