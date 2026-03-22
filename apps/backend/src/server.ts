import { createServer } from "http";
import app from "./app";
import { initWebSocket } from "./websocket/ws.gateway";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = initWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket ready on ws://localhost:${PORT}`);
  console.log(
    `AI: ${
      process.env.GEMINI_API_KEY
        ? "Gemini configured"
        : "Add GEMINI_API_KEY to .env"
    }`,
  );
});

export { io };
