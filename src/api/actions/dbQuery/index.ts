import * as z from "zod";
import schema from "./schema";
import { xpDB } from "@/lib/sqlite";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { sql, queryBindings } = params.body;

  if (!queryBindings) {
    return xpDB.query(sql).all();
  }

  return xpDB.query(sql).all(queryBindings);
}
