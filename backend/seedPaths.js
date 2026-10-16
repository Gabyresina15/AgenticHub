import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Course from './src/models/Course.js';
import Lesson from './src/models/Lesson.js';
import Path from './src/models/Path.js';

const paths = [
  {
    slug: 'prompt-engineering',
    title: 'Prompt engineering',
    description: 'Cómo pedirle a un modelo una cosa, con el formato y los datos justos.',
    level: 'Intermedio',
    courses: [
      {
        title: 'La consigna',
        description: 'Una tarea, un formato, y el dato al final.',
        level: 'Intermedio',
        language: 'javascript',
        track: 'prompt-engineering',
        published: true,
        lessons: [
          {
            title: 'Una sola tarea',
            order: 1,
            contentMarkdown: 'Un prompt bueno pide una cosa. Si pedís resumen, traducción y opinión en el mismo texto, el modelo elige.\n\nEjemplo: "Resumí este texto en una oración" es una tarea. "Resumí, traducí al inglés y decime si te gusta" son tres.',
            teaches: 'Una consigna, un resultado.',
            howToSolve: 'Devolvé un texto que pida solo resumir, y que nombre el texto.',
            challenge: {
              title: 'Consigna única',
              description: 'Devolvé una consigna que pida un resumen y nada más.',
              language: 'javascript',
              initialCode: 'function consigna(texto) {\n  \n}\n',
              tests: [
                { fn: 'consigna', args: ['El modelo responde.'], expected: 'Resumí en una oración: El modelo responde.' },
                { fn: 'consigna', args: ['Hoy llueve.'], expected: 'Resumí en una oración: Hoy llueve.' },
              ],
              successMessage: 'Una tarea, clara.',
              errorMessage: 'La consigna tiene que ser exactamente: Resumí en una oración: y el texto.',
            },
          },
          {
            title: 'Decir el formato',
            order: 2,
            contentMarkdown: 'Si no decís cómo tiene que venir la respuesta, el modelo elige. "En una oración" es un formato. "Como una lista de tres ítems" es otro.\n\nEjemplo: para una lista, el prompt dice la cantidad y que cada ítem vaya en su línea.',
            teaches: 'El formato es parte de la consigna, no un deseo.',
            howToSolve: 'Devolvé: Listá 3 riesgos, uno por línea: y el tema.',
            challenge: {
              title: 'Formato',
              description: 'Pedí una lista de 3 riesgos, uno por línea.',
              language: 'javascript',
              initialCode: 'function pedirLista(tema) {\n  \n}\n',
              tests: [
                { fn: 'pedirLista', args: ['agentes'], expected: 'Listá 3 riesgos, uno por línea: agentes' },
                { fn: 'pedirLista', args: ['APIs'], expected: 'Listá 3 riesgos, uno por línea: APIs' },
              ],
              successMessage: 'El formato está dicho.',
              errorMessage: 'Tiene que decir la cantidad y que vaya uno por línea.',
            },
          },
          {
            title: 'El dato al final',
            order: 3,
            contentMarkdown: 'La instrucción va primero. El dato, después. Si mezclás el texto del usuario con la orden, es más fácil que una instrucción escondida en el dato cambie la tarea.\n\nEjemplo: "Clasificá el mail como urgente o no.\\n\\nMail: ..." separa la orden del contenido.',
            teaches: 'Orden y dato van separados.',
            howToSolve: 'Devolvé la orden, una línea en blanco, y después Mail: con el texto.',
            challenge: {
              title: 'Separar',
              description: 'Armá el prompt con la orden arriba y el mail abajo.',
              language: 'javascript',
              initialCode: 'function clasificar(mail) {\n  \n}\n',
              tests: [
                { fn: 'clasificar', args: ['Necesito esto hoy'], expected: 'Clasificá como urgente o no.\n\nMail: Necesito esto hoy' },
                { fn: 'clasificar', args: ['Cuando puedas'], expected: 'Clasificá como urgente o no.\n\nMail: Cuando puedas' },
              ],
              successMessage: 'La orden y el dato están separados.',
              errorMessage: 'La orden va primero, una línea en blanco, y después Mail: .',
            },
          },
          {
            title: 'Si falta el dato',
            order: 4,
            contentMarkdown: 'Si el modelo no tiene el dato, tiene que decirlo. Si no se lo pedís, inventa.\n\nEjemplo: "Si el texto no dice la fecha, respondé: no está. No la inventes."',
            teaches: 'Decile qué hacer cuando no sabe.',
            howToSolve: 'Devolvé la orden de extraer la fecha, y la regla de no inventar.',
            challenge: {
              title: 'No inventar',
              description: 'Pedí la fecha, y que diga "no está" si no aparece.',
              language: 'javascript',
              initialCode: 'function extraerFecha(texto) {\n  \n}\n',
              tests: [
                { fn: 'extraerFecha', args: ['Reunión el lunes'], expected: 'Extraé la fecha. Si no está, respondé: no está.\n\nTexto: Reunión el lunes' },
                { fn: 'extraerFecha', args: ['Sin fecha'], expected: 'Extraé la fecha. Si no está, respondé: no está.\n\nTexto: Sin fecha' },
              ],
              successMessage: 'Quedó dicha la regla.',
              errorMessage: 'Tiene que pedir la fecha y decir qué responder si no está.',
            },
          },
        ],
      },
      {
        title: 'Salida útil',
        description: 'Ejemplos y un formato que otro programa pueda leer.',
        level: 'Intermedio',
        language: 'javascript',
        track: 'prompt-engineering',
        published: true,
        lessons: [
          {
            title: 'Un ejemplo',
            order: 1,
            contentMarkdown: 'Un ejemplo le muestra el corte que querés. Uno basta para arrancar. Tres, si el caso es raro.\n\nEjemplo: "Tema: clima → Etiqueta: informativo" le dice que la respuesta es una etiqueta, no un párrafo.',
            teaches: 'El ejemplo enseña el formato mejor que una explicación larga.',
            howToSolve: 'Devolvé la orden, un ejemplo fijo, y después el tema nuevo.',
            challenge: {
              title: 'Con ejemplo',
              description: 'Incluí un ejemplo y después el tema a clasificar.',
              language: 'javascript',
              initialCode: 'function conEjemplo(tema) {\n  \n}\n',
              tests: [
                { fn: 'conEjemplo', args: ['el dólar'], expected: 'Clasificá el tema.\nEjemplo: clima → informativo\n\nTema: el dólar' },
                { fn: 'conEjemplo', args: ['un gol'], expected: 'Clasificá el tema.\nEjemplo: clima → informativo\n\nTema: un gol' },
              ],
              successMessage: 'El ejemplo está antes del dato.',
              errorMessage: 'Tiene que tener el ejemplo fijo y después el tema.',
            },
          },
          {
            title: 'Pedir JSON',
            order: 2,
            contentMarkdown: 'Si otro programa va a leer la respuesta, pedí JSON. Decí las claves. No pidas "algo estructurado": eso no es un contrato.\n\nEjemplo: {"nombre": "", "edad": 0}',
            teaches: 'Un contrato de salida tiene claves, no una vibra.',
            howToSolve: 'Devolvé la orden de responder solo JSON con nombre y edad.',
            challenge: {
              title: 'JSON',
              description: 'Pedí un JSON con nombre y edad, y nada más.',
              language: 'javascript',
              initialCode: 'function pedirJson(texto) {\n  \n}\n',
              tests: [
                { fn: 'pedirJson', args: ['Ana tiene 20'], expected: 'Respondé solo JSON con las claves nombre y edad.\n\nTexto: Ana tiene 20' },
                { fn: 'pedirJson', args: ['Leo, 31'], expected: 'Respondé solo JSON con las claves nombre y edad.\n\nTexto: Leo, 31' },
              ],
              successMessage: 'El contrato está dicho.',
              errorMessage: 'Tiene que pedir solo JSON y nombrar las dos claves.',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'ai-engineering',
    title: 'AI engineering',
    description: 'De un prompt a un sistema: llamada, salida, herramienta.',
    level: 'Intermedio',
    courses: [
      {
        title: 'La llamada',
        description: 'Qué le mandás a un modelo y qué te devuelve.',
        level: 'Intermedio',
        language: 'javascript',
        track: 'ai-engineering',
        published: true,
        lessons: [
          {
            title: 'El mensaje',
            order: 1,
            contentMarkdown: 'Una llamada manda una lista de mensajes. Cada uno tiene un rol y un texto.\n\nEl system dice las reglas. El user trae el pedido. No mezcles las reglas en el pedido del usuario si las podés separar.',
            teaches: 'System es la regla. User es el pedido.',
            howToSolve: 'Devolvé un array con dos objetos: system y user.',
            challenge: {
              title: 'Mensajes',
              description: 'Armá los dos mensajes.',
              language: 'javascript',
              initialCode: 'function mensajes(pedido) {\n  \n}\n',
              tests: [
                { fn: 'mensajes', args: ['Resumí esto'], expected: [{ role: 'system', content: 'Respondé en una oración.' }, { role: 'user', content: 'Resumí esto' }] },
                { fn: 'mensajes', args: ['Traducí'], expected: [{ role: 'system', content: 'Respondé en una oración.' }, { role: 'user', content: 'Traducí' }] },
              ],
              successMessage: 'Los roles están separados.',
              errorMessage: 'Tiene que ser un array: primero system, después user.',
            },
          },
          {
            title: 'Temperatura baja',
            order: 2,
            contentMarkdown: 'La temperatura dice cuánto puede variar la respuesta. Para extraer un dato, baja. Para escribir variantes, más alta.\n\nEjemplo: extraer un mail no necesita creatividad. 0 o 0.2.',
            teaches: 'Dato fijo, temperatura baja.',
            howToSolve: 'Devolvé 0 si la tarea es extraer. Si no, 0.7.',
            challenge: {
              title: 'Temperatura',
              description: 'Elegí la temperatura según la tarea.',
              language: 'javascript',
              initialCode: 'function temperatura(tarea) {\n  \n}\n',
              tests: [
                { fn: 'temperatura', args: ['extraer'], expected: 0 },
                { fn: 'temperatura', args: ['escribir'], expected: 0.7 },
              ],
              successMessage: 'La temperatura coincide con la tarea.',
              errorMessage: 'Extraer es 0. Escribir es 0.7.',
            },
          },
          {
            title: 'La herramienta',
            order: 3,
            contentMarkdown: 'Una herramienta es una función que el modelo puede pedir. El modelo no la ejecuta. Tu código sí.\n\nEjemplo: get_clima(ciudad). El modelo dice el nombre y los argumentos. Vos corrés la función y le devolvés el resultado.',
            teaches: 'El modelo pide. El código ejecuta.',
            howToSolve: 'Devolvé el nombre de la herramienta si el pedido habla del clima. Si no, null.',
            challenge: {
              title: 'Elegir herramienta',
              description: 'Decidí si hace falta get_clima.',
              language: 'javascript',
              initialCode: 'function herramienta(pedido) {\n  \n}\n',
              tests: [
                { fn: 'herramienta', args: ['¿Llueve en Salta?'], expected: 'get_clima' },
                { fn: 'herramienta', args: ['Contame un chiste'], expected: null },
              ],
              successMessage: 'Elegiste bien.',
              errorMessage: 'Solo el clima usa get_clima. El resto es null.',
            },
          },
        ],
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
    created.push(await Lesson.create({ ...item, lessonType: 'reto_codigo', status: 'published' }));
  }
  const course = await Course.create({
    title: spec.title,
    description: spec.description,
    level: spec.level,
    language: spec.language,
    track: spec.track,
    published: true,
    lessons: created.map((lesson) => lesson._id),
  });
  await Lesson.updateMany({ _id: { $in: course.lessons } }, { courseId: course._id });
  return course;
}

async function seedPaths() {
  await connectDB();
  for (const pathSpec of paths) {
    const courses = [];
    for (const courseSpec of pathSpec.courses) courses.push(await replaceCourse(courseSpec));
    await Path.updateOne(
      { slug: pathSpec.slug },
      {
        slug: pathSpec.slug,
        title: pathSpec.title,
        description: pathSpec.description,
        level: pathSpec.level,
        courses: courses.map((course) => course._id),
      },
      { upsert: true }
    );
    console.log(`${pathSpec.title}: ${courses.length} cursos.`);
  }
  await mongoose.disconnect();
}

seedPaths().catch(async (error) => {
  console.error('Seed de rutas fallo:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
