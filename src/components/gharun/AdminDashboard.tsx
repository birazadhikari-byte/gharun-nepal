import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, ClipboardList, CheckCircle2, Clock,
  Phone, MessageSquare, UserCheck, XCircle, ChevronDown,
  TrendingUp, MapPin, Calendar, RefreshCw, MessageCircle,
  Star, Eye, EyeOff, Trash2, Plus, Save, X, FileText,
  History, Search, BarChart3, Car, Key, Layers,
  ShoppingCart, CreditCard, DollarSign, Lock, Download, Banknote, Mail,
  Target
} from 'lucide-react';

import { categories, JHAPA_AREAS, formatLocation, extractAreaName, statusColors, statusLabels } from '@/data/gharunData';

import {
  adminListAllProviders, adminCreateProvider, adminUpdateProvider,
  adminVerifyProvider, adminSuspendProvider, adminHideProvider, adminDeleteProvider,
  adminListRequests, adminUpdateRequest, adminListSubmissions, adminReviewSubmission,
  adminListChangeRequests, adminReviewChangeRequest, adminGetStats, adminGetAuditLogs,
  sendWhatsAppNotification, adminSetRequestCost, adminMarkRequestPaymentReceived, adminListReceipts
} from '@/lib/database';

import { openReceiptWindow } from '@/lib/receiptGenerator';
import { useAuth, isSystemRole } from '@/contexts/AuthContext';

import RideAdminPanel from '@/components/gharun/RideAdminPanel';
import InternalAccessPanel from '@/components/gharun/InternalAccessPanel';
import OverviewAnalytics from '@/components/gharun/OverviewAnalytics';
import CatalogPanel from '@/components/gharun/CatalogPanel';
import OrderManagementPanel from '@/components/gharun/OrderManagementPanel';
import UserManagementPanel from '@/components/gharun/UserManagementPanel';
import PaymentPanel from '@/components/gharun/PaymentPanel';
import ChangePasswordPanel from '@/components/gharun/ChangePasswordPanel';
import PricingPanel from '@/components/gharun/PricingPanel';
import EmailNotificationsPanel from '@/components/gharun/EmailNotificationsPanel';
import ConnectPanel from '@/components/gharun/ConnectPanel';
import TermsReportPanel from '@/components/gharun/TermsReportPanel';

type AdminTab =
  'overview' | 'connect' | 'orders' | 'users' | 'providers' |
  'requests' | 'submissions' | 'changes' | 'audit' | 'rides' |
  'catalog' | 'payments' | 'pricing' | 'access' | 'security' |
  'emails' | 'terms';

const AdminDashboard: React.FC = () => {

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [requests, setRequests] = useState<any[]>([]);
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isSystem = user ? isSystemRole(user.role) : false;

  // ===============================
  // 🧠 GOD MODE DATA LOADER
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
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 🔥 GOD MODE AUTO REFRESH (VERY IMPORTANT)
  useEffect(() => {

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 8000); // refresh every 8 sec

    return () => clearInterval(interval);

  }, [loadData]);

  // =======================================
  // BASIC REFRESH BUTTON
  // =======================================
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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

  const tabDefs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, activeColor: 'bg-purple-600' },
    { id: 'connect', label: 'Connect', icon: Target, activeColor: 'bg-red-600' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, activeColor: 'bg-blue-600' },
    { id: 'users', label: 'Users', icon: Users, activeColor: 'bg-indigo-600' },
    { id: 'providers', label: 'Providers', icon: UserCheck, activeColor: 'bg-green-600' },
    { id: 'payments', label: 'Payments', icon: DollarSign, activeColor: 'bg-emerald-600' },
    { id: 'requests', label: 'Requests', icon: ClipboardList, activeColor: 'bg-orange-600' },
    { id: 'submissions', label: 'Submissions', icon: FileText, activeColor: 'bg-cyan-600' },
    { id: 'changes', label: 'Changes', icon: ChevronDown, activeColor: 'bg-pink-600' },
    { id: 'catalog', label: 'Catalog', icon: Layers, activeColor: 'bg-teal-600' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, activeColor: 'bg-rose-600' },
    { id: 'rides', label: 'Rides', icon: Car, activeColor: 'bg-amber-600' },
    { id: 'emails', label: 'Emails', icon: Mail, activeColor: 'bg-purple-600' },
    { id: 'terms', label: 'Terms', icon: Shield, activeColor: 'bg-violet-600' },
    { id: 'audit', label: 'Audit', icon: History, activeColor: 'bg-gray-700' },
    { id: 'security', label: 'Security', icon: Lock, activeColor: 'bg-rose-700' },
  ] as const;

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600"/>
            <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
          </div>

          <button onClick={handleRefresh} className="p-2 bg-white border rounded-lg">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin':''}`} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-1 flex-wrap mb-6 bg-white p-2 rounded-xl border">
          {tabDefs.map(tab=>{
            const Icon = tab.icon;
            return(
              <button
                key={tab.id}
                onClick={()=>setActiveTab(tab.id as AdminTab)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  activeTab===tab.id ? `${tab.activeColor} text-white` : 'text-gray-500 hover:bg-gray-100'
                }`}>
                <Icon className="w-3.5 h-3.5"/>
                {tab.label}
              </button>
            )
          })}

          {isSystem && (
            <button
              onClick={()=>setActiveTab('access')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab==='access' ? 'bg-red-700 text-white':'text-gray-500 hover:bg-gray-100'
              }`}>
              <Key className="w-3.5 h-3.5"/> Access
            </button>
          )}
        </div>

        {/* TAB CONTENT */}

{activeTab === 'orders' && (
  <div className="space-y-3">
    {(requests?.length ?? 0) === 0 ? (
      <div className="bg-white rounded-xl border p-10 text-center">
        <p className="font-semibold text-gray-600">No Orders Found</p>
      </div>
    ) : (
      (requests ?? []).map((req) => (
        <div key={req.id} className="bg-white rounded-xl border p-4">
          <p className="font-bold">{req.request_number}</p>
          <p className="text-sm text-gray-500">
            {req.client_name} • {req.location}
          </p>
        </div>
      ))
    )}
  </div>
)}
        {activeTab==='users' && <UserManagementPanel/>}
        {activeTab==='payments' && <PaymentPanel/>}
        {activeTab==='catalog' && <CatalogPanel/>}
        {activeTab==='pricing' && <PricingPanel/>}
        {activeTab==='rides' && <RideAdminPanel/>}
        {activeTab==='security' && <ChangePasswordPanel/>}
        {activeTab==='emails' && <EmailNotificationsPanel/>}
        {activeTab==='connect' && <ConnectPanel/>}
        {activeTab==='terms' && <TermsReportPanel/>}
        {activeTab==='access' && isSystem && <InternalAccessPanel/>}

        {/* 🔥 REQUESTS TAB (LIVE DATA) */}
        {activeTab==='requests' && (
          <div className="space-y-3">
            {requests.length===0 ? (
              <div className="bg-white rounded-xl border p-10 text-center">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
                <p className="font-semibold text-gray-600">No Requests Yet</p>
              </div>
            ):(
              requests.map(req=>(
                <div key={req.id} className="bg-white rounded-xl border p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold">{req.request_number}</p>
                      <p className="text-xs text-gray-500">{req.client_name} • {req.location}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[req.status]||''}`}>
                      {statusLabels[req.status]||req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default AdminDashboard;