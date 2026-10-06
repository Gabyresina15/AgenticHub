import { z } from "zod";

export function toolErrorPayload(error) {
  if (error instanceof z.ZodError) {
    const details = error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    return {
      ok: false,
      error: `PARAMETROS_INVALIDOS: ${details}. Reenvia solo los campos del esquema, sin propiedades inventadas.`,
    };
  }
  return {
    ok: false,
    error: `ERROR_HERRAMIENTA: ${error.message || "fallo desconocido"}`,
  };
}

export async function runTool(tool, rawArgs) {
  try {
    const args = tool.schema.parse(rawArgs ?? {});
    return await tool.execute(args);
  } catch (error) {
    return toolErrorPayload(error);
  }
}
