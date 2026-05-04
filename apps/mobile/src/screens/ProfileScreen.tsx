import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { BLOOD_TYPE_LABELS } from "../lib/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.badges}>
          {user.bloodType && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{BLOOD_TYPE_LABELS[user.bloodType]}</Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.badgeText, { color: "#16A34A" }]}>{user.totalDonations} donations</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        <InfoRow label="Role" value={user.role?.replace("_", " & ") || "N/A"} />
        <InfoRow label="Status" value={user.donorStatus || "N/A"} />
        <InfoRow label="Phone" value={user.phone || "Not set"} />
        <InfoRow label="City" value={user.city || "Not set"} />
        <InfoRow label="State" value={user.state || "Not set"} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, gap: 16 },
  headerCard: {
    backgroundColor: "#DC2626",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 28 },
  userName: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  badges: { flexDirection: "row", gap: 8, marginTop: 12 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  infoValue: { fontSize: 16, color: "#111", fontWeight: "500" },
  logoutBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  logoutText: { color: "#DC2626", fontWeight: "600", fontSize: 16 },
});
