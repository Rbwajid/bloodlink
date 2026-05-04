import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import api, { BLOOD_TYPE_LABELS } from "../lib/api";

interface BloodRequest {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  urgency: string;
  hospitalName: string;
  hospitalCity: string;
  createdAt: string;
  requester: { name: string };
  _count?: { donorResponses: number };
}

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: "#DC2626",
  URGENT: "#F59E0B",
  ROUTINE: "#22C55E",
};

export default function HomeScreen({ navigation }: { navigation: { navigate: (screen: string, params?: Record<string, string>) => void } }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get("/requests?limit=20");
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const renderRequest = ({ item }: { item: BloodRequest }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RequestDetail", { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodText}>{BLOOD_TYPE_LABELS[item.bloodType]}</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[item.urgency] }]}>
          <Text style={styles.urgencyText}>{item.urgency}</Text>
        </View>
      </View>
      <Text style={styles.hospital}>{item.hospitalName}</Text>
      <Text style={styles.location}>{item.hospitalCity}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.units}>{item.unitsNeeded} unit(s) needed</Text>
        <Text style={styles.requester}>by {item.requester.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeBar}>
        <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
        {user?.bloodType && (
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodText}>{BLOOD_TYPE_LABELS[user.bloodType]}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.newRequestBtn}
        onPress={() => navigation.navigate("NewRequest")}
      >
        <Text style={styles.newRequestText}>+ New Blood Request</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No blood requests yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcomeBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  welcome: { fontSize: 18, fontWeight: "bold", color: "#111" },
  newRequestBtn: {
    backgroundColor: "#DC2626",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  newRequestText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bloodBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bloodText: { color: "#DC2626", fontWeight: "bold", fontSize: 14 },
  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  urgencyText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  hospital: { fontSize: 16, fontWeight: "600", color: "#111" },
  location: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  units: { fontSize: 13, color: "#6B7280" },
  requester: { fontSize: 13, color: "#6B7280" },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 16, color: "#9CA3AF" },
});
