export default async function handler() {
  Bun.spawnSync(["git", "pull"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  Bun.spawnSync(["bun", "install"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  Bun.spawn(["pm2", "restart", "xp-bun"]);

  return {
    msg: "git pull & bun install success, pm2 restarting",
  };
}
