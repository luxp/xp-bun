import * as z from "zod";

export const schemaFireworks = z.object({
  id: z.number(),
  prompt: z.string().nullable(),
  aiModel: z.string().nullable(),
  videoPath: z.string().nullable(),
  videoPathNoWatermark: z.string().nullable(),
  createdAt: z.string(),
});
