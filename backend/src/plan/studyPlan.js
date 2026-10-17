export const studyPlan = [
  {
    slug: 'programar',
    title: 'Programar',
    description: 'El piso. Datos, listas, condiciones y errores.',
    level: 'Básico',
    courses: [
      {
        title: 'Listas',
        description: 'Recorrer, contar y armar arrays.',
        lessons: [
          { title: 'Contar elementos', brief: 'Devolver numeros.length. Ejemplo con [10, 20, 30] = 3. Tests: [1,2,3,4] → 4, [] → 0, [9] → 1. Función contar.' },
          { title: 'Sumar una lista', brief: 'Sumar todos los números. Ejemplo [1, 2, 3] = 6. Vacía es 0. Función sumarLista. Tests distintos al ejemplo.' },
          { title: 'El primero y el último', brief: 'Devolver un array [primero, ultimo]. Lista vacía devuelve null. Función extremos.' },
        ],
      },
      {
        title: 'Condiciones',
        description: 'Decidir con if y con comparaciones.',
        lessons: [
          { title: 'Es par', brief: 'true si n % 2 === 0. Ejemplo 8 es true, 7 es false. Función esPar. Incluir 0.' },
          { title: 'El mayor de dos', brief: 'Devolver el mayor de a y b. Si son iguales, cualquiera. Función mayorDeDos. Ejemplo 4 y 9 → 9.' },
          { title: 'Nota', brief: 'Si nota >= 6, devolver "aprobado". Si no, "desaprobado". Función resultado.' },
        ],
      },
    ],
  },
  {
    slug: 'prompt-engineering',
    title: 'Prompt engineering',
    description: 'Cómo pedirle a un modelo una cosa, con el formato y los datos justos.',
    level: 'Intermedio',
    courses: [
      {
        title: 'La consigna',
        description: 'Una tarea, un formato, y el dato al final.',
        lessons: [
          { title: 'Una sola tarea', brief: 'Función consigna(texto) que devuelve "Resumí en una oración: " + texto. Una sola tarea, no tres.' },
          { title: 'Decir el formato', brief: 'Función pedirLista(tema) que devuelve "Listá 3 riesgos, uno por línea: " + tema.' },
          { title: 'El dato al final', brief: 'Función clasificar(mail) que pone la orden arriba, línea en blanco, y "Mail: " + mail.' },
          { title: 'Si falta el dato', brief: 'Función extraerFecha(texto) que pide la fecha y dice responder "no está" si no aparece.' },
        ],
      },
      {
        title: 'Salida útil',
        description: 'Ejemplos y un formato que otro programa pueda leer.',
        lessons: [
          { title: 'Un ejemplo', brief: 'Función conEjemplo(tema) con un ejemplo fijo clima → informativo y después el tema.' },
          { title: 'Pedir JSON', brief: 'Función pedirJson(texto) que pide solo JSON con claves nombre y edad.' },
          { title: 'Campos permitidos', brief: 'Función campos(texto) que lista las claves permitidas y dice ignorar el resto.' },
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
        lessons: [
          { title: 'El mensaje', brief: 'Función mensajes(pedido) que devuelve [{role:system, content:"Respondé en una oración."}, {role:user, content:pedido}].' },
          { title: 'Temperatura baja', brief: 'Función temperatura(tarea): 0 si es "extraer", 0.7 si es "escribir".' },
          { title: 'La herramienta', brief: 'Función herramienta(pedido): "get_clima" si habla del clima, null si no.' },
        ],
      },
      {
        title: 'Evaluar',
        description: 'Saber si la respuesta sirve.',
        lessons: [
          { title: 'Coincide el campo', brief: 'Función tieneCampo(obj, clave) que devuelve true si el objeto tiene esa clave. Ejemplo distinto a los tests.' },
          { title: 'Está en la lista', brief: 'Función esValido(valor, permitidos) true si valor está en el array. Si no, false.' },
        ],
      },
    ],
  },
];

export function flattenPlan() {
  const items = [];
  for (const path of studyPlan) {
    for (const course of path.courses) {
      for (const lesson of course.lessons) {
        items.push({
          path,
          course,
          lesson,
          key: `${path.slug}:${course.title}:${lesson.title}`,
        });
      }
    }
  }
  return items;
}
