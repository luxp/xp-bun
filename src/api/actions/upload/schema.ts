import * as z from "zod";

const inputSchema = z.object({
  file: z.instanceof(File),
});

const outputSchema = z.object({
  url: z.string(),
});

export default {
  inputSchema,
  outputSchema,
};
