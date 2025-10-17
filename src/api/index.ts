import dbQuery from "./actions/dbQuery/index";
import deleteFireworks from "./actions/fireworks/delete/index";
import listFireworks from "./actions/fireworks/list/index";
import saveFireworks from "./actions/fireworks/save/index";
import updateFireworks from "./actions/fireworks/update/index";
import upload from "./actions/upload/index";
import xpdb from "./actions/xpdb/index";

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

export async function handler(action: string, req: Request) {
  const handler = actionMap[action as keyof typeof actionMap];
  if (!handler) {
    return Response.json(
      {
        message: "Action not found",
      },
      { status: 404 }
    );
  }

  // 如果是上传接口，处理 FormData
  if (action === "upload") {
    return handler({ body: await req.formData() });
  }

  return handler({ body: await req.json() });
}
