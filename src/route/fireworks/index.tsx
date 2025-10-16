import { callApi } from "@/api/call";
export default function Fireworks() {
  return (
    <div
      onClick={async () => {
        const res = await callApi("xpdb", {
          action: "query",
          sql: "SELECT * FROM fireworks",
        });
        await callApi("xpdb", {
          action: "run",
          sql: "INSERT INTO fireworks (prompt, aiModel, videoPath) VALUES (?, ?, ?)",
          runBindings: ["testPrompt", "testModel", "testPath"],
        });
        console.log(res);
      }}
    >
      Fireworks
    </div>
  );
}
