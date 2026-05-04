import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { authRouter } from "./routes/auth";
import { requestRouter } from "./routes/requests";
import { chatRouter } from "./routes/chat";
import { userRouter } from "./routes/users";
import { notificationRouter } from "./routes/notifications";
import { setupSocket } from "./services/socket";

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/requests", requestRouter);
app.use("/api/chat", chatRouter);
app.use("/api/users", userRouter);
app.use("/api/notifications", notificationRouter);

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`BloodLink API running on port ${PORT}`);
});

export { io };
