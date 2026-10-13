import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Course from "./src/models/Course.js";
import Lesson from "./src/models/Lesson.js";
import Post from "./src/models/Post.js";
import Path from "./src/models/Path.js";

dotenv.config();

const COURSE_TITLE = "Logica de programacion";

const lessons = [
  {
    title: "Sumar dos numeros",
    order: 1,
    contentMarkdown: "Una funcion recibe datos y devuelve un resultado. No imprime: el runner mira el return.\n\nEjemplo, con otros numeros que los del reto: sumar(10, 4) tiene que devolver 14. Adentro de la funcion eso es return 10 + 4.",
    teaches: "El nombre de la funcion es el contrato. Los argumentos entran, el return sale.",
    howToSolve: "En el hueco de sumar escribi return a + b. No uses console.log: el test no lee la consola.",
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
    contentMarkdown: "Un numero es par si el resto de dividirlo por 2 es 0. 8 % 2 es 0, 7 % 2 es 1.\n\nEjemplo: de [5, 6, 7, 8] tienen que salir [6, 8]. Recorres la lista, y si el numero es par lo guardas en un array nuevo. El original no se toca.",
    teaches: "Filter o un bucle hacen lo mismo: arman otra lista con los que pasan la condicion.",
    howToSolve: "Crea un array vacio. Recorre numeros. Si n % 2 === 0, metelo en el nuevo. Al final, return de ese array.",
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
    contentMarkdown: "El mayor es el numero mas grande de la lista. No alcanza con mirar el primero: hay que compararlos todos.\n\nEjemplo, distinto al del reto: en [4, 1, 7] el mayor es 7. Arrancas guardando 4. Comparas con 1, sigue 4. Comparas con 7, ahora es 7. Si la lista esta vacia, no hay mayor: se devuelve null.",
    teaches: "Un maximo se encuentra comparando cada elemento con el mayor visto hasta ahora.",
    howToSolve: "Si numeros.length es 0, return null. Si no, guarda el primero y recorre el resto. Cuando encuentres uno mas grande, reemplazalo. Al terminar, return de ese valor.",
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
    language: "javascript",
    track: "logica",
    lessons: created.map((lesson) => lesson._id),
  });
  await Lesson.updateMany(
    { _id: { $in: course.lessons } },
    { courseId: course._id }
  );

  const posts = [
    {
      title: "AgenticHub ya corre retos de verdad",
      tag: "Avance",
      summary: "El editor llama a la función y compara el return. Python y JavaScript corren en local.",
      body: "Dejamos de comparar texto impreso. El alumno escribe la función, el runner la llama con los casos y guarda la lección como completada.\n\nExplorar queda para novedades. Las lecciones viven en los cursos.",
    },
    {
      title: "Qué está pasando con los agentes en 2026",
      tag: "IA",
      summary: "Menos demos, más sistemas que hacen un trabajo concreto.",
      body: "La novedad no es otro chatbot. Es un sistema con un router, herramientas y un contrato de salida.\n\nEso es lo que estamos construyendo: agentes que automatizan trabajo real, y una academia para aprender a armarlos.",
    },
  ];
  for (const post of posts) {
    await Post.updateOne({ title: post.title }, post, { upsert: true });
  }

  await Path.updateOne(
    { slug: "logica" },
    {
      slug: "logica",
      title: "Lógica de programación",
      description: "Funciones, listas y condiciones. El primer tramo, en JavaScript.",
      level: "Básico",
      courses: [course._id],
    },
    { upsert: true }
  );
  await mongoose.disconnect();
}

seedPractice().catch(async (error) => {
  console.error("Seed de practica fallo:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
