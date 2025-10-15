import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
  formData: FormData;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { name } = params.body;
  return { message2: `Hello, ${name}!` };
}
