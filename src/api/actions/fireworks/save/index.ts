import { xpDB } from "@/lib/sqlite";
import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { prompt, aiModel, videoPath } = params.body;
  const id = Number(
    await xpDB.run(
      `INSERT INTO fireworks (prompt, aiModel, videoPath) VALUES (?, ?, ?)`,
      [prompt, aiModel, videoPath]
    ).lastInsertRowid
  );

  console.log(videoPath);

  Bun.spawn(["bun", "proc/remove-veo.ts", videoPath], {
    stdout: "inherit",
    stderr: "inherit",
  });

  return { id };
}
