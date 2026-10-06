import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// 1. Obtener todas las lecciones que están en estado 'draft'
export const getDrafts = async (req, res) => {
  try {
    // Hacemos lo mismo acá por si lo tenía el panel admin
    const drafts = await Lesson.find({ status: 'draft' }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: drafts });
  } catch (error) {
    console.error("❌ Error al obtener borradores:", error);
    res.status(500).json({ error: "Error al obtener los borradores" });
  }
};

// 2. Cambiar el estado de una lección de 'draft' a 'published'
export const publishLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { status: 'published' },
      { returnDocument: 'after' } // Adiós advertencia de Mongoose
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Lección no encontrada.' });
    }

    res.status(200).json({
      message: '¡Lección publicada exitosamente!',
      data: lesson
    });
  } catch (error) {
    console.error('❌ Error al publicar la lección:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// 3. Obtener todas las lecciones que ya están publicadas (para consumo final)
export const getPublishedLessons = async (req, res) => {
  try {
    // Quitamos el .populate('topicId') porque ya no existe en el esquema nuevo
    const lessons = await Lesson.find({ status: 'published' }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    console.error("❌ Error al obtener lecciones publicadas:", error);
    res.status(500).json({ error: "Error al obtener las lecciones" });
  }
}

export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    console.error("❌ Error al obtener la lección:", error);
    res.status(500).json({ error: "Error al obtener la lección" });
  }
}

export const createManualLesson = async (req, res) => {
  try {
    // 👇 ACÁ FALTABA EXTRAER EL CHALLENGE
    const { title, content, videoUrl, status, challenge } = req.body;

    const newLesson = await Lesson.create({
      title,
      contentMarkdown: content, 
      videoUrl: videoUrl || '',
      status: status || 'published',
      challenge: challenge || null // 👇 ACÁ LO GUARDAMOS EN LA BASE DE DATOS
    });

    res.status(201).json({ success: true, data: newLesson });
  } catch (error) {
    console.error("🔥 ERROR AL CREAR LECCIÓN:", error);
    res.status(500).json({ error: 'Error al crear la lección manualmente' });
  }
};

// Actualizar lección
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    // 👇 1. Extraemos el 'challenge' del body que manda el frontend
    const { title, content, videoUrl, challenge } = req.body;

    // Actualizamos tanto content como contentMarkdown por compatibilidad
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      { 
        title, 
        content, 
        contentMarkdown: content, 
        videoUrl,
        // 👇 2. Le decimos a Mongoose que también actualice el reto
        challenge: challenge !== undefined ? challenge : null
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    res.status(200).json({ success: true, data: updatedLesson });
  } catch (error) {
    console.error("🔥 Error al actualizar lección:", error);
    res.status(500).json({ error: 'Error al actualizar la lección' });
  }
};

// Eliminar lección por completo
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLesson = await Lesson.findByIdAndDelete(id);
    
    if (!deletedLesson) return res.status(404).json({ error: 'Lección no encontrada' });
    
    // Opcional pero recomendado: sacarla también del array de lecciones del curso si estaba vinculada
    await Course.updateMany(
      { lessons: id },
      { $pull: { lessons: id } }
    );

    res.status(200).json({ success: true, message: 'Lección eliminada correctamente' });
  } catch (error) {
    console.error("🔥 Error al eliminar lección:", error);
    res.status(500).json({ error: 'Error al eliminar la lección' });
  }
};