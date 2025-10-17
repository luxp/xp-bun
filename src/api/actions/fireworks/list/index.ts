import { xpDB } from "@/lib/sqlite";
import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { page = 1, pageSize = 10 } = params.body;

  // 获取总数
  const totalResult = xpDB
    .query("SELECT COUNT(*) as count FROM fireworks")
    .get() as { count: number };
  const total = totalResult.count;

  // 获取分页数据
  const offset = (page - 1) * pageSize;
  const data = xpDB
    .query(
      `
    SELECT id, prompt, aiModel, videoPath, videoPathNoWatermark, createAt 
    FROM fireworks 
    ORDER BY createAt DESC 
    LIMIT ? OFFSET ?
  `
    )
    .all(pageSize, offset) as Array<{
    id: number;
    prompt: string | null;
    aiModel: string | null;
    videoPath: string | null;
    videoPathNoWatermark: string | null;
    createAt: string;
  }>;

  return { data, total };
}
