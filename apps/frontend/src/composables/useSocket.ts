import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth.store";

export interface PresenceUser {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  color: string;
  blockId?: string | null;
}

let socket: Socket | null = null;
const connected = ref(false);
const presenceUsers = ref<PresenceUser[]>([]);

function getSocket(): Socket {
  if (socket?.connected) return socket;

  const auth = useAuthStore();

  const url = import.meta.env.VITE_WS_URL || "http://localhost:3000";

  socket = io(url!, {
    auth: { token: auth.token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    connected.value = true;
    console.log("[WS] Connected:", socket!.id);
  });

  socket.on("disconnect", (reason) => {
    connected.value = false;
    presenceUsers.value = [];
    console.log("[WS] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[WS] Error:", err.message);
    connected.value = false;
  });

  return socket;
}

export function useSocket() {
  const ws = getSocket();

  function joinPage(pageId: string) {
    presenceUsers.value = [];
    ws.emit("join-page", pageId);
  }

  function leavePage(pageId: string) {
    ws.emit("leave-page", pageId);
    presenceUsers.value = [];
  }

  function emitBlocksChanged(pageId: string, blocks: any[]) {
    ws.emit("blocks-changed", { pageId, blocks });
  }

  function emitCursorMove(pageId: string, blockId: string | null) {
    ws.emit("cursor-move", { pageId, blockId });
  }

  function emitTitleChanged(pageId: string, title: string, icon: string) {
    ws.emit("page-title-changed", { pageId, title, icon });
  }

  function onUserJoined(cb: (user: PresenceUser) => void) {
    ws.on("user-joined", (user: PresenceUser) => {
      presenceUsers.value = [
        ...presenceUsers.value.filter((u) => u.socketId !== user.socketId),
        user,
      ];
      cb(user);
    });
  }

  function onUserLeft(
    cb: (data: { socketId: string; userId: string }) => void,
  ) {
    ws.on("user-left", (data) => {
      presenceUsers.value = presenceUsers.value.filter(
        (u) => u.socketId !== data.socketId,
      );
      cb(data);
    });
  }

  function onPresenceList(cb: (users: PresenceUser[]) => void) {
    ws.on("presence-list", (users: PresenceUser[]) => {
      presenceUsers.value = users;
      cb(users);
    });
  }

  function onBlocksUpdated(cb: (data: { blocks: any[]; by: any }) => void) {
    ws.on("blocks-updated", cb);
  }

  function onCursorUpdate(cb: (data: PresenceUser) => void) {
    ws.on("cursor-update", (data: PresenceUser) => {
      presenceUsers.value = presenceUsers.value.map((u) =>
        u.socketId === data.socketId ? { ...u, blockId: data.blockId } : u,
      );
      cb(data);
    });
  }

  function onPageTitleUpdated(
    cb: (data: {
      pageId: string;
      title: string;
      icon: string;
      by: string;
    }) => void,
  ) {
    ws.on("page-title-updated", cb);
  }

  function disconnect() {
    socket?.disconnect();
    socket = null;
    connected.value = false;
    presenceUsers.value = [];
  }

  return {
    socket: ws,
    connected,
    presenceUsers,
    joinPage,
    leavePage,
    emitBlocksChanged,
    emitCursorMove,
    emitTitleChanged,
    onUserJoined,
    onUserLeft,
    onPresenceList,
    onBlocksUpdated,
    onCursorUpdate,
    onPageTitleUpdated,
    disconnect,
  };
}
