import * as z from "zod";
import dbQuery from "./actions/dbQuery/schema";
import deleteFireworks from "./actions/fireworks/delete/schema";
import listFireworks from "./actions/fireworks/list/schema";
import saveFireworks from "./actions/fireworks/save/schema";
import updateFireworks from "./actions/fireworks/update/schema";
import upload from "./actions/upload/schema";
import xpdb from "./actions/xpdb/schema";

const actionMap = {
  "fireworks/save": saveFireworks,
  "fireworks/list": listFireworks,
  "fireworks/update": updateFireworks,
  "fireworks/delete": deleteFireworks,
  upload: upload,
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

export function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return fetch("/api/upload", {
    method: "POST",
    body: formData,
  }).then((res) => res.json());
}
