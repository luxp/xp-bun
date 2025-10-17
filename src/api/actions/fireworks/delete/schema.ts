import * as z from "zod";

const inputSchema = z.object({
  id: z.number(),
});

const outputSchema = z.object({
  success: z.boolean(),
});

export default {
  inputSchema,
  outputSchema,
};
