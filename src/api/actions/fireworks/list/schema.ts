import * as z from "zod";

const inputSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
});

const outputSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      prompt: z.string().nullable(),
      aiModel: z.string().nullable(),
      videoPath: z.string().nullable(),
      videoPathNoWatermark: z.string().nullable(),
      publicVideoPath: z.string().nullable(),
      publicVideoPathNoWatermark: z.string().nullable(),
      createAt: z.string(),
    })
  ),
  total: z.number(),
});

export default {
  inputSchema,
  outputSchema,
};
