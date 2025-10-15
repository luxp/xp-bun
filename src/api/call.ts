import * as z from "zod";
import test from "./actions/test/schema";
import test2 from "./actions/test2/schema";

const actionMap = {
  test,
  test2,
};

export function callApi<T extends keyof typeof actionMap>(
  action: T,
  params: z.infer<(typeof actionMap)[T]["inputSchema"]>
): Promise<z.infer<(typeof actionMap)[T]["outputSchema"]>> {
  return fetch(`/api/${action}`, {
    method: "POST",
    body: JSON.stringify(params),
  }).then((res) => res.json());
}
