import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle, ClipboardList, MapPin, Clock, CheckCircle2, AlertCircle,
  Search, Filter, Calendar, Phone, MessageCircle, Star, ChevronDown,
  ChevronRight, Send, ArrowRight, Package, Loader2, RefreshCw,
  User, Mail, Shield, Camera, Bell, XCircle, Eye, CreditCard, Download,
  Banknote, Wallet, FileText, Receipt
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { categories, JHAPA_AREAS, formatLocation, statusColors, statusLabels } from '@/data/gharunData';

import { createServiceRequest, fetchServiceRequests, fetchRequestByNumber, fetchClientPaymentSummary, fetchClientReceipts } from '@/lib/database';
import { openReceiptWindow } from '@/lib/receiptGenerator';
import DashboardSidebar from './DashboardSidebar';
import { t } from '@/lib/i18n';

const GHARUN_WHATSAPP = '9779713242471';


const ClientDashboard: React.FC<{ onGoHome: () => void; onLogout: () => void }> = ({ onGoHome, onLogout }) => {

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [trackNumber, setTrackNumber] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [requestFilter, setRequestFilter] = useState('all');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Payment state
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Request form state
  const [formData, setFormData] = useState({
    service_type: '',
    location: '',
    description: '',
    preferred_date: '',
    preferred_time: '',
    urgency: 'normal',
  });

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    setRefreshError(null);
    try {
      const data = await fetchServiceRequests({ client_id: user.id });
      setRequests(data || []);
    } catch (err: any) {
      console.error('Failed to load requests:', err);
      setRefreshError(err?.message || 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadPaymentData = useCallback(async () => {
    if (!user?.id) return;
    setPaymentLoading(true);
    try {
      const [payments, rcpts] = await Promise.all([
        fetchClientPaymentSummary(user.id),
        fetchClientReceipts(user.id).catch(() => []),
      ]);
      setPaymentData(payments || []);
      setReceipts(rcpts || []);
    } catch (err) {
      console.error('Failed to load payment data:', err);
    } finally {
      setPaymentLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadRequests(); }, [loadRequests]);
  useEffect(() => {
    if (activeTab === 'payments') loadPaymentData();
  }, [activeTab, loadPaymentData]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formattedLocation = formatLocation(formData.location);
      const newRequest = await createServiceRequest({
        client_name: user.name,
        client_phone: user.phone || '',
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
      setFormData({ service_type: '', location: '', description: '', preferred_date: '', preferred_time: '', urgency: 'normal' });
      setSubmitSuccess(true);
      setTimeout(() => { setSubmitSuccess(false); setActiveTab('my-requests'); }, 2500);
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err?.message || 'Failed to submit request. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };



  const handleTrack = async () => {
    if (!trackNumber.trim()) return;
    setTrackLoading(true);
    setTrackResult(null);
    try {
      const result = await fetchRequestByNumber(trackNumber.trim().toUpperCase());
      setTrackResult(result || { notFound: true });
    } catch {
      setTrackResult({ notFound: true });
    } finally {
      setTrackLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (requestFilter === 'all') return true;
    if (requestFilter === 'active') return ['submitted', 'confirmed', 'assigned', 'in-progress'].includes(r.status);
    if (requestFilter === 'completed') return r.status === 'completed';
    if (requestFilter === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const pendingCount = requests.filter(r => ['submitted', 'confirmed'].includes(r.status)).length;
  const activeCount = requests.filter(r => ['assigned', 'in-progress'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  // Payment summary calculations
  const pendingPayments = paymentData.filter(p => p.payment_status === 'pending' && (p.estimated_cost || p.final_cost));
  const paidPayments = paymentData.filter(p => p.payment_status === 'paid');
  const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.final_cost || p.estimated_cost || 0), 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.final_cost || p.estimated_cost || 0), 0);
  const pendingPaymentCount = pendingPayments.length;

  const statusSteps = ['submitted', 'confirmed', 'assigned', 'in-progress', 'completed'];

  const getStatusStep = (status: string) => statusSteps.indexOf(status);

  const handleDownloadReceipt = (requestId: string) => {
    const receipt = receipts.find(r => r.request_id === requestId);
    if (receipt) {
      openReceiptWindow({
        receipt_number: receipt.receipt_number,
        request_number: receipt.request_number,
        client_name: receipt.client_name,
        service_type: receipt.service_type,
        location: receipt.location,
        amount: receipt.amount,
        payment_method: receipt.payment_method,
        generated_at: receipt.generated_at,
      });
    }
  };

  const paymentStatusBadge = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        role="client"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onGoHome={onGoHome}
        userName={user?.name || 'Client'}
        userEmail={user?.email}
        badges={{ 'my-requests': pendingCount + activeCount, 'payments': pendingPaymentCount }}
      />

      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'new-request' && 'Submit New Request'}
                {activeTab === 'my-requests' && 'My Requests'}
                {activeTab === 'payments' && 'Payments'}
                {activeTab === 'track' && 'Track Service'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTab === 'overview' && `Welcome back, ${user?.name || 'there'}!`}
                {activeTab === 'new-request' && 'Tell us what service you need'}
                {activeTab === 'my-requests' && `${requests.length} total requests`}
                {activeTab === 'payments' && 'View your payment history and pending amounts'}
                {activeTab === 'track' && 'Track your service request status'}
                {activeTab === 'messages' && 'In-app messaging (coming soon)'}
                {activeTab === 'profile' && 'Manage your account'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { loadRequests(); if (activeTab === 'payments') loadPaymentData(); }} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => setActiveTab('new-request')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <PlusCircle className="w-4 h-4" /> New Request
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Error Banners */}
          {refreshError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Connection Error</p>
                <p className="text-xs text-red-600 mt-0.5">{refreshError}</p>
              </div>
              <button onClick={() => setRefreshError(null)} className="text-red-400 hover:text-red-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* ============ OVERVIEW ============ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Namaste, {user?.name}!</h2>
                    <p className="text-blue-100 text-sm">What service do you need today?</p>
                  </div>
                  <button onClick={() => setActiveTab('new-request')} className="px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Request Service
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                  { label: 'Active', value: activeCount, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                  { label: 'Total', value: requests.length, icon: ClipboardList, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} rounded-2xl p-5 border ${stat.border}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                    <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Requests */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Recent Requests</h3>
                  <button onClick={() => setActiveTab('my-requests')} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading your requests...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">No requests yet</h4>
                    <p className="text-sm text-gray-500 mb-4">Submit your first service request to get started</p>
                    <button onClick={() => setActiveTab('new-request')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                      Submit Request
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {requests.slice(0, 5).map((req) => (
                      <div key={req.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            req.status === 'submitted' ? 'bg-yellow-500' :
                            req.status === 'in-progress' ? 'bg-orange-500 animate-pulse' :
                            req.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{req.request_number}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {categories.find(c => c.id === req.service_type)?.name || req.service_type} - {req.location}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${statusColors[req.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[req.status] || req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid sm:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('new-request')} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all text-left group">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">New Request</p>
                  <p className="text-xs text-gray-500 mt-0.5">Submit a service request</p>
                </button>
                <button onClick={() => setActiveTab('payments')} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all text-left group">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">Payments</p>
                  <p className="text-xs text-gray-500 mt-0.5">View payment history</p>
                </button>
                <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help.')}`} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all text-left group">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">WhatsApp Support</p>
                  <p className="text-xs text-gray-500 mt-0.5">Chat with Gharun Connect</p>
                </a>
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Safe & Trusted Platform</p>
                  <p className="text-xs text-blue-700 mt-0.5">All service providers are verified by Gharun Nepal admin. Your contact details are kept private.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============ NEW REQUEST ============ */}
          {activeTab === 'new-request' && (
            <div className="max-w-2xl mx-auto">
              {submitSuccess ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                  <p className="text-sm text-gray-500 mb-1">We are finding a verified provider for you.</p>
                  <p className="text-xs text-gray-400">You'll be notified once a provider is assigned.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-white">
                    <h2 className="text-lg font-bold">Submit Service Request</h2>
                    <p className="text-sm text-blue-100">We will connect you with a verified provider</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Category *</label>
                      <select value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                        <option value="">Select a service...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nameNp})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        <MapPin className="w-4 h-4 inline mr-1" />Location (Jhapa District) *
                      </label>
                      <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white appearance-none">
                        <option value="">Select your area...</option>
                        {JHAPA_AREAS.map((area) => (
                          <option key={area.name} value={area.name}>{area.name} ({area.nameNp})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description *</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required
                        placeholder="Describe what you need..." rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Date</label>
                        <input type="date" value={formData.preferred_date} onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Time</label>
                        <select value={formData.preferred_time} onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                          <option value="">Anytime</option>
                          <option value="morning">Morning (6-12)</option>
                          <option value="afternoon">Afternoon (12-5)</option>
                          <option value="evening">Evening (5-9)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urgency</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'normal', label: 'Normal', color: 'border-gray-300 bg-gray-50' },
                          { id: 'urgent', label: 'Urgent', color: 'border-orange-300 bg-orange-50' },
                          { id: 'emergency', label: 'Emergency', color: 'border-red-300 bg-red-50' },
                        ].map(u => (
                          <button key={u.id} type="button" onClick={() => setFormData({ ...formData, urgency: u.id })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                              formData.urgency === u.id ? `${u.color} ring-2 ring-blue-300` : 'border-gray-200 bg-white text-gray-500'
                            }`}>
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Gharun Nepal only connects you with verified local providers. Service agreements are between you and the provider. We do not fix prices.
                      </p>
                    </div>

                    {/* Submit Error Display */}
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-red-800">Failed to submit request</p>
                          <p className="text-[11px] text-red-600 mt-0.5">{submitError}</p>
                        </div>
                        <button onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button type="submit" disabled={submitting || !formData.service_type || !formData.location || !formData.description}
                      className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Request</>}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* ============ MY REQUESTS ============ */}
          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: `All (${requests.length})` },
                  { id: 'active', label: `Active (${pendingCount + activeCount})` },
                  { id: 'completed', label: `Completed (${completedCount})` },
                  { id: 'cancelled', label: `Cancelled (${requests.filter(r => r.status === 'cancelled').length})` },
                ].map(f => (
                  <button key={f.id} onClick={() => setRequestFilter(f.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      requestFilter === f.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">No requests found</h4>
                  <p className="text-sm text-gray-500">
                    {requestFilter === 'all' ? 'Submit your first request to get started' : 'No requests match this filter'}
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isExpanded = expandedRequest === req.id;
                  const category = categories.find(c => c.id === req.service_type);
                  const currentStep = getStatusStep(req.status);
                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <button onClick={() => setExpandedRequest(isExpanded ? null : req.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            req.status === 'submitted' ? 'bg-yellow-500' :
                            req.status === 'in-progress' ? 'bg-orange-500 animate-pulse' :
                            req.status === 'completed' ? 'bg-green-500' :
                            req.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div className="text-left min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-900">{req.request_number}</p>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[req.status] || ''}`}>
                                {statusLabels[req.status] || req.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{category?.name || req.service_type} - {req.location}</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                          {/* Progress Steps */}
                          {req.status !== 'cancelled' && (
                            <div className="flex items-center gap-1 overflow-x-auto pb-2">
                              {statusSteps.map((step, i) => (
                                <React.Fragment key={step}>
                                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                                    i <= currentStep ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {i <= currentStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
                                    {statusLabels[step]}
                                  </div>
                                  {i < statusSteps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                                </React.Fragment>
                              ))}
                            </div>
                          )}

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Service</p>
                              <p className="text-sm font-medium">{category?.name || req.service_type}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Location</p>
                              <p className="text-sm font-medium">{req.location}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Preferred Date/Time</p>
                              <p className="text-sm font-medium">{req.preferred_date || 'Flexible'} {req.preferred_time || ''}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Submitted</p>
                              <p className="text-sm font-medium">{new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Description</p>
                            <p className="text-sm text-gray-700">{req.description}</p>
                          </div>

                          {/* Payment Info in expanded request */}
                          {(req.payment_method || req.estimated_cost || req.final_cost) && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                              <p className="text-xs text-blue-600 font-semibold mb-2">Payment Details</p>
                              <div className="grid sm:grid-cols-3 gap-2">
                                <div>
                                  <p className="text-[10px] text-blue-500">Method</p>
                                  <p className="text-xs font-semibold text-blue-900 capitalize">{req.payment_method || 'Cash'}</p>
                                </div>
                                {req.estimated_cost && (
                                  <div>
                                    <p className="text-[10px] text-blue-500">Estimated</p>
                                    <p className="text-xs font-semibold text-blue-900">Rs. {Number(req.estimated_cost).toLocaleString()}</p>
                                  </div>
                                )}
                                {req.final_cost && (
                                  <div>
                                    <p className="text-[10px] text-blue-500">Final Cost</p>
                                    <p className="text-xs font-semibold text-blue-900">Rs. {Number(req.final_cost).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                              {req.payment_status && (
                                <div className="mt-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${paymentStatusBadge(req.payment_status)}`}>
                                    {req.payment_status === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {req.assigned_provider_name && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-sm font-semibold text-green-900">Provider Assigned: {req.assigned_provider_name}</p>
                                <p className="text-xs text-green-700">The provider will contact you through the platform</p>
                              </div>
                            </div>
                          )}
                          {!req.assigned_provider_name && req.status === 'submitted' && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <div>
                                <p className="text-sm font-semibold text-yellow-900">Finding a verified provider for you...</p>
                                <p className="text-xs text-yellow-700">Our admin team is reviewing your request</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============ PAYMENTS TAB ============ */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {paymentLoading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading payment data...</p>
                </div>
              ) : (
                <>
                  {/* Payment Summary Cards */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-yellow-600 font-semibold uppercase tracking-wider">Pending</p>
                          <p className="text-xs text-yellow-700">{pendingPayments.length} request{pendingPayments.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-yellow-900">Rs. {totalPending.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Paid</p>
                          <p className="text-xs text-green-700">{paidPayments.length} request{paidPayments.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-green-900">Rs. {totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Total</p>
                          <p className="text-xs text-blue-700">{paymentData.length} request{paymentData.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-900">Rs. {(totalPending + totalPaid).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payment History Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">Payment History</h3>
                      </div>
                      <span className="text-xs text-gray-500">{paymentData.length} records</span>
                    </div>

                    {paymentData.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-1">No payment records</h4>
                        <p className="text-sm text-gray-500">Payment details will appear here once costs are set by admin</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Request</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Service</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Method</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Estimated</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Final</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paymentData.map((item) => {
                              const cat = categories.find(c => c.id === item.service_type);
                              const hasReceipt = receipts.some(r => r.request_id === item.id);
                              return (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <p className="text-xs font-bold text-gray-900">{item.request_number}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-xs font-medium text-gray-700">{cat?.name || item.service_type}</p>
                                    <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{item.location}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      item.payment_method === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {item.payment_method === 'online' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                      {item.payment_method === 'online' ? 'Online' : 'Cash'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <p className="text-xs font-medium text-gray-700">
                                      {item.estimated_cost ? `Rs. ${Number(item.estimated_cost).toLocaleString()}` : '-'}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <p className="text-xs font-bold text-gray-900">
                                      {item.final_cost ? `Rs. ${Number(item.final_cost).toLocaleString()}` : '-'}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${paymentStatusBadge(item.payment_status)}`}>
                                      {item.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {hasReceipt ? (
                                      <button
                                        onClick={() => handleDownloadReceipt(item.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-semibold hover:bg-blue-200 transition-colors"
                                      >
                                        <Download className="w-3 h-3" /> Receipt
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payment Info Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Payment Information</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Costs are set by the admin after provider confirmation. Payment receipts are generated automatically when payment is received. 
                        For any payment queries, contact us via WhatsApp.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============ TRACK ============ */}
          {activeTab === 'track' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Track Your Request</h3>
                <div className="flex gap-2">
                  <input type="text" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value.toUpperCase())}
                    placeholder="Enter request number (e.g., GN-260208-0001)"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()} />
                  <button onClick={handleTrack} disabled={trackLoading}
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {trackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {trackResult && (
                trackResult.notFound ? (
                  <div className="bg-white rounded-2xl border border-red-200 p-6 text-center">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">Request Not Found</h4>
                    <p className="text-sm text-gray-500">Please check the request number and try again.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">{trackResult.request_number}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[trackResult.status] || ''}`}>
                        {statusLabels[trackResult.status] || trackResult.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Service</p>
                        <p className="text-sm font-medium">{categories.find(c => c.id === trackResult.service_type)?.name || trackResult.service_type}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium">{trackResult.location}</p>
                      </div>
                    </div>
                    {trackResult.assigned_provider_name && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-xs text-green-600">Assigned Provider</p>
                        <p className="text-sm font-semibold text-green-900">{trackResult.assigned_provider_name}</p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* ============ MESSAGES ============ */}
          {activeTab === 'messages' && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">In-App Messaging</h3>
                <p className="text-sm text-gray-500 mb-4">Secure messaging with your service provider will be available soon. Phone numbers are masked for your safety.</p>
                <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help.')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                  <MessageCircle className="w-4 h-4" /> Contact via WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* ============ PROFILE ============ */}
          {activeTab === 'profile' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <p className="text-blue-100 text-sm">Client Account</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{user?.email || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{user?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Account Status</p>
                      <p className="text-sm font-medium">{user?.isVerified ? 'Verified' : 'Active'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <ClipboardList className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Requests</p>
                      <p className="text-sm font-medium">{requests.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800">
                  <strong>Privacy:</strong> Your phone number and personal details are never shared directly with service providers. All communication goes through Gharun Nepal's platform.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
