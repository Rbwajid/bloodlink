import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { bloodRequestSchema } from "../utils/validation";

const router = Router();
const prisma = new PrismaClient();

// Create blood request
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = bloodRequestSchema.parse(req.body);
    const request = await prisma.bloodRequest.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        requesterId: req.userId!,
      },
      include: {
        requester: {
          select: { id: true, name: true, city: true, state: true, avatar: true },
        },
      },
    });

    // Notify matching donors
    const matchingDonors = await prisma.user.findMany({
      where: {
        bloodType: data.bloodType,
        donorStatus: "AVAILABLE",
        id: { not: req.userId },
        role: { in: ["DONOR", "BOTH"] },
      },
      select: { id: true },
    });

    if (matchingDonors.length > 0) {
      await prisma.notification.createMany({
        data: matchingDonors.map((donor) => ({
          userId: donor.id,
          title: "New Blood Request",
          body: `${data.bloodType.replace("_", "")} blood needed at ${data.hospitalName}`,
          type: "NEW_REQUEST",
          data: { requestId: request.id },
        })),
      });
    }

    res.status(201).json({ request });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
      return;
    }
    console.error("Create request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List blood requests
router.get("/", async (req, res: Response) => {
  try {
    const { bloodType, urgency, status, city, page = "1", limit = "10" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (bloodType) where.bloodType = bloodType;
    if (urgency) where.urgency = urgency;
    if (status) where.status = status;
    else where.status = "OPEN";
    if (city) where.hospitalCity = { contains: city as string, mode: "insensitive" };

    const [requests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true, city: true, state: true, avatar: true },
          },
          _count: { select: { donorResponses: true } },
        },
        orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
        skip,
        take: parseInt(limit as string),
      }),
      prisma.bloodRequest.count({ where }),
    ]);

    res.json({
      requests,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("List requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single request
router.get("/:id", async (req, res: Response) => {
  try {
    const requestId = req.params.id as string;
    const request = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: { id: true, name: true, city: true, state: true, avatar: true, phone: true },
        },
        donorResponses: {
          include: {
            donor: {
              select: { id: true, name: true, bloodType: true, city: true, avatar: true },
            },
          },
        },
      },
    });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    res.json({ request });
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Respond to a blood request (willing to donate)
router.post("/:id/respond", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const requestId = req.params.id as string;
    const request = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: { requester: { select: { id: true, name: true } } },
    });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.requesterId === req.userId) {
      res.status(400).json({ error: "Cannot respond to your own request" });
      return;
    }

    const existingResponse = await prisma.donorResponse.findUnique({
      where: { requestId_donorId: { requestId: requestId, donorId: req.userId! } },
    });

    if (existingResponse) {
      res.status(400).json({ error: "You already responded to this request" });
      return;
    }

    const response = await prisma.donorResponse.create({
      data: {
        requestId: requestId,
        donorId: req.userId!,
        message: req.body.message,
      },
      include: {
        donor: {
          select: { id: true, name: true, phone: true, bloodType: true, city: true, avatar: true },
        },
      },
    });

    // Create a chat room between donor and requester
    const [user1Id, user2Id] = [req.userId!, request.requesterId].sort();
    await prisma.chatRoom.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      create: { user1Id, user2Id },
      update: {},
    });

    // Notify the requester
    await prisma.notification.create({
      data: {
        userId: request.requesterId,
        title: "New Donor Response",
        body: `${response.donor.name} is willing to donate blood!`,
        type: "DONOR_RESPONSE",
        data: { requestId: request.id, donorId: req.userId },
      },
    });

    res.status(201).json({ response });
  } catch (error) {
    console.error("Respond to request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update request status
router.patch("/:id/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const reqId = req.params.id as string;
    const request = await prisma.bloodRequest.findUnique({ where: { id: reqId } });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.requesterId !== req.userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const updated = await prisma.bloodRequest.update({
      where: { id: reqId },
      data: { status },
    });

    res.json({ request: updated });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get my requests
router.get("/my/requests", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.bloodRequest.findMany({
      where: { requesterId: req.userId },
      include: {
        _count: { select: { donorResponses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as requestRouter };
