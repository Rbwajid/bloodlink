"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api, { BLOOD_TYPE_LABELS } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Droplets, MapPin, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

export default function NewRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bloodType: "",
    unitsNeeded: 1,
    urgency: "ROUTINE",
    hospitalName: "",
    hospitalCity: "",
    hospitalState: "",
    description: "",
    contactPhone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        unitsNeeded: Number(form.unitsNeeded),
      };
      await api.post("/requests", payload);
      toast.success("Blood request created! Matching donors will be notified.");
      router.push("/requests");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

  if (authLoading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/requests" className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Requests
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Blood Request</h1>
      <p className="text-gray-600 mb-8">Fill in the details to request blood. Matching donors will be notified automatically.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={form.bloodType}
                onChange={(e) => update("bloodType", e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="">Select blood type</option>
                {Object.entries(BLOOD_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed *</label>
            <input
              type="number"
              value={form.unitsNeeded}
              onChange={(e) => update("unitsNeeded", parseInt(e.target.value) || 1)}
              min={1}
              max={20}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level *</label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={form.urgency}
              onChange={(e) => update("urgency", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white"
            >
              <option value="ROUTINE">🟢 Routine</option>
              <option value="URGENT">🟡 Urgent</option>
              <option value="CRITICAL">🔴 Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={form.hospitalName}
              onChange={(e) => update("hospitalName", e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
              placeholder="City Hospital"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={form.hospitalCity}
              onChange={(e) => update("hospitalCity", e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={form.hospitalState}
              onChange={(e) => update("hospitalState", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
              placeholder="State"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 resize-none"
              placeholder="Additional details about the request..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
          <input
            type="tel"
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
            placeholder="Phone number for this request"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating Request..." : "Create Blood Request"}
        </button>
      </form>
    </div>
  );
}
