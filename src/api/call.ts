import * as z from "zod";
import saveFireworks from "./actions/fireworks/save/schema";
import xpdb from "./actions/xpdb/schema";
import dbQuery from "./actions/dbQuery/schema";

const actionMap = {
  saveFireworks,
  xpdb,
  dbQuery,
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
