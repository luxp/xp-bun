import { xpDB } from "@/lib/sqlite";
import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { id } = params.body;

  const result = await xpDB.run("DELETE FROM fireworks WHERE id = ?", [id]);

  return { success: result.changes > 0 };
}
