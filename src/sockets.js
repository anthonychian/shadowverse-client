import io from "socket.io-client";

// export const socket = io.connect("http://localhost:5000");
export const socket = io("https://shadowverse-server.vercel.app/", { "transports": ["websocket"]});
