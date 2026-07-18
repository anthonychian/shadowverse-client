import io from "socket.io-client";

// export const socket = io.connect("http://localhost:5000");
//export const socket = io("https://juvenile-closed-stork.glitch.me", {

// Use a local server when developing on localhost, otherwise the deployed one.
// This lets two browsers play against `npm run server` on :5000 for testing,
// without touching the production target.
export const SERVER_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://shadowverse-server.onrender.com/";

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

// Dev/test affordance (localhost only): expose the socket so e2e tests can wait
// for the connection and read its id. No-op when served from any other host.
if (
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  window.__SOCKET__ = socket;
}

// Player identity MUST live in sessionStorage, NOT localStorage. The server
// keys each player's stored board by this id, so it has to be unique per
// player. localStorage is shared across all tabs of the same browser, which
// makes two players testing in one browser collide on a single id (their board
// snapshots overwrite each other, and a rejoining player restores the
// opponent's board as their own). sessionStorage is per-tab — and it still
// survives a page reload (it's only cleared when the tab closes), so the
// reload-reconnect flow keeps working. The trade-off is that fully closing the
// tab loses the identity, which is the only scenario we can't recover anyway.
if (!sessionStorage.getItem("playerId")) {
  sessionStorage.setItem("playerId", crypto.randomUUID());
}
export const playerId = sessionStorage.getItem("playerId");

// Remember the current room (also per-tab) so a hard refresh reconnects to the
// same game instead of bouncing the player back to the home screen.
const ROOM_KEY = "sve_room";
export const saveRoom = (room) => {
  if (room) sessionStorage.setItem(ROOM_KEY, room);
  else sessionStorage.removeItem(ROOM_KEY);
};
export const getSavedRoom = () => sessionStorage.getItem(ROOM_KEY);
export const clearSavedRoom = () => sessionStorage.removeItem(ROOM_KEY);

// Durably persist the player's OWN game state per-tab, keyed by room. The
// server's stored snapshot lives only in memory (wiped on a server restart —
// Render free-tier spins down), and the in-memory Redux board is lost on a page
// reload. Saving here means a reload restores the player's board instantly from
// their own tab, independent of whether the server still has a copy. Written on
// every debounced flush and synchronously on beforeunload, so even the last
// action before a reload is kept. Enemy state is NOT restored from this (only
// own fields, via restoreOwnState) — the opponent's board is re-pulled live.
const STATE_KEY_PREFIX = "sve_state_";
export const saveState = (room, card) => {
  if (!room || !card) return;
  try {
    sessionStorage.setItem(STATE_KEY_PREFIX + room, JSON.stringify(card));
  } catch (e) {
    // Storage full/unavailable — non-fatal; the server snapshot remains a fallback.
  }
};
export const getSavedState = (room) => {
  if (!room) return null;
  const raw = sessionStorage.getItem(STATE_KEY_PREFIX + room);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};
export const clearSavedState = (room) => {
  if (room) {
    sessionStorage.removeItem(STATE_KEY_PREFIX + room);
    return;
  }
  // No room given (explicit exit): clear every saved game state.
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(STATE_KEY_PREFIX)) sessionStorage.removeItem(key);
  }
};

socket.on("connect_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
});
