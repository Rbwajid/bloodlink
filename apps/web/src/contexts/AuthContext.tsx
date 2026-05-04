"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bloodType?: string;
  role: string;
  donorStatus?: string;
  avatar?: string;
  city?: string;
  state?: string;
  totalDonations: number;
  badges: string[];
  lastDonationAt?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("bloodlink_token");
    const savedUser = localStorage.getItem("bloodlink_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      connectSocket(savedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: userData, token: authToken } = res.data;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("bloodlink_token", authToken);
    localStorage.setItem("bloodlink_user", JSON.stringify(userData));
    connectSocket(authToken);
  }, []);

  const register = useCallback(async (data: Record<string, string>) => {
    const res = await api.post("/auth/register", data);
    const { user: userData, token: authToken } = res.data;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("bloodlink_token", authToken);
    localStorage.setItem("bloodlink_user", JSON.stringify(userData));
    connectSocket(authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bloodlink_token");
    localStorage.removeItem("bloodlink_user");
    disconnectSocket();
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("bloodlink_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
