import io from "socket.io-client";

// export const socket = io.connect("http://localhost:5000");
//export const socket = io("https://juvenile-closed-stork.glitch.me", {

export const socket = io("https://shadowverse-server.onrender.com/", {
  transports: ["websocket"],
});

socket.on("connect_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
});
