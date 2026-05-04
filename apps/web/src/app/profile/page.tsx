"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api, { BLOOD_TYPE_LABELS } from "@/lib/api";
import toast from "react-hot-toast";
import { User, Phone, MapPin, Droplets, Award, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodType: "",
    role: "",
    donorStatus: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bloodType: user.bloodType || "",
        role: user.role || "BOTH",
        donorStatus: user.donorStatus || "AVAILABLE",
        city: user.city || "",
        state: user.state || "",
      });
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/users/profile", form);
      updateUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (authLoading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-red-100">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            {user.bloodType && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {BLOOD_TYPE_LABELS[user.bloodType]}
              </span>
            )}
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {user.role?.toLowerCase().replace("_", " & ")}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              {user.totalDonations} donations
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {!editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={User} label="Name" value={user.name} />
                <InfoItem icon={Phone} label="Phone" value={user.phone || "Not set"} />
                <InfoItem icon={Droplets} label="Blood Type" value={user.bloodType ? BLOOD_TYPE_LABELS[user.bloodType] : "Not set"} />
                <InfoItem icon={Award} label="Status" value={user.donorStatus || "N/A"} />
                <InfoItem icon={MapPin} label="City" value={user.city || "Not set"} />
                <InfoItem icon={Calendar} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              </div>

              {/* Badges */}
              {user.badges.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => (
                      <span key={badge} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setEditing(true)}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select value={form.bloodType} onChange={(e) => update("bloodType", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white">
                    <option value="">Select</option>
                    {Object.entries(BLOOD_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor Status</label>
                  <select value={form.donorStatus} onChange={(e) => update("donorStatus", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white">
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                    <option value="COOLDOWN">On Cooldown</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-gray-900" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
