import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import api, { BLOOD_TYPE_LABELS } from "../lib/api";

interface BloodRequest {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  urgency: string;
  status: string;
  hospitalName: string;
  hospitalCity: string;
  description?: string;
  contactPhone?: string;
  requesterId: string;
  requester: { id: string; name: string; phone?: string };
  donorResponses: Array<{
    id: string;
    donor: { id: string; name: string; bloodType?: string };
    message?: string;
  }>;
}

export default function RequestDetailScreen({ route }: { route: { params: { id: string } } }) {
  const { user } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    api
      .get(`/requests/${route.params.id}`)
      .then((res) => setRequest(res.data.request))
      .catch(() => Alert.alert("Error", "Request not found"))
      .finally(() => setLoading(false));
  }, [route.params.id]);

  const handleRespond = async () => {
    setResponding(true);
    try {
      await api.post(`/requests/${route.params.id}/respond`, { message });
      Alert.alert("Success", "Thank you for willing to donate!");
      const res = await api.get(`/requests/${route.params.id}`);
      setRequest(res.data.request);
      setMessage("");
    } catch {
      Alert.alert("Error", "Could not respond to request");
    } finally {
      setResponding(false);
    }
  };

  if (loading || !request) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  const isOwner = user?.id === request.requesterId;
  const hasResponded = request.donorResponses.some((r) => r.donor.id === user?.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.bloodCircle}>
          <Text style={styles.bloodTypeText}>{BLOOD_TYPE_LABELS[request.bloodType]}</Text>
        </View>
        <Text style={styles.hospitalName}>{request.hospitalName}</Text>
        <Text style={styles.location}>{request.hospitalCity}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: request.urgency === "CRITICAL" ? "#DC2626" : request.urgency === "URGENT" ? "#F59E0B" : "#22C55E" }]}>
            <Text style={styles.badgeText}>{request.urgency}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#3B82F6" }]}>
            <Text style={styles.badgeText}>{request.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        <DetailRow label="Units Needed" value={String(request.unitsNeeded)} />
        <DetailRow label="Requested By" value={request.requester.name} />
        {request.description && <DetailRow label="Description" value={request.description} />}
        {(isOwner || hasResponded) && request.contactPhone && (
          <DetailRow label="Contact Phone" value={request.contactPhone} />
        )}
      </View>

      {!isOwner && request.status === "OPEN" && !hasResponded && (
        <View style={styles.respondCard}>
          <Text style={styles.respondTitle}>Willing to Donate?</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Optional message..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.donateBtn} onPress={handleRespond} disabled={responding}>
            {responding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.donateBtnText}>I Want to Donate</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {hasResponded && (
        <View style={styles.respondedCard}>
          <Text style={styles.respondedText}>You&apos;ve responded to this request</Text>
        </View>
      )}

      {isOwner && request.donorResponses.length > 0 && (
        <View style={styles.detailCard}>
          <Text style={styles.respondTitle}>Donor Responses ({request.donorResponses.length})</Text>
          {request.donorResponses.map((response) => (
            <View key={response.id} style={styles.donorRow}>
              <Text style={styles.donorName}>{response.donor.name}</Text>
              {response.donor.bloodType && (
                <Text style={styles.donorBlood}>{BLOOD_TYPE_LABELS[response.donor.bloodType]}</Text>
              )}
              {response.message && <Text style={styles.donorMessage}>{response.message}</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bloodCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  bloodTypeText: { fontSize: 20, fontWeight: "bold", color: "#DC2626" },
  hospitalName: { fontSize: 20, fontWeight: "bold", color: "#111" },
  location: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  badges: { flexDirection: "row", gap: 8, marginTop: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  detailRow: { gap: 2 },
  detailLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 16, color: "#111" },
  respondCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  respondTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  messageInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#111",
    minHeight: 60,
    textAlignVertical: "top",
  },
  donateBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  donateBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  respondedCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  respondedText: { color: "#16A34A", fontWeight: "600" },
  donorRow: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  donorName: { fontSize: 16, fontWeight: "600", color: "#111" },
  donorBlood: { fontSize: 14, color: "#DC2626" },
  donorMessage: { fontSize: 14, color: "#6B7280", fontStyle: "italic" },
});
