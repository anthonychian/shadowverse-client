import io from "socket.io-client";

// export const socket = io.connect("http://localhost:5000");
//export const socket = io("https://juvenile-closed-stork.glitch.me", {

export const socket = io("https://shadowverse-server.onrender.com/", {
  transports: ["websocket"],
});

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

socket.on("connect_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
});
