import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bloodlink_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("bloodlink_token");
        localStorage.removeItem("bloodlink_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

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

export const BLOOD_TYPES = Object.keys(BLOOD_TYPE_LABELS);

export const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white",
  URGENT: "bg-yellow-500 text-black",
  ROUTINE: "bg-green-500 text-white",
};

export const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-500 text-white",
  MATCHED: "bg-purple-500 text-white",
  FULFILLED: "bg-green-600 text-white",
  CANCELLED: "bg-gray-500 text-white",
  EXPIRED: "bg-red-400 text-white",
};
