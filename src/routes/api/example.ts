import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/example")({
  server: {
    handlers: {
      GET: () => {
        return new Response(JSON.stringify({ message: "Hello, world!" }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
