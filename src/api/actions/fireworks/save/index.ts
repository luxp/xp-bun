import * as z from "zod";
import schema from "./schema";
import { xpDB } from "@/lib/sqlite";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { prompt, aiModel, videoPath } = params.body;
  const id = Number(
    xpDB.run(
      `INSERT INTO fireworks (prompt, aiModel, videoPath) VALUES (?, ?, ?)`,
      [prompt, aiModel, videoPath]
    ).lastInsertRowid
  );

  xpDB.query(`SELECT * FROM fireworks`).values();

  return { id };
}
