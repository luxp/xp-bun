import * as z from "zod";
import type { SQLQueryBindings } from "bun:sqlite";

const inputSchema = z.object({
  action: z.enum(["query", "run"]),
  sql: z.string(),
  queryBindings: z.custom<SQLQueryBindings>().optional(),
  runBindings: z.custom<SQLQueryBindings[]>().optional(),
  batchRunBindings: z.custom<SQLQueryBindings[][]>().optional(),
});

const outputSchema = z.unknown();

export default {
  inputSchema,
  outputSchema,
};
