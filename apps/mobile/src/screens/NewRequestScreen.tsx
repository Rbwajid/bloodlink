import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import api, { BLOOD_TYPE_LABELS } from "../lib/api";

const BLOOD_TYPE_OPTIONS = Object.entries(BLOOD_TYPE_LABELS);

export default function NewRequestScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [bloodType, setBloodType] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgency, setUrgency] = useState("ROUTINE");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!bloodType || !hospitalName || !hospitalCity) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await api.post("/requests", {
        bloodType,
        unitsNeeded: parseInt(unitsNeeded) || 1,
        urgency,
        hospitalName,
        hospitalCity,
        description: description || undefined,
      });
      Alert.alert("Success", "Blood request created! Matching donors will be notified.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Blood Type *</Text>
        <View style={styles.chipRow}>
          {BLOOD_TYPE_OPTIONS.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, bloodType === key && styles.chipSelected]}
              onPress={() => setBloodType(key)}
            >
              <Text style={[styles.chipText, bloodType === key && styles.chipTextSelected]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Urgency *</Text>
        <View style={styles.chipRow}>
          {["ROUTINE", "URGENT", "CRITICAL"].map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.chip, urgency === u && styles.chipSelected]}
              onPress={() => setUrgency(u)}
            >
              <Text style={[styles.chipText, urgency === u && styles.chipTextSelected]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Units Needed</Text>
        <TextInput style={styles.input} value={unitsNeeded} onChangeText={setUnitsNeeded} keyboardType="numeric" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Hospital Name *</Text>
        <TextInput style={styles.input} value={hospitalName} onChangeText={setHospitalName} placeholder="Hospital name" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>City *</Text>
        <TextInput style={styles.input} value={hospitalCity} onChangeText={setHospitalCity} placeholder="City" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Additional details..." multiline placeholderTextColor="#9CA3AF" />

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Request</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, gap: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 4 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: { backgroundColor: "#DC2626", borderColor: "#DC2626" },
  chipText: { color: "#374151", fontWeight: "500" },
  chipTextSelected: { color: "#fff" },
  submitBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
