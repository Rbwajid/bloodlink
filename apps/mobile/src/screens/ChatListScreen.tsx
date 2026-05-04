import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api, { BLOOD_TYPE_LABELS } from "../lib/api";

interface ChatRoom {
  id: string;
  otherUser: { id: string; name: string; bloodType?: string };
  lastMessage: { content: string; createdAt: string } | null;
}

export default function ChatListScreen({ navigation }: { navigation: { navigate: (screen: string, params?: Record<string, string>) => void } }) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get("/chat/rooms");
      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={rooms}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor="#DC2626" />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.roomCard}
          onPress={() => navigation.navigate("ChatRoom", { roomId: item.id })}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.otherUser.name.charAt(0)}</Text>
          </View>
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{item.otherUser.name}</Text>
            {item.otherUser.bloodType && (
              <Text style={styles.roomBlood}>{BLOOD_TYPE_LABELS[item.otherUser.bloodType]}</Text>
            )}
            {item.lastMessage && (
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage.content}</Text>
            )}
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptyHint}>Respond to a blood request to start chatting</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#DC2626", fontWeight: "bold", fontSize: 18 },
  roomInfo: { flex: 1, gap: 2 },
  roomName: { fontSize: 16, fontWeight: "600", color: "#111" },
  roomBlood: { fontSize: 12, color: "#DC2626" },
  lastMessage: { fontSize: 14, color: "#6B7280" },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 18, color: "#9CA3AF" },
  emptyHint: { fontSize: 14, color: "#D1D5DB", marginTop: 4 },
});
