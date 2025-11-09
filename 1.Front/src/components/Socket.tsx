// socket.js
//https://type-rival.onrender.com

import { io } from "socket.io-client";
export const socket = io("https://type-rival.onrender.com", {
  autoConnect: true,
});
