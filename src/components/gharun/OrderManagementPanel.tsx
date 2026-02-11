
import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, ChevronDown, ChevronUp, Phone, MapPin, Calendar,
  CheckCircle2, XCircle, Clock, TrendingUp, MessageSquare, UserCheck,
  Edit3, Save, X, AlertTriangle, DollarSign, RefreshCw, Filter
} from 'lucide-react';
import {
  adminListOrders, adminUpdateOrder, adminVerifyOrder, adminCancelOrder,
  adminListAllProviders
} from '@/lib/database';

const STATUS_FLOW = ['pending', 'verified', 'in_progress', 'completed'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  submitted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  assigned: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
  'in-progress': 'bg-orange-100 text-orange-700 border-orange-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const OrderManagementPanel: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const loadData = useCallback(async () => {
    try {
      const [ordData, provData] = await Promise.all([
        adminListOrders().catch(() => []),
        adminListAllProviders().catch(() => []),
      ]);
      setOrders(ordData || []);
      setProviders((provData || []).filter((p: any) => p.status === 'active' || p.verified));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVerify = async (id: string) => {
    setSaving(true);
    try {
      const data = await adminVerifyOrder(id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data, status: 'verified' } : o));
      showFeedback('Order verified');
    } catch (err: any) { showFeedback('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id: string) => {
    if (!cancelReason.trim()) { showFeedback('Please enter a cancel reason'); return; }
    setSaving(true);
    try {
      const data = await adminCancelOrder(id, cancelReason);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data, status: 'cancelled' } : o));
      setShowCancelModal(null);
      setCancelReason('');
      showFeedback('Order cancelled');
    } catch (err: any) { showFeedback('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSaving(true);
    try {
      const data = await adminUpdateOrder(id, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
      showFeedback(`Status updated to ${newStatus}`);
    } catch (err: any) { showFeedback('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleAssignProvider = async (orderId: string, providerId: string, providerName: string) => {
    setSaving(true);
    try {
      const data = await adminUpdateOrder(orderId, { assigned_provider_id: providerId, assigned_provider_name: providerName, status: 'assigned' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
      showFeedback(`Provider ${providerName} assigned`);
    } catch (err: any) { showFeedback('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      const data = await adminUpdateOrder(id, editData);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
      setEditingOrder(null);
      setEditData({});
      showFeedback('Order updated');
    } catch (err: any) { showFeedback('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const startEdit = (order: any) => {
    setEditingOrder(order.id);
    setEditData({
      estimated_cost: order.estimated_cost || '',
      final_cost: order.final_cost || '',
      preferred_date: order.preferred_date || '',
      preferred_time: order.preferred_time || '',
      payment_method: order.payment_method || 'cash',
      admin_notes: order.admin_notes || '',
    });
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.client_name?.toLowerCase().includes(q) ||
        o.client_phone?.includes(q) ||
        o.service_label?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedback && (
        <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300">
          {feedback}
        </div>
      )}

      {/* Stats Bar */}
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total', count: orders.length, color: 'bg-gray-100 text-gray-700' },
          { label: 'Submitted', count: (statusCounts['submitted'] || 0) + (statusCounts['pending'] || 0), color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Verified', count: statusCounts['verified'] || 0, color: 'bg-blue-100 text-blue-700' },
          { label: 'Assigned', count: statusCounts['assigned'] || 0, color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Completed', count: statusCounts['completed'] || 0, color: 'bg-green-100 text-green-700' },
          { label: 'Cancelled', count: statusCounts['cancelled'] || 0, color: 'bg-red-100 text-red-700' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-extrabold">{s.count}</p>
            <p className="text-xs font-semibold">{s.label}</p>
          </div>
        ))}
      </div>


      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID, name, phone, service..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'verified', 'assigned', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={() => { setLoading(true); loadData(); }} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Cancel Order
            </h3>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason for cancellation:</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none resize-none" rows={3} placeholder="Reason for cancellation..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleCancel(showCancelModal)} disabled={saving || !cancelReason.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
              <button onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-sm text-gray-500">Orders will appear here when clients submit them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const isEditing = editingOrder === order.id;
            const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600';

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header Row */}
                <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      order.status === 'pending' || order.status === 'submitted' ? 'bg-yellow-500 animate-pulse' :
                      order.status === 'in_progress' || order.status === 'in-progress' ? 'bg-orange-500 animate-pulse' :
                      order.status === 'completed' ? 'bg-green-500' :
                      order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{order.order_number || order.id?.slice(0, 8)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                          {(order.status || 'unknown').toUpperCase().replace('_', ' ')}
                        </span>
                        {order.urgency === 'emergency' && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">EMERGENCY</span>}
                        {order.payment_method && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium">
                            {order.payment_method === 'online' ? 'Online' : 'Cash'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {order.client_name} — {order.service_label || 'Service'} — {order.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {(order.final_cost || order.estimated_cost) && (
                      <span className="text-sm font-bold text-gray-900">Rs. {order.final_cost || order.estimated_cost}</span>
                    )}
                    <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    {/* Order Details Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">CLIENT</p>
                        <p className="text-sm font-bold text-gray-900">{order.client_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{order.client_phone}</p>
                        {order.client_email && <p className="text-xs text-gray-400 mt-0.5">{order.client_email}</p>}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">SERVICE</p>
                        <p className="text-sm font-bold text-gray-900">{order.service_label}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{order.location}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">SCHEDULE</p>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{order.preferred_date || 'Not set'}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.preferred_time || 'Any time'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">PAYMENT</p>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Rs. {order.final_cost || order.estimated_cost || '0'}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{order.payment_method || 'Cash'}</p>
                      </div>
                      {order.assigned_provider_name && (
                        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                          <p className="text-[10px] text-green-600 font-semibold mb-1">ASSIGNED PROVIDER</p>
                          <p className="text-sm font-bold text-green-800 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" />{order.assigned_provider_name}</p>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">TIMESTAMPS</p>
                        <p className="text-xs text-gray-600">Created: {new Date(order.created_at).toLocaleString()}</p>
                        {order.verified_at && <p className="text-xs text-blue-600">Verified: {new Date(order.verified_at).toLocaleString()}</p>}
                        {order.completed_at && <p className="text-xs text-green-600">Completed: {new Date(order.completed_at).toLocaleString()}</p>}
                      </div>
                    </div>

                    {order.description && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">DESCRIPTION</p>
                        <p className="text-sm text-gray-700">{order.description}</p>
                      </div>
                    )}

                    {order.cancel_reason && (
                      <div className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
                        <p className="text-[10px] text-red-600 font-semibold mb-1">CANCEL REASON</p>
                        <p className="text-sm text-red-700">{order.cancel_reason}</p>
                      </div>
                    )}

                    {/* Inline Edit Form */}
                    {isEditing ? (
                      <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-1"><Edit3 className="w-4 h-4" /> Edit Order</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Estimated Cost (Rs.)</label>
                            <input type="number" value={editData.estimated_cost} onChange={(e) => setEditData({ ...editData, estimated_cost: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Final Cost (Rs.)</label>
                            <input type="number" value={editData.final_cost} onChange={(e) => setEditData({ ...editData, final_cost: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Preferred Date</label>
                            <input type="date" value={editData.preferred_date} onChange={(e) => setEditData({ ...editData, preferred_date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Preferred Time</label>
                            <input type="time" value={editData.preferred_time} onChange={(e) => setEditData({ ...editData, preferred_time: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment Method</label>
                            <select value={editData.payment_method} onChange={(e) => setEditData({ ...editData, payment_method: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none bg-white">
                              <option value="cash">Cash</option>
                              <option value="online">Online</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Admin Notes</label>
                            <textarea value={editData.admin_notes} onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none resize-none" rows={2} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleSaveEdit(order.id)} disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button onClick={() => { setEditingOrder(null); setEditData({}); }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* Status actions based on current status */}
                      {(order.status === 'pending' || order.status === 'submitted') && (
                        <>
                          <button onClick={() => handleVerify(order.id)} disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                          </button>
                          <button onClick={() => handleStatusChange(order.id, 'confirmed')} disabled={saving}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        </>
                      )}

                      {(order.status === 'verified' || order.status === 'confirmed') && (
                        <div className="flex items-center gap-2">
                          <select className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                            onChange={(e) => {
                              const p = providers.find((pr: any) => pr.id === e.target.value);
                              if (p) handleAssignProvider(order.id, p.id, p.name);
                            }} defaultValue="">
                            <option value="" disabled>Assign provider...</option>
                            {providers.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name} - {p.service || p.service_label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {order.status === 'assigned' && (
                        <button onClick={() => handleStatusChange(order.id, 'in_progress')} disabled={saving}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> Start Progress
                        </button>
                      )}

                      {(order.status === 'in_progress' || order.status === 'in-progress') && (
                        <button onClick={() => handleStatusChange(order.id, 'completed')} disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                        </button>
                      )}

                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button onClick={() => setShowCancelModal(order.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}

                      {/* Common actions */}
                      <button onClick={() => startEdit(order)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      {order.client_phone && (
                        <>
                          <a href={`https://wa.me/${order.client_phone.replace(/[-\s()]/g, '').replace('+', '')}?text=${encodeURIComponent(`Namaste ${order.client_name}! Gharun Nepal order update.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <a href={`tel:${order.client_phone}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        </>
                      )}
                    </div>

                    {order.admin_notes && !isEditing && (
                      <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-[10px] text-purple-600 font-semibold">ADMIN NOTES</p>
                        <p className="text-xs text-purple-800">{order.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManagementPanel;
