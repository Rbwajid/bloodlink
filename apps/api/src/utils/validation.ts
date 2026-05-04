import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  bloodType: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]).optional(),
  role: z.enum(["DONOR", "RECIPIENT", "BOTH"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const bloodRequestSchema = z.object({
  bloodType: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]),
  unitsNeeded: z.number().int().min(1).max(20).default(1),
  urgency: z.enum(["CRITICAL", "URGENT", "ROUTINE"]).default("ROUTINE"),
  hospitalName: z.string().min(2, "Hospital name is required"),
  hospitalCity: z.string().min(2, "City is required"),
  hospitalState: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  contactPhone: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bloodType: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]).optional(),
  role: z.enum(["DONOR", "RECIPIENT", "BOTH"]).optional(),
  donorStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "COOLDOWN"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};
