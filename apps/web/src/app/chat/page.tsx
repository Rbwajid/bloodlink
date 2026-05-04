"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api, { BLOOD_TYPE_LABELS } from "@/lib/api";
import { MessageCircle, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatRoom {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    bloodType?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  updatedAt: string;
}

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api
        .get("/chat/rooms")
        .then((res) => setRooms(res.data.rooms))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="text-gray-600 mb-6">Chat with donors and recipients</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Respond to a blood request to start a chat</p>
          <Link
            href="/requests"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mt-4 font-medium"
          >
            Browse Requests <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/chat/${room.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg shrink-0">
                {room.otherUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{room.otherUser.name}</h3>
                  {room.lastMessage && (
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {room.otherUser.bloodType && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      {BLOOD_TYPE_LABELS[room.otherUser.bloodType]}
                    </span>
                  )}
                  {room.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {room.lastMessage.senderId === user.id ? "You: " : ""}
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
