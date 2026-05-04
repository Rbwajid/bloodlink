"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api, { BLOOD_TYPE_LABELS, URGENCY_COLORS, STATUS_COLORS } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Clock, Phone, Heart, Users, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface DonorResponse {
  id: string;
  message?: string;
  isAccepted: boolean;
  createdAt: string;
  donor: {
    id: string;
    name: string;
    bloodType?: string;
    city?: string;
    avatar?: string;
  };
}

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
  contactPhone?: string;
  deadline?: string;
  createdAt: string;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    city?: string;
    avatar?: string;
    phone?: string;
  };
  donorResponses: DonorResponse[];
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/requests/${id}`)
      .then((res) => setRequest(res.data.request))
      .catch(() => toast.error("Request not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRespond = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setResponding(true);
    try {
      await api.post(`/requests/${id}/respond`, { message });
      toast.success("Thank you! Your willingness to donate has been recorded. You can now chat with the requester.");
      // Refresh
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data.request);
      setMessage("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to respond");
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Request not found</p>
        <Link href="/requests" className="text-red-600 hover:text-red-700 mt-4 inline-block">← Back to Requests</Link>
      </div>
    );
  }

  const isOwner = user?.id === request.requesterId;
  const hasResponded = request.donorResponses.some((r) => r.donor.id === user?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/requests" className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Requests
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-xl">
                  {BLOOD_TYPE_LABELS[request.bloodType] || request.bloodType}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{request.hospitalName}</h1>
                <div className="flex items-center gap-1 text-gray-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  {request.hospitalCity}{request.hospitalState ? `, ${request.hospitalState}` : ""}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${URGENCY_COLORS[request.urgency]}`}>
                {request.urgency}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status]}`}>
                {request.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Units Needed</p>
              <p className="text-lg font-semibold text-gray-900">{request.unitsNeeded}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Posted</p>
              <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {request.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{request.description}</p>
            </div>
          )}

          {/* Requester Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">Requested by</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                {request.requester.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{request.requester.name}</p>
                {request.requester.city && (
                  <p className="text-sm text-gray-500">{request.requester.city}</p>
                )}
              </div>
            </div>
            {(isOwner || hasResponded) && request.contactPhone && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4" />
                <span>{request.contactPhone}</span>
              </div>
            )}
          </div>

          {/* Respond Section */}
          {!isOwner && request.status === "OPEN" && !hasResponded && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" /> Willing to Donate?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Click below to let the requester know you&apos;re willing to donate. Your contact info will be shared and a chat will be opened.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message to the requester..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-red-500 text-gray-900 resize-none"
              />
              <button
                onClick={handleRespond}
                disabled={responding}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {responding ? "Responding..." : "I Want to Donate"}
              </button>
            </div>
          )}

          {hasResponded && (
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">You&apos;ve already responded to this request</p>
              <Link href="/chat" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 mt-2 text-sm">
                <MessageCircle className="h-4 w-4" /> Go to Chat
              </Link>
            </div>
          )}

          {/* Donor Responses */}
          {isOwner && request.donorResponses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" /> Donor Responses ({request.donorResponses.length})
              </h3>
              <div className="space-y-3">
                {request.donorResponses.map((response) => (
                  <div key={response.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                        {response.donor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{response.donor.name}</p>
                        <p className="text-sm text-gray-500">
                          {response.donor.bloodType ? BLOOD_TYPE_LABELS[response.donor.bloodType] : ""}{" "}
                          {response.donor.city ? `• ${response.donor.city}` : ""}
                        </p>
                        {response.message && (
                          <p className="text-sm text-gray-600 mt-1">&quot;{response.message}&quot;</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/chat"
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <MessageCircle className="h-4 w-4" /> Chat
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
