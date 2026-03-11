import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { pagesRoutes } from "./modules/pages/pages.routes";
import { blocksRoutes } from "./modules/blocks/blocks.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/blocks", blocksRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
