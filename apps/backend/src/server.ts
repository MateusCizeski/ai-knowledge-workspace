import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { aiRoutes } from "./modules/ai/ai.routes";
import { initWebSocket } from "./websocket/ws.gateway";
import { authRoutes } from "./modules/auth/auth.routes";
import { pagesRoutes } from "./modules/pages/pages.routes";
import { errorHandler } from "./middleware/error.middleware";
import { searchRoutes } from "./modules/search/search.routes";
import { blocksRoutes } from "./modules/blocks/blocks.routes";
import { versionsRoutes } from "./modules/versions/versions.route";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
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
  console.log(`🔌 WebSocket ready`);
  console.log(
    `   AI: ${process.env.GEMINI_API_KEY ? "✅ Gemini configured" : "⚠️  Add GEMINI_API_KEY to .env"}`,
  );
});

export { app, io };
