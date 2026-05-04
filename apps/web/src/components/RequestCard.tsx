"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Users, AlertTriangle } from "lucide-react";
import { BLOOD_TYPE_LABELS, URGENCY_COLORS } from "@/lib/api";

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
  requester: {
    id: string;
    name: string;
    city?: string;
    avatar?: string;
  };
  _count?: {
    donorResponses: number;
  };
}

export default function RequestCard({ request }: { request: BloodRequest }) {
  return (
    <Link href={`/requests/${request.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">
                {BLOOD_TYPE_LABELS[request.bloodType] || request.bloodType}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{request.hospitalName}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {request.hospitalCity}{request.hospitalState ? `, ${request.hospitalState}` : ""}
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${URGENCY_COLORS[request.urgency]}`}>
            {request.urgency === "CRITICAL" && <AlertTriangle className="h-3 w-3 inline mr-1" />}
            {request.urgency}
          </span>
        </div>

        {request.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {request.unitsNeeded} unit{request.unitsNeeded > 1 ? "s" : ""} needed
            </span>
            {request._count && (
              <span className="text-red-600 font-medium">
                {request._count.donorResponses} donor{request._count.donorResponses !== 1 ? "s" : ""} responded
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
            {request.requester.name.charAt(0)}
          </div>
          <span className="text-sm text-gray-600">Requested by {request.requester.name}</span>
        </div>
      </div>
    </Link>
  );
}
