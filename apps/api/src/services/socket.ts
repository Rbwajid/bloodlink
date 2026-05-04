import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "bloodlink-secret-key-change-in-production";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupSocket(io: SocketIOServer): void {
  // Auth middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join a chat room
    socket.on("join_room", (roomId: string) => {
      socket.join(`chat:${roomId}`);
    });

    // Leave a chat room
    socket.on("leave_room", (roomId: string) => {
      socket.leave(`chat:${roomId}`);
    });

    // Send message
    socket.on("send_message", async (data: { roomId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            chatRoomId: data.roomId,
            senderId: userId,
            content: data.content,
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        });

        await prisma.chatRoom.update({
          where: { id: data.roomId },
          data: { updatedAt: new Date() },
        });

        io.to(`chat:${data.roomId}`).emit("new_message", message);

        // Notify the other user
        const room = await prisma.chatRoom.findUnique({
          where: { id: data.roomId },
        });
        if (room) {
          const otherUserId = room.user1Id === userId ? room.user2Id : room.user1Id;
          io.to(`user:${otherUserId}`).emit("message_notification", {
            roomId: data.roomId,
            message,
          });
        }
      } catch (error) {
        console.error("Socket send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", (data: { roomId: string }) => {
      socket.to(`chat:${data.roomId}`).emit("user_typing", {
        userId,
        roomId: data.roomId,
      });
    });

    socket.on("stop_typing", (data: { roomId: string }) => {
      socket.to(`chat:${data.roomId}`).emit("user_stop_typing", {
        userId,
        roomId: data.roomId,
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
}
