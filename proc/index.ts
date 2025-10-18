import path from "path";
type Command = "remove-veo" | "generate-video";
export async function spawnProc(
  command: Command,
  args: Record<string, string> = {}
) {
  const proc = Bun.spawn(
    [
      path.resolve(import.meta.dirname, `${command}.ts`),
      ...Object.entries(args).map(([key, value]) => `--${key}=${value}`),
    ],
    {
      stdout: "inherit",
      stderr: "inherit",
    }
  );
  await proc.exited;
  if (proc.exitCode !== 0) {
    throw new Error(
      `${command} failed with exit code ${
        proc.exitCode
      }: args: ${JSON.stringify(args)}`
    );
  }
}
