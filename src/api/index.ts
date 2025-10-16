import saveFireworks from "./actions/fireworks/save/index";
import xpdb from "./actions/xpdb/index";
const actionMap = {
  saveFireworks,
  xpdb,
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
  return handler({ body: await req.json() });
}
