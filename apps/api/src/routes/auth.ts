import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateToken, authenticateToken, AuthRequest } from "../middleware/auth";
import { registerSchema, loginSchema } from "../utils/validation";

const router = Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        bloodType: true,
        role: true,
        city: true,
        state: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
      return;
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bloodType: user.bloodType,
        role: user.role,
        donorStatus: user.donorStatus,
        phone: user.phone,
        city: user.city,
        state: user.state,
        avatar: user.avatar,
        totalDonations: user.totalDonations,
        badges: user.badges,
        lastDonationAt: user.lastDonationAt,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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
        latitude: true,
        longitude: true,
        lastDonationAt: true,
        isVerified: true,
        isPhoneVerified: true,
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
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as authRouter };
