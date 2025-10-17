import * as z from "zod";

const inputSchema = z.object({
  id: z.number(),
  prompt: z.string().optional(),
  aiModel: z.string().optional(),
  videoPath: z.string().optional(),
});

const outputSchema = z.object({
  success: z.boolean(),
});

export default {
  inputSchema,
  outputSchema,
};
