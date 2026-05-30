import io from "socket.io-client";

// export const socket = io.connect("http://localhost:5000");
//export const socket = io("https://juvenile-closed-stork.glitch.me", {

export const socket = io("https://shadowverse-server.onrender.com/", {
  transports: ["websocket"],
});

// Persist the player identity in localStorage so it survives a tab close /
// reopen (sessionStorage only survives a reload of the same tab). The server
// keys each player's stored board state by this id, so keeping it stable is
// what lets a returning player recover their own state. Migrate any id that was
// previously kept in sessionStorage so existing players aren't reset.
let storedPlayerId = localStorage.getItem("playerId");
if (!storedPlayerId) {
  storedPlayerId = sessionStorage.getItem("playerId") || crypto.randomUUID();
  localStorage.setItem("playerId", storedPlayerId);
}
export const playerId = storedPlayerId;

// Remember the current room across reloads so a hard refresh reconnects to the
// same game instead of bouncing the player back to the home screen.
const ROOM_KEY = "sve_room";
export const saveRoom = (room) => {
  if (room) localStorage.setItem(ROOM_KEY, room);
  else localStorage.removeItem(ROOM_KEY);
};
export const getSavedRoom = () => localStorage.getItem(ROOM_KEY);
export const clearSavedRoom = () => localStorage.removeItem(ROOM_KEY);

socket.on("connect_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
});
