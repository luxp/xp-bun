module.exports = {
  name: "xp-bun", // Name of your application
  script: "src/index.tsx", // Entry point of your application
  interpreter: "bun", // Bun interpreter
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
    NODE_ENV: "production",
    https_proxy: "http://127.0.0.1:7897",
    http_proxy: "http://127.0.0.1:7897",
    all_proxy: "socks5://127.0.0.1:7897",
  },
};
