"use client";

import { useEffect, useState } from "react";
import api, { BLOOD_TYPE_LABELS } from "@/lib/api";
import { Trophy, Medal, Award } from "lucide-react";

interface Donor {
  id: string;
  name: string;
  avatar?: string;
  bloodType?: string;
  totalDonations: number;
  badges: string[];
  city?: string;
}

export default function LeaderboardPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/leaderboard")
      .then((res) => setDonors(res.data.donors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold text-sm">{index + 1}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900">Donor Leaderboard</h1>
        <p className="text-gray-600 mt-1">Honoring our top blood donors</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600" />
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No donors on the leaderboard yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to donate!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {donors.map((donor, index) => (
            <div
              key={donor.id}
              className={`flex items-center gap-4 bg-white rounded-xl border p-4 ${
                index === 0 ? "border-yellow-300 bg-yellow-50" : "border-gray-200"
              }`}
            >
              <div className="shrink-0">{getRankIcon(index)}</div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold shrink-0">
                {donor.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {donor.bloodType && <span>{BLOOD_TYPE_LABELS[donor.bloodType]}</span>}
                  {donor.city && <span>• {donor.city}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-red-600">{donor.totalDonations}</p>
                <p className="text-xs text-gray-500">donations</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
