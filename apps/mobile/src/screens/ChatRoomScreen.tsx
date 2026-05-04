import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export default function ChatRoomScreen({ route }: { route: { params: { roomId: string } } }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    api
      .get(`/chat/rooms/${route.params.roomId}/messages`)
      .then((res) => setMessages(res.data.messages))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.roomId]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/chat/rooms/${route.params.roomId}/messages`, {
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id;
          return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
              {!isMe && <Text style={styles.senderName}>{item.sender.name}</Text>}
              <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.content}</Text>
              <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          </View>
        }
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageList: { padding: 16, gap: 8 },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DC2626",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  senderName: { fontSize: 12, fontWeight: "600", color: "#DC2626", marginBottom: 2 },
  messageText: { fontSize: 15, color: "#111" },
  myMessageText: { color: "#fff" },
  timestamp: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  myTimestamp: { color: "rgba(255,255,255,0.7)" },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 16, color: "#9CA3AF" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: "#fff", fontWeight: "600" },
});
