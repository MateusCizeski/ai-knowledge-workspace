import { Server as HTTPServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

interface ConnectedUser {
  userId: string;
  name: string;
  avatar?: string;
  pageId: string | null;
  socketId: string;
  color: string;
}

const USER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

const connectedUsers = new Map<string, ConnectedUser>();

function getColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getUsersInPage(pageId: string): ConnectedUser[] {
  return Array.from(connectedUsers.values()).filter((u) => u.pageId === pageId);
}

export function initWebSocket(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      console.log(
        `[WS] Auth attempt - token: ${token ? token.slice(0, 20) + "..." : "MISSING"}`,
      );

      if (!token) {
        console.log("[WS] Auth failed: no token provided");
        return next(new Error("No token"));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("[WS] JWT_SECRET not set in environment!");
        return next(new Error("Server configuration error"));
      }

      const payload = jwt.verify(token, jwtSecret) as { userId: string };
      console.log(`[WS] Token valid for userId: ${payload.userId}`);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, avatar: true },
      });

      if (!user) {
        console.log(`[WS] User not found: ${payload.userId}`);
        return next(new Error("User not found"));
      }

      socket.data.user = user;
      console.log(`[WS] Auth success: ${user.name}`);
      next();
    } catch (err: any) {
      console.error(`[WS] Auth error: ${err.message}`);
      next(new Error(`Auth failed: ${err.message}`));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log(`[WS] ✅ Connected: ${user.name} (${socket.id})`);

    connectedUsers.set(socket.id, {
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      pageId: null,
      socketId: socket.id,
      color: getColorForUser(user.id),
    });

    socket.on("join-page", async (pageId: string) => {
      const current = connectedUsers.get(socket.id);
      if (current?.pageId) {
        socket.leave(`page:${current.pageId}`);
        socket.to(`page:${current.pageId}`).emit("user-left", {
          socketId: socket.id,
          userId: user.id,
        });
      }

      socket.join(`page:${pageId}`);
      connectedUsers.set(socket.id, { ...current!, pageId });

      socket.to(`page:${pageId}`).emit("user-joined", {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        color: getColorForUser(user.id),
      });

      socket.emit(
        "presence-list",
        getUsersInPage(pageId).filter((u) => u.socketId !== socket.id),
      );
      console.log(`[WS] ${user.name} joined page:${pageId}`);
    });

    socket.on("leave-page", (pageId: string) => {
      socket.leave(`page:${pageId}`);
      const current = connectedUsers.get(socket.id);
      if (current) connectedUsers.set(socket.id, { ...current, pageId: null });
      socket
        .to(`page:${pageId}`)
        .emit("user-left", { socketId: socket.id, userId: user.id });
    });

    socket.on("blocks-changed", (data: { pageId: string; blocks: any[] }) => {
      socket.to(`page:${data.pageId}`).emit("blocks-updated", {
        blocks: data.blocks,
        by: {
          userId: user.id,
          name: user.name,
          color: getColorForUser(user.id),
        },
      });
    });

    socket.on(
      "cursor-move",
      (data: { pageId: string; blockId: string | null }) => {
        socket.to(`page:${data.pageId}`).emit("cursor-update", {
          socketId: socket.id,
          userId: user.id,
          name: user.name,
          color: getColorForUser(user.id),
          blockId: data.blockId,
        });
      },
    );

    socket.on(
      "page-title-changed",
      (data: { pageId: string; title: string; icon: string }) => {
        socket.to(`page:${data.pageId}`).emit("page-title-updated", {
          pageId: data.pageId,
          title: data.title,
          icon: data.icon,
          by: user.name,
        });
      },
    );

    socket.on("disconnect", (reason) => {
      const current = connectedUsers.get(socket.id);
      if (current?.pageId) {
        socket.to(`page:${current.pageId}`).emit("user-left", {
          socketId: socket.id,
          userId: user.id,
        });
      }
      connectedUsers.delete(socket.id);
      console.log(`[WS] Disconnected: ${user.name} — reason: ${reason}`);
    });
  });

  return io;
}
