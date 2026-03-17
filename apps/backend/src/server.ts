import "dotenv/config";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { pagesRoutes } from "./modules/pages/pages.routes";
import { blocksRoutes } from "./modules/blocks/blocks.routes";
import { aiRoutes } from "./modules/ai/ai.routes";
import { searchRoutes } from "./modules/search/search.routes";
import { versionsRoutes } from "./modules/versions/versions.route";
import { errorHandler } from "./middleware/error.middleware";
import { initWebSocket } from "./websocket/ws.gateway";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ai:
      !!process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your_gemini_api_key_here",
    ws: true,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/blocks", blocksRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/versions", versionsRoutes);

app.use(errorHandler);

const io = initWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket ready on ws://localhost:${PORT}`);
  console.log(
    `AI: ${process.env.GEMINI_API_KEY ? "Gemini configured" : "Add GEMINI_API_KEY to .env"}`,
  );
});

export { app, io };
