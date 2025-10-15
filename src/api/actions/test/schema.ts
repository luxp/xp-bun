import * as z from "zod";

const inputSchema = z.object({
  name: z.string(),
});

const outputSchema = z.object({
  message: z.string(),
});

export default {
  inputSchema,
  outputSchema,
};
