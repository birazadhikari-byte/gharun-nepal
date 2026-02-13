import React, { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, ShoppingCart, Users, BarChart3, Key } from "lucide-react";

import {
  adminListRequests,
  adminListAllProviders,
  adminGetStats,
  adminUpdateRequest,
} from "@/lib/database";

import { useAuth, isSystemRole } from "@/contexts/AuthContext";

import OverviewAnalytics from "@/components/gharun/OverviewAnalytics";
import UserManagementPanel from "@/components/gharun/UserManagementPanel";

type AdminTab = "overview" | "orders" | "users" | "access";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [requests, setRequests] = useState<any[]>([]);
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isSystem = user ? isSystemRole(user.role) : false;

  // ===============================
  // LOAD DATA
  // ===============================
  const loadData = useCallback(async () => {
    try {
      const [reqData, provData, statsData] = await Promise.all([
        adminListRequests().catch(() => []),
        adminListAllProviders().catch(() => []),
        adminGetStats().catch(() => null),
      ]);

      setRequests(reqData || []);
      setDbProviders(provData || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // AUTO REFRESH
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 8000);

    return () => clearInterval(interval);
  }, [loadData]);

  // REFRESH BUTTON
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ===============================
  // STATUS UPDATE
  // ===============================
  const updateStatus = async (id: string, status: string) => {
    try {
      await adminUpdateRequest(id, { status });
      loadData();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <section className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
          </div>

          <button onClick={handleRefresh} className="p-2 bg-white border rounded-lg">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-1 flex-wrap mb-6 bg-white p-2 rounded-xl border">
          <button onClick={() => setActiveTab("overview")} className="px-3 py-2 text-xs font-semibold">
            <BarChart3 className="w-4 h-4 inline mr-1" /> Overview
          </button>

          <button onClick={() => setActiveTab("orders")} className="px-3 py-2 text-xs font-semibold">
            <ShoppingCart className="w-4 h-4 inline mr-1" /> Orders
          </button>

          <button onClick={() => setActiveTab("users")} className="px-3 py-2 text-xs font-semibold">
            <Users className="w-4 h-4 inline mr-1" /> Users
          </button>

          {isSystem && (
            <button onClick={() => setActiveTab("access")} className="px-3 py-2 text-xs font-semibold">
              <Key className="w-4 h-4 inline mr-1" /> Access
            </button>
          )}
        </div>

        {/* TAB CONTENT */}

        {activeTab === "overview" && <OverviewAnalytics />}

        {/* ================= ORDERS ================= */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {(requests?.length ?? 0) === 0 ? (
              <div className="bg-white rounded-xl border p-10 text-center">
                <p className="font-semibold text-gray-600">No Orders Found</p>
              </div>
            ) : (
              (requests ?? []).map((req) => (
                <div key={req.id} className="bg-white rounded-xl border p-4 space-y-2">
                  <p className="font-bold">{req.request_number}</p>

                  <p className="text-sm text-gray-500">
                    {req.client_name} • {req.location}
                  </p>

                  <p className="text-xs font-semibold">
                    Status: {req.status || "pending"}
                  </p>

                  {/* ADMIN CONTROLS */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateStatus(req.id, "assigned")}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    >
                      Assign
                    </button>

                    <button
                      onClick={() => updateStatus(req.id, "in_progress")}
                      className="px-2 py-1 text-xs bg-orange-500 text-white rounded"
                    >
                      Start Job
                    </button>

                    <button
                      onClick={() => updateStatus(req.id, "completed")}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "users" && <UserManagementPanel />}
      </div>
    </section>
  );
};

export default AdminDashboard;