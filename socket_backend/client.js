import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const users = [31, 30];
const adminId = 29;

socket.on("connect", () => {
  console.log(" Connected:", socket.id);

  users.forEach(u => socket.emit("join", u));
  setTimeout(() => socket.emit("start", adminId), 2000);
});

socket.on("player_eliminated", u => console.log(" Eliminated:", u));
socket.on("wheel_completed", d => console.log(" Winner:", d.winner));
socket.on("wheel_aborted", d => console.log("Aborted:", d));
socket.on("error", e => console.log(" Error:", e));
