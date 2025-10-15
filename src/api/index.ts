import test from "./actions/test";
import test2 from "./actions/test2";

const actionMap = {
  test,
  test2,
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
  return handler({ body: await req.json(), formData: await req.formData() });
}
