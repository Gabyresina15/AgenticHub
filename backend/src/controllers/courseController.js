import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

// 1. Obtener todos los cursos (con sus lecciones pobladas)
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('lessons');
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("❌ Error al obtener los cursos:", error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

// 2. Crear un nuevo curso
export const createCourse = async (req, res) => {
  try {
    const { title, description, level } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "El título del curso es obligatorio" });
    }

    const newCourse = new Course({
      title,
      description,
      level: level || 'Básico',
      lessons: []
    });

    await newCourse.save();
    console.log(`✅ Curso creado exitosamente: ${title}`);
    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    console.error("❌ Error al crear el curso:", error);
    res.status(500).json({ error: "Error al crear el curso" });
  }
};

// 3. Obtener un curso específico por ID con sus lecciones
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('lessons');
    
    if (!course) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("❌ Error al obtener el curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

export const addLessonToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    if (!course.lessons.includes(lessonId)) {
      course.lessons.push(lessonId);
      await course.save();

      // 🔑 CLAVE: Actualizamos la lección para que guarde el ID del curso al que pertenece
      await Lesson.findByIdAndUpdate(lessonId, { course: courseId });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("🔥 Error al vincular lección:", error);
    res.status(500).json({ error: 'Error al vincular' });
  }
};

// Actualizar curso
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { title, description, level },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("🔥 Error al actualizar curso:", error);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

// Eliminar curso
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(id);
    
    if (!deletedCourse) return res.status(404).json({ error: 'Curso no encontrado' });
    
    res.status(200).json({ success: true, message: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error("🔥 Error al eliminar curso:", error);
    res.status(500).json({ error: 'Error al eliminar el curso' });
  }
};

// Desvincular una lección de un curso
export const removeLessonFromCourse = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    // Sacamos la lección del array usando $pull de Mongoose
    await Course.findByIdAndUpdate(courseId, {
      $pull: { lessons: lessonId }
    });

    // Opcional: Si querés limpiar el campo 'course' de la lección para que quede libre
    await Lesson.findByIdAndUpdate(lessonId, { $unset: { course: "" } });

    res.status(200).json({ success: true, message: 'Lección desvinculada correctamente' });
  } catch (error) {
    console.error("🔥 Error al desvincular lección:", error);
    res.status(500).json({ error: 'Error al desvincular la lección' });
  }
};