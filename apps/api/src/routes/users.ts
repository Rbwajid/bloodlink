import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { updateProfileSchema } from "../utils/validation";

const router = Router();
const prisma = new PrismaClient();

// Update profile
router.patch("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        bloodType: true,
        role: true,
        donorStatus: true,
        avatar: true,
        city: true,
        state: true,
        totalDonations: true,
        badges: true,
        lastDonationAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
      return;
    }
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get donor leaderboard
router.get("/leaderboard", async (_req, res: Response) => {
  try {
    const donors = await prisma.user.findMany({
      where: {
        totalDonations: { gt: 0 },
        role: { in: ["DONOR", "BOTH"] },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bloodType: true,
        totalDonations: true,
        badges: true,
        city: true,
      },
      orderBy: { totalDonations: "desc" },
      take: 50,
    });

    res.json({ donors });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user public profile
router.get("/:id", async (req, res: Response) => {
  try {
    const userId = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bloodType: true,
        role: true,
        donorStatus: true,
        city: true,
        state: true,
        totalDonations: true,
        badges: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search donors by blood type and location
router.get("/search/donors", async (req, res: Response) => {
  try {
    const { bloodType, city, status = "AVAILABLE" } = req.query;
    const where: Record<string, unknown> = {
      role: { in: ["DONOR", "BOTH"] },
      donorStatus: status,
    };
    if (bloodType) where.bloodType = bloodType;
    if (city) where.city = { contains: city as string, mode: "insensitive" };

    const donors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        bloodType: true,
        donorStatus: true,
        city: true,
        state: true,
        totalDonations: true,
        badges: true,
      },
      take: 50,
    });

    res.json({ donors });
  } catch (error) {
    console.error("Search donors error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as userRouter };
