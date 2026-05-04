"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Heart, Menu, X, Bell, MessageCircle, LogOut, User, Trophy } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-600 fill-red-600" />
              <span className="text-xl font-bold text-gray-900">BloodLink</span>
            </Link>
          </div>

          {user ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/requests" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  Requests
                </Link>
                <Link href="/chat" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  <MessageCircle className="h-5 w-5" />
                </Link>
                <Link href="/leaderboard" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  <Trophy className="h-5 w-5" />
                </Link>
                <Link href="/notifications" className="text-gray-600 hover:text-red-600 transition-colors relative">
                  <Bell className="h-5 w-5" />
                </Link>
                <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-red-600">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              <div className="md:hidden flex items-center">
                <button onClick={() => setMobileOpen(!mobileOpen)}>
                  {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-red-600 font-medium">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/dashboard" className="block py-2 text-gray-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/requests" className="block py-2 text-gray-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Blood Requests</Link>
            <Link href="/chat" className="block py-2 text-gray-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Messages</Link>
            <Link href="/leaderboard" className="block py-2 text-gray-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Leaderboard</Link>
            <Link href="/profile" className="block py-2 text-gray-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Profile</Link>
            <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-red-600">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}
