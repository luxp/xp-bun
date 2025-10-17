import * as z from "zod";
import type { SQLQueryBindings } from "bun:sqlite";

const inputSchema = z.object({
  sql: z.string(),
  queryBindings: z.custom<SQLQueryBindings>().optional(),
});

const outputSchema = z.array(z.unknown());

export default {
  inputSchema,
  outputSchema,
};
