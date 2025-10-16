import * as z from "zod";
import schema from "./schema";
import { xpDB } from "@/lib/sqlite";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { action, sql, queryBindings, runBindings, batchRunBindings } =
    params.body;
  if (action === "query") {
    if (queryBindings) {
      return xpDB.query(sql).all(queryBindings);
    }
    return xpDB.query(sql).all();
  }
  if (action === "run") {
    if (runBindings) {
      return xpDB.run(sql, runBindings);
    }
    if (batchRunBindings) {
      return xpDB.run(sql, ...batchRunBindings);
    }
    return xpDB.run(sql);
  }
}
