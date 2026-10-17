import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Path from '../models/Path.js';
import { runCuratorAgent } from '../ai/agents/curatorAgent.js';
import { flattenPlan } from '../plan/studyPlan.js';
import { sendContract } from '../utils/apiResponse.js';

async function ensureCourse(pathSpec, courseSpec) {
  let course = await Course.findOne({ title: courseSpec.title });
  if (!course) {
    course = await Course.create({
      title: courseSpec.title,
      description: courseSpec.description,
      level: pathSpec.level,
      language: 'javascript',
      track: pathSpec.slug,
      published: true,
      lessons: [],
    });
  }
  return course;
}

export const generateNext = async (req, res) => {
  const startedAt = Date.now();
  try {
    for (const item of flattenPlan()) {
      const course = await ensureCourse(item.path, item.course);
      const existing = await Lesson.findOne({ courseId: course._id, title: item.lesson.title });
      if (existing) continue;

      const result = await runCuratorAgent({
        message: `${item.lesson.title}. ${item.lesson.brief} Lenguaje: javascript. El ejemplo del howToSolve tiene que usar otros datos que los tests.`,
        context: [],
      });
      const lesson = await Lesson.create({
        title: item.lesson.title,
        contentMarkdown: result.lesson.contentMarkdown,
        teaches: result.lesson.teaches || '',
        howToSolve: result.lesson.howToSolve || '',
        lessonType: 'reto_codigo',
        quizData: result.lesson.quizData,
        challenge: result.lesson.challenge,
        status: 'published',
        courseId: course._id,
        order: course.lessons.length + 1,
      });
      course.lessons.push(lesson._id);
      await course.save();

      const path = await Path.findOne({ slug: item.path.slug });
      const courseIds = path?.courses?.map(String) || [];
      if (!courseIds.includes(String(course._id))) {
        await Path.updateOne(
          { slug: item.path.slug },
          {
            slug: item.path.slug,
            title: item.path.title,
            description: item.path.description,
            level: item.path.level,
            $addToSet: { courses: course._id },
          },
          { upsert: true }
        );
      }

      return sendContract(res, {
        httpStatus: 201,
        status: 'ok',
        data: { path: item.path.title, course: course.title, lesson },
        agentUsed: 'curator',
        startedAt,
      });
    }

    return sendContract(res, {
      httpStatus: 200,
      status: 'ok',
      data: { message: 'El plan ya está completo.' },
      agentUsed: 'curator',
      startedAt,
    });
  } catch (error) {
    console.error('Error al generar la siguiente lección:', error);
    return sendContract(res, {
      httpStatus: 500,
      status: 'error',
      data: { message: error.message || 'No se pudo generar la lección' },
      agentUsed: 'curator',
      startedAt,
    });
  }
};
