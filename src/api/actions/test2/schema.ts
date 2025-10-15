import * as z from "zod";

const inputSchema = z.object({
  name: z.string(),
});

const outputSchema = z.object({
  message2: z.string(),
});

export default {
  inputSchema,
  outputSchema,
};
