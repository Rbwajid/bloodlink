import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bloodType?: string;
  role: string;
  donorStatus?: string;
  city?: string;
  state?: string;
  totalDonations: number;
  badges: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem("bloodlink_token");
      const savedUser = await AsyncStorage.getItem("bloodlink_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    await AsyncStorage.setItem("bloodlink_token", t);
    await AsyncStorage.setItem("bloodlink_user", JSON.stringify(u));
  }, []);

  const register = useCallback(async (data: Record<string, string>) => {
    const res = await api.post("/auth/register", data);
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    await AsyncStorage.setItem("bloodlink_token", t);
    await AsyncStorage.setItem("bloodlink_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("bloodlink_token");
    await AsyncStorage.removeItem("bloodlink_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
