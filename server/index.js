const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { GameRoom } = require("./gameRoom");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.get("/", (_req, res) =>
  res.json({ status: "ok", mode: "authoritative", version: "0.2.0" }),
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = new Map();

function normalizeRoomId(room) {
  if (room == null) return null;
  return String(room).trim();
}

function getOrCreateRoom(roomId, automated = false) {
  const id = normalizeRoomId(roomId);
  if (!id) return null;
  if (!rooms.has(id)) {
    rooms.set(id, new GameRoom(id, Boolean(automated)));
  } else if (automated && !rooms.get(id).automated) {
    rooms.get(id).automated = true;
  }
  return rooms.get(id);
}

function parseJoinPayload(raw) {
  if (typeof raw === "string" || typeof raw === "number") {
    return { room: normalizeRoomId(raw), playerId: null, automated: false, deck: null };
  }
  if (raw && typeof raw === "object") {
    return {
      room: normalizeRoomId(raw.room),
      playerId: raw.playerId ?? null,
      automated: Boolean(raw.automated),
      deck: raw.deck ?? null,
    };
  }
  return { room: null, playerId: null, automated: false, deck: null };
}

io.on("connection", (socket) => {
  socket.on("join_room", (payload) => {
    const { room, playerId, automated, deck } = parseJoinPayload(payload);
    if (!room) {
      socket.emit("join_error", { error: "Invalid room" });
      return;
    }

    const gameRoom = getOrCreateRoom(room, automated);
    const slot = gameRoom.addPlayer(socket.id, playerId);
    if (slot == null) {
      socket.emit("join_error", { error: "Room is full" });
      return;
    }

    socket.join(room);
    socket.data.room = room;
    socket.data.playerId = playerId;
    socket.data.slot = slot;
    socket.data.automated = automated;

    socket.emit("joined", {
      room,
      slot,
      automated,
      serverMode: "authoritative",
    });

    if (automated && deck) {
      gameRoom.pendingDecks = gameRoom.pendingDecks || {};
      gameRoom.pendingDecks[slot] = deck;
      if (gameRoom.pendingDecks[0] && gameRoom.pendingDecks[1]) {
        const views = gameRoom.startAutomatedGame([
          gameRoom.pendingDecks[0],
          gameRoom.pendingDecks[1],
        ]);
        io.to(room).emit("engine_state", views);
      }
    }
  });

  // Legacy manual mode: host creates room
  socket.on("create_room", (roomId) => {
    const room = normalizeRoomId(roomId);
    if (!room) return;
    getOrCreateRoom(room, false);
    socket.join(room);
    socket.data.room = room;
  });

  socket.on("engine_action", ({ actionId, action }) => {
    const room = socket.data.room;
    if (!room) {
      socket.emit("engine_error", { actionId, error: "Not in a room" });
      return;
    }
    const gameRoom = rooms.get(room);
    if (!gameRoom?.automated) {
      socket.emit("engine_error", {
        actionId,
        error: "Room not in Rules Enforced mode. Use npm run server on localhost.",
      });
      return;
    }
    const result = gameRoom.applyPlayerAction(socket.id, { ...action, actionId });
    if (!result.ok) {
      socket.emit("engine_error", { actionId, error: result.error });
      return;
    }
    io.to(room).emit("engine_state", result.views);
  });

  socket.on("request_engine_state", () => {
    const room = socket.data.room;
    if (!room) return;
    const gameRoom = rooms.get(room);
    if (!gameRoom?.state) return;

    const views = gameRoom.broadcastViews();
    if (views) {
      socket.emit("engine_state", views);
    }
  });

  socket.on("rejoin_room", (roomId) => {
    const room = normalizeRoomId(roomId);
    const gameRoom = rooms.get(room);
    if (!gameRoom) return;

    const playerId = socket.data.playerId;
    const slot = gameRoom.addPlayer(socket.id, playerId);
    if (slot == null) return;

    socket.join(room);
    socket.data.room = room;
    socket.data.slot = slot;

    socket.emit("joined", {
      room,
      slot,
      automated: gameRoom.automated,
      serverMode: "authoritative",
    });

    if (gameRoom.state) {
      socket.emit("engine_state", gameRoom.broadcastViews());
    }
  });

  socket.on("send msg", (msg) => {
    if (msg?.room) {
      socket.to(msg.room).emit("receive msg", msg);
    }
  });

  socket.on("store_state", ({ room, playerId, state }) => {
    const gameRoom = getOrCreateRoom(room);
    if (gameRoom) gameRoom.storeLegacySnapshot(playerId, state);
  });

  socket.on("request_state", ({ room, playerId }) => {
    const gameRoom = rooms.get(normalizeRoomId(room));
    const snapshot = gameRoom?.getLegacySnapshot(playerId);
    if (snapshot) socket.emit("receive_stored_state", snapshot);
  });

  socket.on("disconnect", () => {
    // rooms persist for reconnect
  });
});

server.listen(PORT, () => {
  console.log(`Shadowverse authoritative server on :${PORT}`);
});
