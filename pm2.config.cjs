module.exports = {
  name: "xp-bun", // Name of your application
  script: "src/index.tsx", // Entry point of your application
  interpreter: "bun", // Bun interpreter
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
    NODE_ENV: "production",
  },
};
