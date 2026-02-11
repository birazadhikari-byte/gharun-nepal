
import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, ClipboardList, CheckCircle2, Clock, AlertTriangle,
  Phone, MessageSquare, UserCheck, XCircle, ChevronDown, Edit3,
  TrendingUp, MapPin, Calendar, ArrowUpRight, RefreshCw, MessageCircle,
  Star, Eye, EyeOff, Trash2, Plus, Save, X, FileText, History,
  Search, BarChart3, AlertCircle, Car, Home, LogOut, Key, Layers,
  ShoppingCart, CreditCard, DollarSign, Lock, Download, Banknote, Mail,
  Target
} from 'lucide-react';


import { categories, JHAPA_AREAS, formatLocation, extractAreaName, statusColors, statusLabels } from '@/data/gharunData';


import {
  adminListAllProviders, adminCreateProvider, adminUpdateProvider,
  adminVerifyProvider, adminSuspendProvider, adminHideProvider, adminDeleteProvider,
  adminListRequests, adminUpdateRequest, adminListSubmissions, adminReviewSubmission,
  adminListChangeRequests, adminReviewChangeRequest, adminGetStats, adminGetAuditLogs,
  sendWhatsAppNotification, adminGetMyInternalLevel,
  adminSetRequestCost, adminMarkRequestPaymentReceived, adminListReceipts
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




const GHARUN_WHATSAPP = '9779713242471';


type AdminTab = 'overview' | 'connect' | 'orders' | 'users' | 'providers' | 'requests' | 'submissions' | 'changes' | 'audit' | 'rides' | 'catalog' | 'payments' | 'pricing' | 'access' | 'security' | 'emails' | 'terms';









interface EditingProvider {
  id?: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  category: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  jobs_completed: number;
  verified: boolean;
  status: string;
  admin_notes: string;
}

const emptyProvider: EditingProvider = {
  name: '', phone: '', email: '', service: '', category: '', location: '',
  description: '', image: '', rating: 0, jobs_completed: 0, verified: false, status: 'pending', admin_notes: '',
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [requests, setRequests] = useState<any[]>([]);
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [providerSearch, setProviderSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProvider, setEditingProvider] = useState<EditingProvider | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Payment controls state
  const [costEditingId, setCostEditingId] = useState<string | null>(null);
  const [costForm, setCostForm] = useState({ estimated_cost: '', final_cost: '' });
  const [costSaving, setCostSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);


  const isSystem = user ? isSystemRole(user.role) : false;


  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

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
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await adminListSubmissions();
      setSubmissions(data || []);
    } catch (err) { console.error(err); }
  }, []);

  const loadChangeRequests = useCallback(async () => {
    try {
      const data = await adminListChangeRequests();
      setChangeRequests(data || []);
    } catch (err) { console.error(err); }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    try {
      const data = await adminGetAuditLogs(100);
      setAuditLogs(data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'submissions') loadSubmissions();
    if (activeTab === 'changes') loadChangeRequests();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, loadSubmissions, loadChangeRequests, loadAuditLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    if (activeTab === 'submissions') loadSubmissions();
    if (activeTab === 'changes') loadChangeRequests();
    if (activeTab === 'audit') loadAuditLogs();
  };

  // ============ PROVIDER ACTIONS ============
  const handleSaveProvider = async () => {
    if (!editingProvider) return;
    setSaving(true);
    try {
      // Apply formatLocation() to standardize the location before saving
      const formattedLocation = formatLocation(editingProvider.location);

      if (editingProvider.id) {
        const { id, ...updates } = editingProvider;
        const payload = { ...updates, location: formattedLocation };
        await adminUpdateProvider(id, payload);
        setDbProviders(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));
        showFeedback('Provider updated successfully');
      } else {
        const newProvider = await adminCreateProvider({
          name: editingProvider.name, phone: editingProvider.phone, email: editingProvider.email || undefined,
          service: editingProvider.service, category: editingProvider.category, location: formattedLocation,
          description: editingProvider.description || undefined, image: editingProvider.image || undefined,
          verified: editingProvider.verified, status: editingProvider.status,
        });
        setDbProviders(prev => [newProvider, ...prev]);
        showFeedback('Provider created successfully');
      }
      setShowProviderForm(false);
      setEditingProvider(null);
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed to save'));
    } finally { setSaving(false); }
  };


  const handleVerifyProvider = async (id: string, approve: boolean) => {
    try {
      await adminVerifyProvider(id, approve);
      setDbProviders(prev => prev.map(p => p.id === id ? { ...p, status: approve ? 'active' : 'suspended', verified: approve } : p));
      showFeedback(approve ? 'Provider approved & verified' : 'Provider suspended');
    } catch (err) { console.error(err); }
  };

  const handleSuspendProvider = async (id: string) => {
    try {
      await adminSuspendProvider(id, 'Suspended by admin');
      setDbProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'suspended', verified: false } : p));
      showFeedback('Provider suspended');
    } catch (err) { console.error(err); }
  };

  const handleHideProvider = async (id: string) => {
    try {
      await adminHideProvider(id);
      setDbProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'hidden' } : p));
      showFeedback('Provider hidden from public');
    } catch (err) { console.error(err); }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Permanently delete this provider? This cannot be undone.')) return;
    try {
      await adminDeleteProvider(id);
      setDbProviders(prev => prev.filter(p => p.id !== id));
      showFeedback('Provider deleted');
    } catch (err) { console.error(err); }
  };

  // ============ REQUEST ACTIONS ============
  const handleUpdateStatus = async (id: string, newStatus: string, request?: any) => {
    try {
      await adminUpdateRequest(id, { status: newStatus });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      showFeedback(`Request status updated to ${newStatus}`);
      if (request?.client_phone) {
        const catName = categories.find(c => c.id === request.service_type)?.name || request.service_type;
        if (newStatus === 'confirmed') {
          await sendWhatsAppNotification('request_confirmed', { clientName: request.client_name, requestNumber: request.request_number, serviceType: catName, location: request.location }, request.client_phone, 'en', request.client_name);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleAssignProvider = async (requestId: string, providerName: string) => {
    try {
      await adminUpdateRequest(requestId, { status: 'assigned', assigned_provider_name: providerName });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, assigned_provider_name: providerName, status: 'assigned' } : r));
      showFeedback(`Provider ${providerName} assigned`);
    } catch (err) { console.error(err); }
  };


  // ============ PAYMENT ACTIONS (REQUESTS TAB) ============
  const handleSetCost = async (id: string) => {
    setCostSaving(true);
    try {
      const est = costForm.estimated_cost ? Number(costForm.estimated_cost) : undefined;
      const fin = costForm.final_cost ? Number(costForm.final_cost) : undefined;
      await adminSetRequestCost(id, est, fin);
      setRequests(prev => prev.map(r => r.id === id ? {
        ...r,
        estimated_cost: est ?? r.estimated_cost,
        final_cost: fin ?? r.final_cost,
      } : r));
      setCostEditingId(null);
      setCostForm({ estimated_cost: '', final_cost: '' });
      showFeedback('Cost updated successfully');
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed to set cost'));
    } finally {
      setCostSaving(false);
    }
  };

  const handleMarkPaid = async (id: string, req: any) => {
    setMarkingPaid(id);
    try {
      const result = await adminMarkRequestPaymentReceived(id);
      setRequests(prev => prev.map(r => r.id === id ? {
        ...r,
        payment_status: 'paid',
        payment_received_at: new Date().toISOString(),
      } : r));
      showFeedback('Payment marked as received — receipt generated');
      // Auto-open receipt if returned
      if (result?.receipt) {
        const cat = categories.find(c => c.id === req.service_type);
        openReceiptWindow({
          receipt_number: result.receipt.receipt_number || `RCP-${Date.now()}`,
          request_number: req.request_number,
          client_name: req.client_name,
          service_type: req.service_type,
          location: req.location,
          amount: Number(req.final_cost || req.estimated_cost || 0),
          payment_method: req.payment_method || 'cash',
          generated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed to mark paid'));
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleViewReceipt = async (req: any) => {
    try {
      const receiptList = await adminListReceipts(req.id);
      if (receiptList && receiptList.length > 0) {
        const r = receiptList[0];
        openReceiptWindow({
          receipt_number: r.receipt_number,
          request_number: r.request_number || req.request_number,
          client_name: r.client_name || req.client_name,
          service_type: r.service_type || req.service_type,
          location: r.location || req.location,
          amount: Number(r.amount || req.final_cost || req.estimated_cost || 0),
          payment_method: r.payment_method || req.payment_method || 'cash',
          generated_at: r.generated_at || r.created_at || new Date().toISOString(),
        });
      } else {
        showFeedback('No receipt found for this request');
      }
    } catch (err: any) {
      showFeedback('Error loading receipt: ' + (err.message || 'Unknown'));
    }
  };



  // ============ SUBMISSION ACTIONS ============
  const handleReviewSubmission = async (id: string, status: string, notes?: string) => {
    try {
      await adminReviewSubmission(id, status, notes);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      showFeedback(`Submission ${status}`);
      if (status === 'approved') loadData();
    } catch (err) { console.error(err); }
  };

  // ============ CHANGE REQUEST ACTIONS ============
  const handleReviewChange = async (id: string, approved: boolean) => {
    try {
      await adminReviewChangeRequest(id, approved);
      setChangeRequests(prev => prev.map(c => c.id === id ? { ...c, status: approved ? 'approved' : 'rejected' } : c));
      showFeedback(approved ? 'Change approved & applied' : 'Change rejected');
      if (approved) loadData();
    } catch (err) { console.error(err); }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[-\s()]/g, '').replace('+', '');
    const msg = encodeURIComponent(`Namaste ${name}! This is Gharun Connect. `);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const filteredProviders = dbProviders.filter(p => {
    if (providerFilter !== 'all' && p.status !== providerFilter) return false;
    if (providerSearch.trim()) {
      const q = providerSearch.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.service?.toLowerCase().includes(q) || p.phone?.includes(q) || p.location?.toLowerCase().includes(q);
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700', verified: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700', suspended: 'bg-red-100 text-red-700',
      hidden: 'bg-gray-100 text-gray-600', rejected: 'bg-red-100 text-red-700',
      approved: 'bg-green-100 text-green-700', revision_needed: 'bg-orange-100 text-orange-700',
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`;
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

  // Tab definitions with icons and colors
  const tabDefs: { id: AdminTab; label: string; icon: React.ElementType; color: string; activeColor: string }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'text-purple-600', activeColor: 'bg-purple-600' },
    { id: 'connect', label: 'Connect', icon: Target, color: 'text-red-600', activeColor: 'bg-red-600' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-blue-600', activeColor: 'bg-blue-600' },

    { id: 'users', label: 'Users', icon: Users, color: 'text-indigo-600', activeColor: 'bg-indigo-600' },
    { id: 'providers', label: 'Providers', icon: UserCheck, color: 'text-green-600', activeColor: 'bg-green-600' },
    { id: 'payments', label: 'Payments', icon: DollarSign, color: 'text-emerald-600', activeColor: 'bg-emerald-600' },
    { id: 'requests', label: 'Requests', icon: ClipboardList, color: 'text-orange-600', activeColor: 'bg-orange-600' },
    { id: 'submissions', label: 'Submissions', icon: FileText, color: 'text-cyan-600', activeColor: 'bg-cyan-600' },
    { id: 'changes', label: 'Changes', icon: Edit3, color: 'text-pink-600', activeColor: 'bg-pink-600' },
    { id: 'catalog', label: 'Catalog', icon: Layers, color: 'text-teal-600', activeColor: 'bg-teal-600' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'text-rose-600', activeColor: 'bg-rose-600' },
    { id: 'rides', label: 'Rides', icon: Car, color: 'text-amber-600', activeColor: 'bg-amber-600' },
    { id: 'emails' as AdminTab, label: 'Emails', icon: Mail, color: 'text-purple-600', activeColor: 'bg-purple-600' },
    { id: 'terms' as AdminTab, label: 'Terms', icon: Shield, color: 'text-violet-600', activeColor: 'bg-violet-600' },
    { id: 'audit', label: 'Audit', icon: History, color: 'text-gray-600', activeColor: 'bg-gray-700' },
    { id: 'security', label: 'Security', icon: Lock, color: 'text-rose-600', activeColor: 'bg-rose-700' },
  ];






  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feedback Toast */}
        {actionFeedback && (
          <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300">
            {actionFeedback}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
              {stats?.callerAccessLevel && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  stats.callerAccessLevel === 'system' ? 'bg-red-100 text-red-800 border-red-200' :
                  stats.callerAccessLevel === 'core' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  stats.callerAccessLevel === 'control' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {stats.callerAccessLevel?.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Gharun Nepal — Control Center
              <span className="text-xs text-gray-400 ml-1">/ घरन नेपाल — नियन्त्रण केन्द्र</span>
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Stats Bar */}
        {stats && activeTab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {[
              { label: 'Orders Today', value: stats.ordersToday || 0, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'This Week', value: stats.ordersWeek || 0, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              { label: 'This Month', value: stats.ordersMonth || 0, color: 'bg-purple-50 text-purple-700 border-purple-200' },
              { label: 'Pending', value: stats.pendingOrders || 0, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
              { label: 'Completed', value: stats.completedOrders || 0, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Revenue', value: `Rs.${(stats.totalRevenue || 0).toLocaleString()}`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { label: 'Active Users', value: stats.totalUsers || 0, color: 'bg-gray-50 text-gray-700 border-gray-200' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-xl p-3 border`}>
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-[10px] font-semibold opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1.5 flex-wrap mb-6 bg-white rounded-xl border border-gray-200 p-2">
          {tabDefs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? `${tab.activeColor} text-white shadow-sm`
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
          {/* Internal Access tab - only visible to SYSTEM level */}
          {isSystem && (
            <button onClick={() => setActiveTab('access')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'access' ? 'bg-red-700 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Access</span>
            </button>
          )}
        </div>

        {/* ============ TAB CONTENT ============ */}

        {activeTab === 'overview' && <OverviewAnalytics />}

        {activeTab === 'orders' && <OrderManagementPanel />}

        {activeTab === 'users' && <UserManagementPanel />}

        {activeTab === 'payments' && <PaymentPanel />}

        {/* ============ PROVIDERS TAB ============ */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            {showProviderForm && editingProvider && (
              <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowProviderForm(false); setEditingProvider(null); }} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">
                  <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5 rounded-t-2xl text-white flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{editingProvider.id ? 'Edit Provider' : 'Create New Provider'}</h2>
                      <p className="text-sm text-purple-200">Admin-controlled public profile</p>
                    </div>
                    <button onClick={() => { setShowProviderForm(false); setEditingProvider(null); }} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label><input type="text" value={editingProvider.name} onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" /></div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label><input type="tel" value={editingProvider.phone} onChange={(e) => setEditingProvider({ ...editingProvider, phone: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" /></div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Service Title *</label><input type="text" value={editingProvider.service} onChange={(e) => setEditingProvider({ ...editingProvider, service: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" /></div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                        <select value={editingProvider.category} onChange={(e) => setEditingProvider({ ...editingProvider, category: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none bg-white">
                          <option value="">Select category...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Location (Jhapa District) *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <select
                            value={editingProvider.location}
                            onChange={(e) => setEditingProvider({ ...editingProvider, location: e.target.value })}
                            className={`w-full pl-9 pr-3 py-2.5 border-2 rounded-xl text-sm focus:outline-none bg-white appearance-none cursor-pointer ${
                              editingProvider.location ? 'border-purple-300 focus:border-purple-500' : 'border-gray-200 focus:border-purple-500'
                            }`}
                          >
                            <option value="">Select area in Jhapa...</option>
                            {JHAPA_AREAS.map((area) => (
                              <option key={area.name} value={area.name}>
                                {area.name} — {area.nameNp}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {editingProvider.location && (
                          <p className="mt-1 text-[10px] text-purple-600 font-medium">
                            Saves as: {formatLocation(editingProvider.location)}
                          </p>
                        )}
                      </div>

                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email</label><input type="email" value={editingProvider.email} onChange={(e) => setEditingProvider({ ...editingProvider, email: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" /></div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select value={editingProvider.status} onChange={(e) => setEditingProvider({ ...editingProvider, status: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none bg-white">
                          <option value="pending">Pending</option><option value="active">Active</option><option value="verified">Verified</option><option value="suspended">Suspended</option><option value="hidden">Hidden</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editingProvider.verified} onChange={(e) => setEditingProvider({ ...editingProvider, verified: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
                        <span className="text-sm font-semibold text-gray-700">Verified Badge</span>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveProvider} disabled={saving || !editingProvider.name || !editingProvider.phone || !editingProvider.service || !editingProvider.category || !editingProvider.location}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : (editingProvider.id ? 'Update Provider' : 'Create Provider')}
                      </button>
                      <button onClick={() => { setShowProviderForm(false); setEditingProvider(null); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={providerSearch} onChange={(e) => setProviderSearch(e.target.value)} placeholder="Search providers..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'active', 'pending', 'suspended', 'hidden'] as const).map((filter) => (
                  <button key={filter} onClick={() => setProviderFilter(filter)} className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${providerFilter === filter ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    {filter} ({filter === 'all' ? dbProviders.length : dbProviders.filter(p => p.status === filter).length})
                  </button>
                ))}
              </div>
              <button onClick={() => { setEditingProvider({ ...emptyProvider }); setShowProviderForm(true); }} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Provider
              </button>
            </div>

            {filteredProviders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Providers Found</h3>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProviders.map((provider) => (
                  <div key={provider.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 p-4">
                      <img src={provider.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=C8102E&color=fff&size=100`}
                        alt={provider.name} className="w-14 h-14 rounded-xl object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=C8102E&color=fff&size=100`; }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-gray-900 truncate">{provider.name}</p>
                          {provider.verified && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500">{provider.service}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{provider.location}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <span className={statusBadge(provider.status)}>{provider.status}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{provider.jobs_completed || 0} jobs</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500" /> {provider.rating || 0}</span>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <button onClick={() => { setEditingProvider({ ...provider, location: extractAreaName(provider.location || ''), email: provider.email || '', description: provider.description || '', image: provider.image || '', admin_notes: provider.admin_notes || '' }); setShowProviderForm(true); }}
                          className="flex-1 px-2 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors flex items-center justify-center gap-1">

                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        {provider.status === 'pending' ? (
                          <>
                            <button onClick={() => handleVerifyProvider(provider.id, true)} className="flex-1 px-2 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">Approve</button>
                            <button onClick={() => handleVerifyProvider(provider.id, false)} className="px-2 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">Reject</button>
                          </>
                        ) : provider.status === 'active' || provider.status === 'verified' ? (
                          <>
                            <button onClick={() => handleSuspendProvider(provider.id)} className="px-2 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Suspend</button>
                            <button onClick={() => handleHideProvider(provider.id)} className="px-2 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hide</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleVerifyProvider(provider.id, true)} className="flex-1 px-2 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Activate</button>
                            <button onClick={() => handleDeleteProvider(provider.id)} className="px-2 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1"><Trash2 className="w-3 h-3" /></button>
                          </>
                        )}
                      </div>
                      {provider.phone && (
                        <button onClick={() => openWhatsApp(provider.phone, provider.name)} className="w-full px-2 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {provider.phone}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ REQUESTS TAB (with Payment Controls) ============ */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Requests Yet</h3>
              </div>
            ) : (
              requests.map((req) => {
                const isExpanded = selectedRequest === req.id;
                const category = categories.find(c => c.id === req.service_type);
                const isCostEditing = costEditingId === req.id;
                const isPaid = req.payment_status === 'paid';
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Collapsed Row Header */}
                    <button onClick={() => setSelectedRequest(isExpanded ? null : req.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${req.status === 'submitted' ? 'bg-yellow-500 animate-pulse' : req.status === 'in-progress' ? 'bg-orange-500 animate-pulse' : req.status === 'completed' ? 'bg-green-500' : req.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{req.request_number || 'N/A'}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[req.status] || ''}`}>{statusLabels[req.status] || req.status}</span>
                            {/* Payment Method Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              req.payment_method === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {req.payment_method === 'online' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                              {req.payment_method === 'online' ? 'Online' : 'Cash'}
                            </span>
                            {/* Payment Status Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPaid ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }`}>
                              {isPaid ? 'PAID' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{req.client_name} - {category?.name || req.service_type} - {req.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Quick cost display */}
                        {(req.estimated_cost || req.final_cost) && (
                          <span className="hidden sm:inline text-xs font-bold text-gray-700">
                            Rs. {Number(req.final_cost || req.estimated_cost || 0).toLocaleString()}
                          </span>
                        )}
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                        {/* Client & Request Details */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Client:</strong> {req.client_name}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Phone:</strong> {req.client_phone}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Location:</strong> {req.location}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Date:</strong> {req.preferred_date} {req.preferred_time}</span></div>
                            {req.assigned_provider_name && <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span className="text-sm"><strong>Provider:</strong> {req.assigned_provider_name}</span></div>}
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Created:</strong> {new Date(req.created_at).toLocaleString()}</span></div>
                          </div>
                        </div>

                        {/* ===== PAYMENT MANAGEMENT SECTION ===== */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <h4 className="text-sm font-bold text-blue-900">Payment Management</h4>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              isPaid ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }`}>
                              {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                            </span>
                          </div>

                          {/* Current Payment Info */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                              <p className="text-[10px] text-blue-500 font-semibold">Method</p>
                              <p className="text-xs font-bold text-blue-900 capitalize flex items-center gap-1">
                                {req.payment_method === 'online' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                {req.payment_method || 'Cash'}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                              <p className="text-[10px] text-blue-500 font-semibold">Estimated</p>
                              <p className="text-xs font-bold text-blue-900">
                                {req.estimated_cost ? `Rs. ${Number(req.estimated_cost).toLocaleString()}` : 'Not set'}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                              <p className="text-[10px] text-blue-500 font-semibold">Final Cost</p>
                              <p className="text-xs font-bold text-blue-900">
                                {req.final_cost ? `Rs. ${Number(req.final_cost).toLocaleString()}` : 'Not set'}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                              <p className="text-[10px] text-blue-500 font-semibold">Status</p>
                              <p className={`text-xs font-bold ${isPaid ? 'text-green-700' : 'text-yellow-700'}`}>
                                {isPaid ? 'Paid' : 'Pending'}
                              </p>
                            </div>
                          </div>

                          {/* Set Cost Form (inline toggle) */}
                          {isCostEditing ? (
                            <div className="bg-white rounded-lg p-3 border border-blue-200 space-y-2">
                              <p className="text-xs font-semibold text-blue-800">Set Cost for {req.request_number}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-gray-500 font-medium mb-0.5">Estimated Cost (Rs.)</label>
                                  <input
                                    type="number"
                                    value={costForm.estimated_cost}
                                    onChange={(e) => setCostForm({ ...costForm, estimated_cost: e.target.value })}
                                    placeholder={req.estimated_cost ? String(req.estimated_cost) : '0'}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-gray-500 font-medium mb-0.5">Final Cost (Rs.)</label>
                                  <input
                                    type="number"
                                    value={costForm.final_cost}
                                    onChange={(e) => setCostForm({ ...costForm, final_cost: e.target.value })}
                                    placeholder={req.final_cost ? String(req.final_cost) : '0'}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSetCost(req.id)}
                                  disabled={costSaving || (!costForm.estimated_cost && !costForm.final_cost)}
                                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  {costSaving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</> : <><Save className="w-3 h-3" /> Save Cost</>}
                                </button>
                                <button
                                  onClick={() => { setCostEditingId(null); setCostForm({ estimated_cost: '', final_cost: '' }); }}
                                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {/* Set Cost Button */}
                              <button
                                onClick={() => {
                                  setCostEditingId(req.id);
                                  setCostForm({
                                    estimated_cost: req.estimated_cost ? String(req.estimated_cost) : '',
                                    final_cost: req.final_cost ? String(req.final_cost) : '',
                                  });
                                }}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" /> Set Cost
                              </button>

                              {/* Mark Paid Button (only for pending payments with a cost set) */}
                              {!isPaid && (req.estimated_cost || req.final_cost) && (
                                <button
                                  onClick={() => handleMarkPaid(req.id, req)}
                                  disabled={markingPaid === req.id}
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                  {markingPaid === req.id ? (
                                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Marking...</>
                                  ) : (
                                    <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid</>
                                  )}
                                </button>
                              )}

                              {/* Download Receipt Button (only for paid requests) */}
                              {isPaid && (
                                <button
                                  onClick={() => handleViewReceipt(req)}
                                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" /> Receipt
                                </button>
                              )}
                            </div>
                          )}

                          {/* Paid confirmation info */}
                          {isPaid && req.payment_received_at && (
                            <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Payment received on {new Date(req.payment_received_at).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Status Actions */}
                        <div className="flex flex-wrap gap-2">
                          {req.status === 'submitted' && (
                            <>
                              <button onClick={() => handleUpdateStatus(req.id, 'confirmed', req)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Confirm</button>
                              <button onClick={() => handleUpdateStatus(req.id, 'cancelled', req)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancel</button>
                            </>
                          )}
                          {req.status === 'confirmed' && (
                            <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white" onChange={(e) => { if (e.target.value) handleAssignProvider(req.id, e.target.value); }} defaultValue="">
                              <option value="" disabled>Assign a provider...</option>
                              {dbProviders.filter(p => (p.status === 'active' || p.verified)).map(p => (<option key={p.id} value={p.name}>{p.name} - {p.service}</option>))}
                            </select>
                          )}
                          {req.status === 'assigned' && <button onClick={() => handleUpdateStatus(req.id, 'in-progress', req)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> In Progress</button>}
                          {req.status === 'in-progress' && <button onClick={() => handleUpdateStatus(req.id, 'completed', req)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Complete</button>}
                          <button onClick={() => openWhatsApp(req.client_phone, req.client_name)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}


        {/* ============ SUBMISSIONS TAB ============ */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Submissions</h3>
              </div>
            ) : (
              submissions.map((sub) => {
                const subData = sub.data || {};
                return (
                  <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">{subData.name || 'Unknown'}</p>
                          <span className={statusBadge(sub.status)}>{sub.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">{subData.service} - {subData.category} - {subData.location}</p>
                      </div>
                    </div>
                    {sub.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleReviewSubmission(sub.id, 'approved')} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</button>
                        <button onClick={() => handleReviewSubmission(sub.id, 'rejected', 'Does not meet requirements')} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ============ CHANGE REQUESTS TAB ============ */}
        {activeTab === 'changes' && (
          <div className="space-y-4">
            {changeRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Change Requests</h3>
              </div>
            ) : (
              changeRequests.map((cr) => (
                <div key={cr.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cr.providers?.name || 'Provider'}</p>
                      <p className="text-xs text-gray-500">Field: <strong>{cr.field_name}</strong></p>
                    </div>
                    <span className={statusBadge(cr.status)}>{cr.status}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100"><p className="text-xs text-red-600 font-medium mb-1">Current</p><p className="text-sm text-gray-900">{cr.current_value || 'N/A'}</p></div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100"><p className="text-xs text-green-600 font-medium mb-1">Requested</p><p className="text-sm text-gray-900">{cr.requested_value}</p></div>
                  </div>
                  {cr.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleReviewChange(cr.id, true)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">Approve & Apply</button>
                      <button onClick={() => handleReviewChange(cr.id, false)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ============ AUDIT LOGS TAB ============ */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Audit Logs</h3>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Entity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{log.action}</span></td>
                          <td className="px-4 py-3 text-xs text-gray-600">{log.entity_type} / {log.entity_id?.slice(0, 8)}...</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{log.profiles?.full_name || 'Admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rides' && <RideAdminPanel />}
        {activeTab === 'catalog' && <CatalogPanel />}
        {activeTab === 'pricing' && <PricingPanel />}
        {activeTab === 'security' && <ChangePasswordPanel />}
        {activeTab === 'access' && isSystem && <InternalAccessPanel />}
        {activeTab === 'emails' && <EmailNotificationsPanel />}
        {activeTab === 'connect' && <ConnectPanel />}
        {activeTab === 'terms' && <TermsReportPanel />}


      </div>
    </section>

  );
};

export default AdminDashboard;
