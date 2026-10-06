import { z } from "zod";

const clients = {
  acme: {
    client_id: "cli_acme",
    name: "Acme SA",
    plan: "growth",
    seats: 12,
    city: "Salta",
    hourly_rate: 85,
  },
  norte: {
    client_id: "cli_norte",
    name: "Norte Logistica",
    plan: "starter",
    seats: 4,
    city: "Salta",
    hourly_rate: 70,
  },
  andes: {
    client_id: "cli_andes",
    name: "Andes Energia",
    plan: "enterprise",
    seats: 40,
    city: "Jujuy",
    hourly_rate: 110,
  },
};

export const getClientDataSchema = z
  .object({
    client_id: z.string().min(1),
  })
  .strict();

export const calculateBudgetSchema = z
  .object({
    hours: z.number().positive(),
    hourly_rate: z.number().positive(),
    discount: z.number().min(0).max(0.3).optional(),
  })
  .strict();

export function getClientData(args) {
  const key = String(args.client_id).trim().toLowerCase();
  const client =
    clients[key] ||
    Object.values(clients).find((item) => item.client_id === key);
  if (!client) {
    return {
      ok: false,
      error: `Cliente no encontrado: ${args.client_id}. Ids validos: acme, norte, andes.`,
    };
  }
  return { ok: true, client };
}

export function calculateBudget(args) {
  const discount = args.discount ?? 0;
  const subtotal = args.hours * args.hourly_rate;
  const total = Number((subtotal * (1 - discount)).toFixed(2));
  return {
    ok: true,
    hours: args.hours,
    hourly_rate: args.hourly_rate,
    discount,
    subtotal,
    total,
    currency: "USD",
  };
}

export const mockToolDefinitions = [
  {
    name: "get_client_data",
    description: "Devuelve datos estaticos de un cliente. Ids validos: acme, norte, andes.",
    schema: getClientDataSchema,
    execute: getClientData,
    parameters: {
      type: "OBJECT",
      properties: {
        client_id: { type: "STRING", description: "Id del cliente: acme, norte o andes." },
      },
      required: ["client_id"],
    },
  },
  {
    name: "calculate_budget",
    description: "Calcula un presupuesto estatico con horas, tarifa y descuento opcional de 0 a 0.3.",
    schema: calculateBudgetSchema,
    execute: calculateBudget,
    parameters: {
      type: "OBJECT",
      properties: {
        hours: { type: "NUMBER", description: "Horas estimadas." },
        hourly_rate: { type: "NUMBER", description: "Tarifa horaria del cliente." },
        discount: { type: "NUMBER", description: "Descuento decimal entre 0 y 0.3." },
      },
      required: ["hours", "hourly_rate"],
    },
  },
];

export function getMockTool(name) {
  return mockToolDefinitions.find((tool) => tool.name === name) || null;
}
