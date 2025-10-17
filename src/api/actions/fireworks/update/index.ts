import { xpDB } from "@/lib/sqlite";
import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { id, prompt, aiModel, videoPath } = params.body;

  // 构建动态更新语句
  const updates: string[] = [];
  const values: any[] = [];

  if (prompt !== undefined) {
    updates.push("prompt = ?");
    values.push(prompt);
  }
  if (aiModel !== undefined) {
    updates.push("aiModel = ?");
    values.push(aiModel);
  }
  if (videoPath !== undefined) {
    updates.push("videoPath = ?");
    values.push(videoPath);
  }

  if (updates.length === 0) {
    return { success: false };
  }

  values.push(id);

  const sql = `UPDATE fireworks SET ${updates.join(", ")} WHERE id = ?`;
  xpDB.run(sql, values);

  return { success: true };
}
