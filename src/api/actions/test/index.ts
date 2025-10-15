import * as z from "zod";
import sqlite from "bun:sqlite";
import schema from "./schema";

console.log(sqlite);
export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}) {
  const { name } = params.body;
  return schema.outputSchema.parse({ message: `Hello, ${name}!` });
}
