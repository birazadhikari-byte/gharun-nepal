import React, { useState, useEffect, useCallback } from 'react';
import {
  Car, Users, MapPin, CheckCircle2, XCircle, Clock, Plus, Edit3, Trash2,
  Eye, EyeOff, Star, RefreshCw, Search, Save, X, BarChart3, Navigation,
  Phone, MessageCircle, Shield, AlertTriangle, ChevronDown, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  adminRideListDrivers, adminRideCreateDriver, adminRideUpdateDriver,
  adminRideVerifyDriver, adminRideSuspendDriver, adminRideDeleteDriver,
  adminRideListVehicleTypes, adminRideToggleVehicleType,
  adminRideListAreas, adminRideToggleArea,
  adminRideListRequests, adminRideUpdateRequest,
  adminRideCreateConnection, adminRideGetStats,
} from '@/lib/database';

type RideAdminTab = 'overview' | 'drivers' | 'requests';


interface EditingDriver {
  id?: string;
  name: string;
  phone: string;
  vehicle_type_id: string;
  vehicle_number: string;
  vehicle_description: string;
  photo: string;
  location: string;
  area_id: string;
  status: string;
  verified: boolean;
  available: boolean;
  admin_notes: string;
}

const emptyDriver: EditingDriver = {
  name: '', phone: '', vehicle_type_id: '', vehicle_number: '', vehicle_description: '',
  photo: '', location: '', area_id: '', status: 'pending', verified: false, available: false, admin_notes: '',
};

const RideAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RideAdminTab>('overview');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingDriver, setEditingDriver] = useState<EditingDriver | null>(null);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [driverFilter, setDriverFilter] = useState('all');
  const [driverSearch, setDriverSearch] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [driversData, vtData, areasData, statsData] = await Promise.all([
        adminRideListDrivers().catch(() => []),
        adminRideListVehicleTypes().catch(() => []),
        adminRideListAreas().catch(() => []),
        adminRideGetStats().catch(() => null),
      ]);
      setDrivers(driversData || []);
      setVehicleTypes(vtData || []);
      setAreas(areasData || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load ride admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await adminRideListRequests();
      setRideRequests(data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (activeTab === 'requests') loadRequests(); }, [activeTab, loadRequests]);

  const handleRefresh = () => { setRefreshing(true); loadData(); if (activeTab === 'requests') loadRequests(); };

  // ============ DRIVER ACTIONS ============
  const handleSaveDriver = async () => {
    if (!editingDriver) return;
    setSaving(true);
    try {
      if (editingDriver.id) {
        const { id, ...updates } = editingDriver;
        const result = await adminRideUpdateDriver(id, updates);
        setDrivers(prev => prev.map(d => d.id === id ? result : d));
        showFeedback('Driver updated');
      } else {
        const result = await adminRideCreateDriver(editingDriver);
        setDrivers(prev => [result, ...prev]);
        showFeedback('Driver created');
      }
      setShowDriverForm(false);
      setEditingDriver(null);
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed'));
    } finally { setSaving(false); }
  };

  const handleVerifyDriver = async (id: string, verified: boolean) => {
    try {
      const result = await adminRideVerifyDriver(id, verified);
      setDrivers(prev => prev.map(d => d.id === id ? result : d));
      showFeedback(verified ? 'Driver approved' : 'Driver rejected');
    } catch (err) { console.error(err); }
  };

  const handleSuspendDriver = async (id: string) => {
    try {
      await adminRideSuspendDriver(id, 'Suspended by admin');
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'suspended', verified: false, available: false } : d));
      showFeedback('Driver suspended');
    } catch (err) { console.error(err); }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm('Permanently delete this driver?')) return;
    try {
      await adminRideDeleteDriver(id);
      setDrivers(prev => prev.filter(d => d.id !== id));
      showFeedback('Driver deleted');
    } catch (err) { console.error(err); }
  };

  const handleToggleVehicleType = async (id: string, enabled: boolean) => {
    try {
      const result = await adminRideToggleVehicleType(id, enabled);
      setVehicleTypes(prev => prev.map(v => v.id === id ? result : v));
      showFeedback(`Vehicle type ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) { console.error(err); }
  };

  const handleToggleArea = async (id: string, enabled: boolean) => {
    try {
      const result = await adminRideToggleArea(id, enabled);
      setAreas(prev => prev.map(a => a.id === id ? result : a));
      showFeedback(`Area ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) { console.error(err); }
  };

  const handleUpdateRideRequest = async (id: string, updates: Record<string, any>) => {
    try {
      await adminRideUpdateRequest(id, updates);
      setRideRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      showFeedback('Request updated');
    } catch (err) { console.error(err); }
  };

  const handleConnectDriver = async (requestId: string, driverId: string) => {
    try {
      await adminRideCreateConnection(requestId, driverId);
      setRideRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'matched' } : r));
      showFeedback('Driver connected to request');
    } catch (err) { console.error(err); }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[-\s()]/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Namaste ${name}! This is Gharun Connect.`)}`, '_blank');
  };

  const filteredDrivers = drivers.filter(d => {
    if (driverFilter !== 'all' && d.status !== driverFilter) return false;
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      return d.name?.toLowerCase().includes(q) || d.phone?.includes(q) || d.location?.toLowerCase().includes(q) || d.vehicle_number?.toLowerCase().includes(q);
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700', hidden: 'bg-gray-100 text-gray-600',
      rejected: 'bg-red-100 text-red-700', matched: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700', completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700', expired: 'bg-gray-100 text-gray-600',
      no_driver: 'bg-orange-100 text-orange-700',
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`;
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Ride Connector admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Auto & City Safari Connector</h2>
            <p className="text-xs text-gray-500">Admin Governance Panel — Coordination layer, not transport business</p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {(['overview', 'drivers', 'requests'] as RideAdminTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}>
              {tab}
            </button>
          ))}

        </div>
      </div>

      {/* ============ OVERVIEW ============ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Drivers', value: stats?.totalDrivers || drivers.length, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Users },
              { label: 'Active Drivers', value: stats?.activeDrivers || drivers.filter(d => d.status === 'active').length, color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle2 },
              { label: 'Total Requests', value: stats?.totalRequests || 0, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: Navigation },
              { label: 'Pending Requests', value: stats?.pendingRequests || 0, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-2xl p-5 border`}>
                <stat.icon className="w-6 h-6 mb-2" />
                <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-xs font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Area-wise Demand */}
          {stats?.areaDemand && Object.keys(stats.areaDemand).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" /> Area-wise Demand
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(stats.areaDemand).map(([area, count]: [string, any]) => (
                  <div key={area} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {area}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <button onClick={() => { setEditingDriver({ ...emptyDriver }); setShowDriverForm(true); setActiveTab('drivers'); }}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all text-left group">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-gray-900">Add Driver</p>
              <p className="text-xs text-gray-500 mt-0.5">Register new driver</p>
            </button>
            <button onClick={() => setActiveTab('requests')}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all text-left group">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-gray-900">Ride Requests</p>
            </button>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 text-left">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-gray-900">Areas & Vehicles</p>
              <p className="text-xs text-gray-500 mt-0.5">Managed via the <span className="font-bold text-teal-600">Catalog</span> tab</p>
            </div>

          </div>

          {/* Admin Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Admin Governance Note</p>
              <p className="text-xs text-amber-700 mt-1">
                Admin can view but not interfere in: ride fare, route, user-driver agreement.
                Admin may intervene only at coordination level, not in pricing or ride decisions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============ DRIVERS ============ */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Driver Form Modal */}
          {showDriverForm && editingDriver && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowDriverForm(false); setEditingDriver(null); }} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-5 rounded-t-2xl text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{editingDriver.id ? 'Edit Driver' : 'Register New Driver'}</h2>
                    <p className="text-sm text-amber-200">Admin-controlled driver profile</p>
                  </div>
                  <button onClick={() => { setShowDriverForm(false); setEditingDriver(null); }} className="p-1.5 hover:bg-white/20 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Driver Name *</label>
                      <input type="text" value={editingDriver.name} onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none" placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                      <input type="tel" value={editingDriver.phone} onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none" placeholder="+977-98..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Type *</label>
                      <select value={editingDriver.vehicle_type_id} onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_type_id: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none bg-white">
                        <option value="">Select type...</option>
                        {vehicleTypes.map(vt => <option key={vt.id} value={vt.id}>{vt.name} ({vt.name_np})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Number</label>
                      <input type="text" value={editingDriver.vehicle_number} onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_number: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none" placeholder="JH-01-001-1234" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Service Area *</label>
                      <select value={editingDriver.area_id} onChange={(e) => setEditingDriver({ ...editingDriver, area_id: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none bg-white">
                        <option value="">Select area...</option>
                        {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                      <input type="text" value={editingDriver.location} onChange={(e) => setEditingDriver({ ...editingDriver, location: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none" placeholder="Specific location" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Description</label>
                      <input type="text" value={editingDriver.vehicle_description} onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_description: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none" placeholder="e.g., Green Bajaj Auto" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                      <select value={editingDriver.status} onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value })}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none bg-white">
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Notes</label>
                    <textarea value={editingDriver.admin_notes} onChange={(e) => setEditingDriver({ ...editingDriver, admin_notes: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none resize-none" rows={2} />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingDriver.verified} onChange={(e) => setEditingDriver({ ...editingDriver, verified: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded" />
                      <span className="text-sm font-semibold text-gray-700">Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingDriver.available} onChange={(e) => setEditingDriver({ ...editingDriver, available: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm font-semibold text-gray-700">Available Now</span>
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveDriver} disabled={saving || !editingDriver.name || !editingDriver.phone}
                      className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : (editingDriver.id ? 'Update Driver' : 'Create Driver')}
                    </button>
                    <button onClick={() => { setShowDriverForm(false); setEditingDriver(null); }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={driverSearch} onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Search drivers..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'pending', 'suspended'] as const).map((filter) => (
                <button key={filter} onClick={() => setDriverFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize ${
                    driverFilter === filter ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {filter} ({filter === 'all' ? drivers.length : drivers.filter(d => d.status === filter).length})
                </button>
              ))}
            </div>
            <button onClick={() => { setEditingDriver({ ...emptyDriver }); setShowDriverForm(true); }}
              className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          </div>

          {/* Driver Cards */}
          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Drivers Found</h3>
              <p className="text-sm text-gray-500">Create a driver using the button above.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-gray-900 truncate">{driver.name}</p>
                          {driver.verified && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500">{driver.ride_vehicle_types?.name || 'N/A'} - {driver.vehicle_number || 'No plate'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className={statusBadge(driver.status)}>{driver.status}</span>
                      {driver.available && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Available</span>}
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-500" /> {driver.rating || 0}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{driver.total_connections || 0} trips</span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" /> {driver.location || driver.ride_service_areas?.area_name || 'N/A'}
                    </p>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingDriver({ ...driver, vehicle_type_id: driver.vehicle_type_id || '', area_id: driver.area_id || '', admin_notes: driver.admin_notes || '', photo: driver.photo || '', vehicle_description: driver.vehicle_description || '' }); setShowDriverForm(true); }}
                        className="flex-1 px-2 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200 flex items-center justify-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      {driver.status === 'pending' ? (
                        <>
                          <button onClick={() => handleVerifyDriver(driver.id, true)}
                            className="flex-1 px-2 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">Approve</button>
                          <button onClick={() => handleVerifyDriver(driver.id, false)}
                            className="px-2 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">Reject</button>
                        </>
                      ) : driver.status === 'active' ? (
                        <button onClick={() => handleSuspendDriver(driver.id)}
                          className="px-2 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Suspend
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleVerifyDriver(driver.id, true)}
                            className="flex-1 px-2 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200">Activate</button>
                          <button onClick={() => handleDeleteDriver(driver.id)}
                            className="px-2 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                    {driver.phone && (
                      <button onClick={() => openWhatsApp(driver.phone, driver.name)}
                        className="w-full mt-2 px-2 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 flex items-center justify-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {driver.phone}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ REQUESTS ============ */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {rideRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Ride Requests</h3>
              <p className="text-sm text-gray-500">Ride requests from users will appear here.</p>
            </div>
          ) : (
            rideRequests.map((req) => {
              const isExpanded = expandedRequest === req.id;
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button onClick={() => setExpandedRequest(isExpanded ? null : req.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-3 h-3 rounded-full ${req.status === 'pending' ? 'bg-yellow-500 animate-pulse' : req.status === 'matched' ? 'bg-blue-500' : req.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{req.request_number}</p>
                          <span className={statusBadge(req.status)}>{req.status}</span>
                          {req.urgency === 'now' && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">NOW</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{req.user_name} - {req.ride_vehicle_types?.name || req.preferred_vehicle || 'Any'}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /><span className="text-sm"><strong>Pickup:</strong> {req.pickup_location}</span></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-sm"><strong>Drop:</strong> {req.drop_location}</span></div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Area:</strong> {req.ride_service_areas?.area_name || 'N/A'}</span></div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Phone:</strong> {req.user_phone}</span></div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>Created:</strong> {new Date(req.created_at).toLocaleString()}</span></div>
                          {req.notes && <div className="text-sm text-gray-600"><strong>Notes:</strong> {req.notes}</div>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 w-full">
                            <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                              onChange={(e) => { if (e.target.value) handleConnectDriver(req.id, e.target.value); }} defaultValue="">
                              <option value="" disabled>Connect with a driver...</option>
                              {drivers.filter(d => d.status === 'active' && d.verified && d.available).map(d => (
                                <option key={d.id} value={d.id}>{d.name} - {d.ride_vehicle_types?.name} ({d.location})</option>
                              ))}
                            </select>
                            <button onClick={() => handleUpdateRideRequest(req.id, { status: 'cancelled' })}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">Cancel</button>
                          </div>
                        )}
                        {req.status === 'matched' && (
                          <button onClick={() => handleUpdateRideRequest(req.id, { status: 'completed' })}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">Mark Completed</button>
                        )}
                        <button onClick={() => openWhatsApp(req.user_phone, req.user_name)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );

};

export default RideAdminPanel;
