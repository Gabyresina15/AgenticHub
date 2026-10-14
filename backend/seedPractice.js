import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Course from "./src/models/Course.js";
import Lesson from "./src/models/Lesson.js";
import Post from "./src/models/Post.js";
import Path from "./src/models/Path.js";

dotenv.config();

const courses = [
  {
    title: "Funciones y datos",
    description: "El primer curso de Programar. Una función recibe datos y devuelve un resultado.",
    level: "Básico",
    language: "javascript",
    track: "programar",
    published: true,
    lessons: [
      {
        title: "Devolver una suma",
        order: 1,
        contentMarkdown: "Una función recibe datos y devuelve un resultado. El runner no lee la consola: mira el return.\n\nEjemplo, con otros números que los del reto: sumar(10, 4) devuelve 14. Adentro eso es return 10 + 4.",
        teaches: "Los argumentos entran. El return sale. console.log no cuenta.",
        howToSolve: "En el hueco de sumar escribí return a + b.",
        challenge: {
          title: "Sumar",
          description: "Devolvé la suma de los dos números.",
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
        title: "Multiplicar",
        order: 2,
        contentMarkdown: "Multiplicar es el mismo contrato que sumar, con otro operador.\n\nEjemplo: multiplicar(6, 7) devuelve 42. Si uno de los dos es 0, el resultado es 0.",
        teaches: "El operador cambia. La forma de la función no.",
        howToSolve: "Devolvé a * b.",
        challenge: {
          title: "Producto",
          description: "Devolvé el producto de los dos números.",
          language: "javascript",
          initialCode: "function multiplicar(a, b) {\n  \n}\n",
          tests: [
            { fn: "multiplicar", args: [3, 4], expected: 12 },
            { fn: "multiplicar", args: [5, 0], expected: 0 },
            { fn: "multiplicar", args: [-2, 8], expected: -16 },
          ],
          successMessage: "El producto es correcto.",
          errorMessage: "El return no es el producto.",
        },
      },
      {
        title: "Saludar",
        order: 3,
        contentMarkdown: "Una función también puede devolver texto. El texto se arma uniendo partes.\n\nEjemplo: saludar('Ana') devuelve 'Hola, Ana'. La coma y el espacio van en el texto fijo, no en el nombre.",
        teaches: "Un string se concatena con +. Las comillas marcan texto, no código.",
        howToSolve: "Devolvé 'Hola, ' + nombre.",
        challenge: {
          title: "Saludo",
          description: "Devolvé Hola, seguido del nombre.",
          language: "javascript",
          initialCode: "function saludar(nombre) {\n  \n}\n",
          tests: [
            { fn: "saludar", args: ["Leo"], expected: "Hola, Leo" },
            { fn: "saludar", args: ["Mora"], expected: "Hola, Mora" },
            { fn: "saludar", args: [""], expected: "Hola, " },
          ],
          successMessage: "El saludo es correcto.",
          errorMessage: "El texto no coincide. Revisá la coma y el espacio.",
        },
      },
      {
        title: "Es mayor de edad",
        order: 4,
        contentMarkdown: "A veces el resultado no es un número ni un texto. Es sí o no: true o false.\n\nEjemplo: esMayor(20) es true, porque 20 es al menos 18. esMayor(17) es false. El 18 cuenta como mayor.",
        teaches: "Un booleano es una respuesta de sí o no. >= incluye el número del límite.",
        howToSolve: "Devolvé true si edad es mayor o igual a 18. Si no, false.",
        challenge: {
          title: "Mayor",
          description: "Devolvé true si la edad es 18 o más.",
          language: "javascript",
          initialCode: "function esMayor(edad) {\n  \n}\n",
          tests: [
            { fn: "esMayor", args: [21], expected: true },
            { fn: "esMayor", args: [18], expected: true },
            { fn: "esMayor", args: [15], expected: false },
          ],
          successMessage: "La comprobación es correcta.",
          errorMessage: "Ese no es el resultado. El 18 tiene que dar true.",
        },
      },
      {
        title: "Nombre completo",
        order: 5,
        contentMarkdown: "Podés unir más de un dato. El espacio entre nombre y apellido no viene en los argumentos: lo ponés vos.\n\nEjemplo: nombreCompleto('Ada', 'Lovelace') devuelve 'Ada Lovelace'.",
        teaches: "Varios argumentos se combinan en un solo return.",
        howToSolve: "Devolvé nombre + ' ' + apellido.",
        challenge: {
          title: "Nombre",
          description: "Devolvé el nombre y el apellido separados por un espacio.",
          language: "javascript",
          initialCode: "function nombreCompleto(nombre, apellido) {\n  \n}\n",
          tests: [
            { fn: "nombreCompleto", args: ["Juan", "Paz"], expected: "Juan Paz" },
            { fn: "nombreCompleto", args: ["Lia", "Suarez"], expected: "Lia Suarez" },
            { fn: "nombreCompleto", args: ["Sol", "Rios"], expected: "Sol Rios" },
          ],
          successMessage: "El nombre está bien armado.",
          errorMessage: "Falta el espacio, o el orden no es nombre y después apellido.",
        },
      },
      {
        title: "Precio con descuento",
        order: 6,
        contentMarkdown: "Una función puede hacer una cuenta con los datos que recibe.\n\nEjemplo: con descuento de 10 sobre 200, se resta 20. 200 * 10 / 100 es 20, y 200 - 20 es 180. El precio es el primero. El descuento es un porcentaje.",
        teaches: "Podés usar los argumentos en una cuenta de más de un paso.",
        howToSolve: "Calculá el monto del descuento: precio * porcentaje / 100. Devolvé precio menos ese monto.",
        challenge: {
          title: "Descuento",
          description: "Devolvé el precio después de restar el porcentaje.",
          language: "javascript",
          initialCode: "function conDescuento(precio, porcentaje) {\n  \n}\n",
          tests: [
            { fn: "conDescuento", args: [100, 20], expected: 80 },
            { fn: "conDescuento", args: [50, 0], expected: 50 },
            { fn: "conDescuento", args: [80, 25], expected: 60 },
          ],
          successMessage: "El precio final es correcto.",
          errorMessage: "El descuento no está bien aplicado.",
        },
      },
    ],
  },
  {
    title: "Listas",
    description: "Recorrer, contar y armar arrays. El segundo tramo.",
    level: "Básico",
    language: "javascript",
    published: true,
    lessons: [
      {
        title: "Contar elementos",
        order: 1,
        contentMarkdown: "Una lista tiene una cantidad de elementos. En JavaScript eso es numeros.length.\n\nEjemplo: [10, 20, 30] tiene 3 elementos. Una lista vacia tiene 0.",
        teaches: "length es el tamaño de la lista, no el ultimo valor.",
        howToSolve: "Devolve numeros.length. No hace falta recorrerlo.",
        challenge: {
          title: "Contar",
          description: "Devolve cuantos elementos tiene la lista.",
          language: "javascript",
          initialCode: "function contar(numeros) {\n  \n}\n",
          tests: [
            { fn: "contar", args: [[1, 2, 3, 4]], expected: 4 },
            { fn: "contar", args: [[]], expected: 0 },
            { fn: "contar", args: [[9]], expected: 1 },
          ],
          successMessage: "El conteo es correcto.",
          errorMessage: "Ese no es el tamaño de la lista.",
        },
      },
      {
        title: "Sumar una lista",
        order: 2,
        contentMarkdown: "Sumar una lista es ir acumulando. No es sumar dos numeros: son varios.\n\nEjemplo: [2, 2, 2] suma 6. Arrancas en 0, sumas 2, quedas en 2, sumas 2, quedas en 4, sumas 2, quedas en 6.",
        teaches: "Un acumulador guarda el resultado parcial mientras recorres.",
        howToSolve: "Crea una variable total en 0. Recorre la lista y suma cada numero a total. Return de total.",
        challenge: {
          title: "Suma",
          description: "Devolve la suma de todos los numeros.",
          language: "javascript",
          initialCode: "function sumarLista(numeros) {\n  \n}\n",
          tests: [
            { fn: "sumarLista", args: [[1, 2, 3]], expected: 6 },
            { fn: "sumarLista", args: [[10, -2]], expected: 8 },
            { fn: "sumarLista", args: [[]], expected: 0 },
          ],
          successMessage: "La suma de la lista es correcta.",
          errorMessage: "La suma no coincide.",
        },
      },
    ],
  },
  {
    title: "Funciones",
    description: "Una funcion que usa lo que ya sabes. El cierre de la ruta.",
    level: "Básico",
    language: "javascript",
    published: true,
    lessons: [
      {
        title: "Promedio",
        order: 1,
        contentMarkdown: "El promedio es la suma dividida por la cantidad. Si no hay elementos, no hay promedio.\n\nEjemplo: [2, 4, 6] suma 12 y tiene 3 elementos. 12 / 3 es 4. Una lista vacia devuelve null.",
        teaches: "Podes combinar la suma y el conteo en una sola funcion.",
        howToSolve: "Si la lista esta vacia, return null. Si no, suma los numeros, dividi por numeros.length y devolvé eso.",
        challenge: {
          title: "Promedio",
          description: "Devolve el promedio, o null si la lista esta vacia.",
          language: "javascript",
          initialCode: "function promedio(numeros) {\n  \n}\n",
          tests: [
            { fn: "promedio", args: [[10, 20]], expected: 15 },
            { fn: "promedio", args: [[3, 3, 6]], expected: 4 },
            { fn: "promedio", args: [[]], expected: null },
          ],
          successMessage: "El promedio es correcto.",
          errorMessage: "El promedio no coincide.",
        },
      },
      {
        title: "Esta vacia",
        order: 2,
        contentMarkdown: "A veces no queres el contenido: queres saber si hay algo. Una lista vacia es la que tiene length 0.\n\nEjemplo: [] esta vacia, devuelve true. [1] no esta vacia, devuelve false.",
        teaches: "Un booleano es una respuesta de si o no, no un numero.",
        howToSolve: "Devolve true si numeros.length es 0. Si no, false.",
        challenge: {
          title: "Vacia",
          description: "Devolve true si la lista no tiene elementos.",
          language: "javascript",
          initialCode: "function estaVacia(numeros) {\n  \n}\n",
          tests: [
            { fn: "estaVacia", args: [[]], expected: true },
            { fn: "estaVacia", args: [[1, 2]], expected: false },
            { fn: "estaVacia", args: [[0]], expected: false },
          ],
          successMessage: "La comprobacion es correcta.",
          errorMessage: "Ese no es el resultado.",
        },
      },
    ],
  },
];

async function replaceCourse(spec) {
  const old = await Course.findOne({ title: spec.title });
  if (old) {
    await Lesson.deleteMany({ _id: { $in: old.lessons } });
    await Course.deleteOne({ _id: old._id });
  }
  const created = [];
  for (const item of spec.lessons) {
    created.push(await Lesson.create({ ...item, lessonType: "reto_codigo", status: "published" }));
  }
  const course = await Course.create({
    title: spec.title,
    description: spec.description,
    level: spec.level,
    language: spec.language,
    track: spec.track,
    published: spec.published,
    lessons: created.map((lesson) => lesson._id),
  });
  await Lesson.updateMany({ _id: { $in: course.lessons } }, { courseId: course._id });
  return course;
}

async function seedPractice() {
  await connectDB();
  const saved = [];
  for (const spec of courses) saved.push(await replaceCourse(spec));
  await Course.updateMany(
    { _id: { $nin: saved.map((course) => course._id) } },
    { published: false }
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
  for (const post of posts) await Post.updateOne({ title: post.title }, post, { upsert: true });

  await Path.updateOne(
    { slug: "programar" },
    {
      slug: "programar",
      title: "Programar",
      description: "El piso. Funciones y datos, después listas, después combinarlas.",
      level: "Básico",
      courses: saved.map((course) => course._id),
    },
    { upsert: true }
  );
  await Path.deleteOne({ slug: "logica" });
  console.log(`Ruta lista con ${saved.length} cursos.`);
  await mongoose.disconnect();
}

seedPractice().catch(async (error) => {
  console.error("Seed de practica fallo:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
