// socket.js
//https://type-rival.onrender.com

import { io } from "socket.io-client";
export const socket = io("http://localhost:3000", {
  autoConnect: true,
});
