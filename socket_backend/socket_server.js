import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createWheel, joinWheel, startWheel } from "./logic.js";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.post("/wheel/create", async (req, res) => {
  try {
    const { entry_fee, admin_id } = req.body;
    const id = await createWheel(entry_fee, admin_id);
    res.json({ wheelId: id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

io.on("connection", socket => {
  console.log("Client connected", socket.id);

  socket.on("join", userId =>
    joinWheel(userId, io).catch(e =>
      socket.emit("error", e.message)
    )
  );

  socket.on("start", adminId =>
    startWheel(io, adminId).catch(e =>
      socket.emit("error", e.message)
    )
  );
});

server.listen(process.env.PORT, () =>
  console.log("Server running on port", process.env.PORT)
);
