import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Get all chat rooms for current user
router.get("/rooms", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true, bloodType: true } },
        user2: { select: { id: true, name: true, avatar: true, bloodType: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rooms = chatRooms.map((room) => {
      const otherUser = room.user1Id === req.userId ? room.user2 : room.user1;
      return {
        id: room.id,
        otherUser,
        lastMessage: room.messages[0] || null,
        updatedAt: room.updatedAt,
      };
    });

    res.json({ rooms });
  } catch (error) {
    console.error("Get chat rooms error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages for a chat room
router.get("/rooms/:roomId/messages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.roomId as string;
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
      },
    });

    if (!room) {
      res.status(404).json({ error: "Chat room not found" });
      return;
    }

    const { cursor, limit = "50" } = req.query;
    const messages = await prisma.message.findMany({
      where: { chatRoomId: roomId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
      ...(cursor ? { cursor: { id: cursor as string }, skip: 1 } : {}),
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatRoomId: roomId,
        senderId: { not: req.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send message via REST (fallback if socket not connected)
router.post("/rooms/:roomId/messages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.roomId as string;
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
      },
    });

    if (!room) {
      res.status(404).json({ error: "Chat room not found" });
      return;
    }

    const message = await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId: req.userId!,
        content: req.body.content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as chatRouter };
