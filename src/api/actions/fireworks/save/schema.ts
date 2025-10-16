import * as z from "zod";

const inputSchema = z.object({
  prompt: z.string(),
  aiModel: z.string(),
  videoPath: z.string(),
});

const outputSchema = z.object({
  id: z.number(),
});

export default {
  inputSchema,
  outputSchema,
};
