import React, { useState, useEffect, useCallback } from "react";
import {
  PlusCircle, ClipboardList, MapPin, Clock, CheckCircle2,
  AlertCircle, Search, MessageCircle, ChevronDown, ChevronRight,
  Send, ArrowRight, Package, Loader2, RefreshCw, Shield
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { categories, JHAPA_AREAS, formatLocation, statusColors, statusLabels } from "@/data/gharunData";
import {
  createServiceRequest,
  fetchServiceRequests,
  fetchRequestByNumber
} from "@/lib/database";

import DashboardSidebar from "./DashboardSidebar";

const GHARUN_WHATSAPP = "9779713242471";

const ClientDashboard: React.FC<{ onGoHome: () => void; onLogout: () => void }> = ({ onGoHome, onLogout }) => {

  const { user } = useAuth();

  // ================= STATE =================
  const [activeTab, setActiveTab] = useState("overview");
  const [requests, setRequests] = useState<any[]>(() => []);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const [trackNumber, setTrackNumber] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  const [requestFilter, setRequestFilter] = useState("all");

  const [formData, setFormData] = useState({
    service_type: "",
    location: "",
    description: "",
    preferred_date: "",
    preferred_time: "",
    urgency: "normal",
  });

  // ================= LOAD REQUESTS =================
  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchServiceRequests({ client_id: user.id });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed loading requests", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // ================= TRACK =================
  const handleTrack = async () => {
    if (!trackNumber.trim()) return;
    setTrackLoading(true);
    try {
      const result = await fetchRequestByNumber(trackNumber.trim().toUpperCase());
      setTrackResult(result || { notFound: true });
    } catch {
      setTrackResult({ notFound: true });
    } finally {
      setTrackLoading(false);
    }
  };

  // ================= SAFE REQUESTS =================
  const safeRequests = requests ?? [];

  const filteredRequests = safeRequests.filter((r) => {
    if (requestFilter === "all") return true;
    if (requestFilter === "active")
      return ["submitted", "confirmed", "assigned", "in-progress"].includes(r.status);
    if (requestFilter === "completed") return r.status === "completed";
    if (requestFilter === "cancelled") return r.status === "cancelled";
    return true;
  });

  const pendingCount = safeRequests.filter(r => ["submitted", "confirmed"].includes(r.status)).length;
  const activeCount = safeRequests.filter(r => ["assigned", "in-progress"].includes(r.status)).length;
  const completedCount = safeRequests.filter(r => r.status === "completed").length;

  // ================= SUBMIT REQUEST =================
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const formattedLocation = formatLocation(formData.location);

      const newRequest = await createServiceRequest({
        client_name: user.name,
        client_phone: user.phone || "",
        client_email: user.email,
        client_id: user.id,
        service_type: formData.service_type,
        description: formData.description,
        location: formattedLocation,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        urgency: formData.urgency,
      });

      setRequests(prev => [newRequest, ...prev]);

      setActiveTab("my-requests");

    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  // ================= NEVER CRASH GUARD =================
  if (!Array.isArray(requests)) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="flex min-h-screen bg-gray-50">

      <DashboardSidebar
        role="client"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onGoHome={onGoHome}
        userName={user?.name || "Client"}
        userEmail={user?.email}
        badges={{ "my-requests": pendingCount + activeCount }}
      />

      <main className="flex-1 px-6 py-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">
            {activeTab === "overview" && "Dashboard"}
            {activeTab === "new-request" && "Submit Request"}
            {activeTab === "my-requests" && "My Requests"}
          </h1>

          <button
            onClick={loadRequests}
            className="p-2 bg-white border rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ================= OVERVIEW ================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Pending", value: pendingCount, icon: Clock },
                { label: "Active", value: activeCount, icon: Package },
                { label: "Completed", value: completedCount, icon: CheckCircle2 },
                { label: "Total", value: safeRequests.length, icon: ClipboardList },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border p-4">
                  <stat.icon className="w-5 h-5 mb-1 text-blue-600" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* RECENT */}
            <div className="bg-white rounded-xl border">
              {(safeRequests ?? []).slice(0, 5).map((req) => (
                <div key={req.id} className="px-4 py-3 border-b">
                  <p className="font-semibold">{req.request_number}</p>
                  <p className="text-xs text-gray-500">{req.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= NEW REQUEST ================= */}
        {activeTab === "new-request" && (
          <form onSubmit={handleSubmitRequest} className="bg-white p-6 rounded-xl border space-y-4 max-w-xl">
            <select
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="">Select service</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="">Select area</option>
              {JHAPA_AREAS.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Describe your problem"
            />

            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Submit Request
            </button>
          </form>
        )}

        {/* ================= MY REQUESTS ================= */}
        {activeTab === "my-requests" && (
          <div className="space-y-3">
            {(filteredRequests ?? []).map((req) => {

              const category = categories?.find?.(c => c.id === req.service_type);

              return (
                <div key={req.id} className="bg-white border rounded-xl">

                  <button
                    onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                    className="w-full flex justify-between px-4 py-3"
                  >
                    <div>
                      <p className="font-bold">{req.request_number}</p>
                      <p className="text-xs text-gray-500">{category?.name || req.service_type}</p>
                    </div>
                    <ChevronDown />
                  </button>

                  {expandedRequest === req.id && (
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      {req.description}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default ClientDashboard;