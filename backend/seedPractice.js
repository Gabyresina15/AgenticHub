import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Course from "./src/models/Course.js";
import Lesson from "./src/models/Lesson.js";

dotenv.config();

const COURSE_TITLE = "Logica de programacion";

const lessons = [
  {
    title: "Sumar dos numeros",
    order: 1,
    contentMarkdown: "# Sumar dos numeros\n\nUna funcion pura recibe datos y devuelve un resultado. No imprime: retorna.",
    teaches: "Una funcion recibe argumentos y devuelve un valor. El runner compara ese return, no lo que imprimis.",
    howToSolve: "Dentro de sumar, devolvé a + b. No hace falta console.log.",
    challenge: {
      title: "Sumar",
      description: "Devolve la suma de los dos numeros.",
      language: "javascript",
      initialCode: "function sumar(a, b) {\n  \n}\n",
      tests: [
        { fn: "sumar", args: [2, 3], expected: 5 },
        { fn: "sumar", args: [-1, 4], expected: 3 },
        { fn: "sumar", args: [0, 0], expected: 0 },
      ],
      successMessage: "La suma es correcta.",
      errorMessage: "El return no coincide con la suma.",
    },
  },
  {
    title: "Filtrar numeros pares",
    order: 2,
    contentMarkdown: "# Pares\n\n`filter` arma un array nuevo con los elementos que pasan una condicion.",
    teaches: "Un numero es par si el resto de dividirlo por 2 es 0. Podes recorrerlo con filter o con un bucle.",
    howToSolve: "Devolvé un array nuevo, solo con los numeros donde n % 2 === 0. No modifiques el original.",
    challenge: {
      title: "Pares",
      description: "Devolve un array solo con los numeros pares.",
      language: "javascript",
      initialCode: "function pares(numeros) {\n  \n}\n",
      tests: [
        { fn: "pares", args: [[1, 2, 3, 4]], expected: [2, 4] },
        { fn: "pares", args: [[1, 3, 5]], expected: [] },
        { fn: "pares", args: [[0, -2, 7]], expected: [0, -2] },
      ],
      successMessage: "El filtro es correcto.",
      errorMessage: "El array devuelto no tiene solo los pares.",
    },
  },
  {
    title: "El mayor de una lista",
    order: 3,
    contentMarkdown: "# Maximo\n\nRecorré la lista y conservá el mayor valor visto.",
    teaches: "Para encontrar un maximo hay que mirar todos los elementos. Una lista vacia no tiene mayor.",
    howToSolve: "Si numeros esta vacio, devolvé null. Si no, recorrelo y quedate con el mayor.",
    challenge: {
      title: "Maximo",
      description: "Devolve el numero mas grande, o null si no hay elementos.",
      language: "javascript",
      initialCode: "function mayor(numeros) {\n  \n}\n",
      tests: [
        { fn: "mayor", args: [[3, 9, 2]], expected: 9 },
        { fn: "mayor", args: [[-5, -1, -8]], expected: -1 },
        { fn: "mayor", args: [[]], expected: null },
      ],
      successMessage: "Encontraste el mayor.",
      errorMessage: "Ese no es el mayor de la lista.",
    },
  },
];

async function seedPractice() {
  await connectDB();
  const old = await Course.findOne({ title: COURSE_TITLE });
  if (old) {
    await Lesson.deleteMany({ _id: { $in: old.lessons } });
    await Course.deleteOne({ _id: old._id });
  }

  const created = [];
  for (const item of lessons) {
    created.push(await Lesson.create({
      ...item,
      lessonType: "reto_codigo",
      status: "published",
    }));
  }
  const course = await Course.create({
    title: COURSE_TITLE,
    description: "Ruta fija para probar el editor, los tests y el progreso. No usa Gemini.",
    level: "Básico",
    lessons: created.map((lesson) => lesson._id),
  });
  await Lesson.updateMany(
    { _id: { $in: course.lessons } },
    { courseId: course._id }
  );

  console.log(`Curso listo: ${course.title} (${created.length} lecciones).`);
  await mongoose.disconnect();
}

seedPractice().catch(async (error) => {
  console.error("Seed de practica fallo:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
