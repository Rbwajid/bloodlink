"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { BLOOD_TYPE_LABELS } from "@/lib/api";
import RequestCard from "@/components/RequestCard";
import { Plus, Search, Filter } from "lucide-react";

interface BloodRequest {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  urgency: string;
  status: string;
  hospitalName: string;
  hospitalCity: string;
  hospitalState?: string;
  description?: string;
  deadline?: string;
  createdAt: string;
  requester: { id: string; name: string; city?: string; avatar?: string };
  _count?: { donorResponses: number };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodType, setBloodType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [city, setCity] = useState("");

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (bloodType) params.set("bloodType", bloodType);
    if (urgency) params.set("urgency", urgency);
    if (city) params.set("city", city);
    params.set("limit", "20");

    api
      .get(`/requests?${params.toString()}`)
      .then((res) => setRequests(res.data.requests))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloodType, urgency]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-600 mt-1">Find blood requests near you and help save lives</p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white"
          >
            <option value="">All Blood Types</option>
            {Object.entries(BLOOD_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 bg-white"
          >
            <option value="">All Urgency</option>
            <option value="CRITICAL">Critical</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search by city..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <button
              onClick={fetchRequests}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No blood requests found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
