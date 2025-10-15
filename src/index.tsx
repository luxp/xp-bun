import { serve } from "bun";
import index from "./index.html";
import { handler } from "./api";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/:action": async (req) => {
      const action = req.params.action;
      return Response.json(await handler(action, req));
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
