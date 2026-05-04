"use client";

import Link from "next/link";
import { Heart, Users, MessageCircle, Shield, Droplets, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Heart className="h-16 w-16 fill-white/20" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Every Drop Counts.<br />Save a Life Today.
            </h1>
            <p className="text-lg sm:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              BloodLink connects blood donors with recipients in real-time. Post a request, find matching donors nearby, and communicate securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-50 transition-colors shadow-lg"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/requests"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                View Requests
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How BloodLink Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Droplets,
                title: "Post a Request",
                desc: "Create a blood request with blood type, urgency level, and hospital details. Matching donors are notified instantly.",
              },
              {
                icon: Users,
                title: "Find Donors",
                desc: "Browse available donors by blood type and location. When someone is willing to donate, their contact info is revealed.",
              },
              {
                icon: MessageCircle,
                title: "Connect & Chat",
                desc: "Communicate securely through in-app chat. Coordinate donation time and location directly with your match.",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Blood Types", value: "8" },
              { label: "24/7 Available", value: "Always" },
              { label: "Secure Chat", value: "Private" },
              { label: "Free to Use", value: "100%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy & Safety First</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Your phone number and personal details are hidden until you choose to share them. Our platform includes verification badges, report features, and medical eligibility checklists.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Join BloodLink Today <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <span className="text-white font-bold text-lg">BloodLink</span>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} BloodLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
