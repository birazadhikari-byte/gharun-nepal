import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, ArrowUpRight, AlertTriangle, CheckCircle2, Clock, XCircle,
  MapPin, Phone, Calendar, MessageCircle, Star, ChevronDown, ChevronRight,
  RefreshCw, Search, Shield, TrendingUp, Users, Zap, Target, Award,
  Play, Flag, Send, FileText, Eye, UserCheck, AlertCircle, X, Plus,
  BarChart3, Activity, Timer, ThumbsUp, ThumbsDown, Loader2
} from 'lucide-react';
import { categories, statusColors, statusLabels } from '@/data/gharunData';
import {
  connectGetDashboard, connectGetPipeline, connectGetRequestDetail,
  connectConfirmRequest, connectAssignProvider, connectUpdateAssignment,
  connectStartWork, connectCompleteJob, connectVerifyCompletion,
  connectEscalate, connectCancelRequest, connectAddNote, connectSetPriority,
  connectGetProviderLeaderboard
} from '@/lib/database';

type ConnectView = 'dashboard' | 'pipeline' | 'detail' | 'leaderboard';

const PRIORITY_COLORS: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700 border-gray-300',
  urgent: 'bg-orange-100 text-orange-700 border-orange-300',
  emergency: 'bg-red-100 text-red-700 border-red-300',
};

const COORD_STATUS_COLORS: Record<string, string> = {
  uncoordinated: 'bg-gray-100 text-gray-600',
  reviewing: 'bg-blue-100 text-blue-700',
  matching: 'bg-purple-100 text-purple-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  verified: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-200 text-gray-700',
  escalated: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-50 text-red-600',
};

const EVENT_ICONS: Record<string, React.ElementType> = {
  created: Plus, confirmed: CheckCircle2, provider_assigned: UserCheck,
  provider_accepted: ThumbsUp, provider_declined: ThumbsDown,
  no_response: AlertCircle, work_started: Play, work_completed: CheckCircle2,
  completion_verified: Shield, escalated: AlertTriangle, cancelled: XCircle,
  note: FileText, priority_changed: Flag,
};

const ConnectPanel: React.FC = () => {
  const [view, setView] = useState<ConnectView>('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [qualityScore, setQualityScore] = useState(5);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadDashboard = useCallback(async () => {
    try {
      const data = await connectGetDashboard();
      setDashboard(data);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
    }
  }, []);

  const loadPipeline = useCallback(async () => {
    try {
      const data = await connectGetPipeline({ status: pipelineFilter, priority: priorityFilter, limit: 100 });
      setPipeline(data || []);
    } catch (err: any) {
      console.error('Pipeline load error:', err);
    }
  }, [pipelineFilter, priorityFilter]);

  const loadDetail = useCallback(async (requestId: string) => {
    try {
      const data = await connectGetRequestDetail(requestId);
      setDetail(data);
    } catch (err: any) {
      console.error('Detail load error:', err);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await connectGetProviderLeaderboard(30);
      setLeaderboard(data || []);
    } catch (err: any) {
      console.error('Leaderboard load error:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboard(), loadPipeline()]);
      setLoading(false);
    };
    init();
  }, [loadDashboard, loadPipeline]);

  useEffect(() => {
    if (view === 'leaderboard') loadLeaderboard();
  }, [view, loadLeaderboard]);

  useEffect(() => {
    if (selectedRequestId) loadDetail(selectedRequestId);
  }, [selectedRequestId, loadDetail]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), loadPipeline()]);
    if (selectedRequestId) await loadDetail(selectedRequestId);
    if (view === 'leaderboard') await loadLeaderboard();
    setRefreshing(false);
  };

  // ============ ACTIONS ============
  const doAction = async (label: string, fn: () => Promise<any>) => {
    setActionLoading(label);
    try {
      await fn();
      showFeedback(label + ' — success');
      await loadPipeline();
      if (selectedRequestId) await loadDetail(selectedRequestId);
      await loadDashboard();
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = (requestId: string) => {
    setSelectedRequestId(requestId);
    setView('detail');
  };

  const filteredPipeline = pipeline.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.request_number?.toLowerCase().includes(q) ||
      r.client_name?.toLowerCase().includes(q) ||
      r.service_type?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.assigned_provider_name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading Gharun Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C8102E] to-[#003893] rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Gharun Connect</h2>
              <p className="text-xs text-gray-500">Coordination Engine — Trust-First Operations</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-200 p-1.5">
        {[
          { id: 'dashboard' as ConnectView, label: 'Dashboard', icon: BarChart3 },
          { id: 'pipeline' as ConnectView, label: 'Pipeline', icon: Activity },
          { id: 'detail' as ConnectView, label: 'Request Detail', icon: Eye, disabled: !selectedRequestId },
          { id: 'leaderboard' as ConnectView, label: 'Provider Trust', icon: Award },
        ].map(tab => (
          <button key={tab.id} onClick={() => !tab.disabled && setView(tab.id)}
            disabled={tab.disabled}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              view === tab.id ? 'bg-[#C8102E] text-white shadow-sm' : tab.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ DASHBOARD VIEW ============ */}
      {view === 'dashboard' && dashboard && (
        <div className="space-y-6">
          {/* Pipeline Visualization */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C8102E]" /> Request Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Needs Action', value: dashboard.pipeline?.submitted || 0, color: 'from-yellow-500 to-amber-500', textColor: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', filter: 'needs_action' },
                { label: 'Assigned', value: dashboard.pipeline?.assigned || 0, color: 'from-indigo-500 to-purple-500', textColor: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', filter: 'assigned' },
                { label: 'In Progress', value: dashboard.pipeline?.inProgress || 0, color: 'from-orange-500 to-red-500', textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', filter: 'in-progress' },
                { label: 'Completed', value: dashboard.pipeline?.completed || 0, color: 'from-green-500 to-emerald-500', textColor: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', filter: 'completed' },
                { label: 'Escalated', value: dashboard.pipeline?.escalated || 0, color: 'from-red-500 to-rose-500', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', filter: 'escalated' },
                { label: 'Cancelled', value: dashboard.pipeline?.cancelled || 0, color: 'from-gray-400 to-gray-500', textColor: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', filter: 'cancelled' },
              ].map((stage, i) => (
                <button key={i} onClick={() => { setPipelineFilter(stage.filter); setView('pipeline'); }}
                  className={`${stage.bg} border ${stage.border} rounded-xl p-4 text-left hover:shadow-md transition-all group`}>
                  <p className={`text-2xl font-extrabold ${stage.textColor}`}>{stage.value}</p>
                  <p className="text-[10px] font-semibold text-gray-500 mt-1">{stage.label}</p>
                  <div className={`h-1 rounded-full bg-gradient-to-r ${stage.color} mt-2 opacity-60 group-hover:opacity-100 transition-opacity`} />
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-xs font-semibold text-green-600">Completion Rate</span>
              </div>
              <p className="text-3xl font-extrabold text-green-800">{dashboard.metrics?.completionRate || 0}%</p>
              <p className="text-[10px] text-green-600 mt-1">Target: 95%+</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">Avg. Completion</span>
              </div>
              <p className="text-3xl font-extrabold text-blue-800">{dashboard.metrics?.avgCompletionHours || 0}h</p>
              <p className="text-[10px] text-blue-600 mt-1">From request to done</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-semibold text-red-600">SLA Breaches</span>
              </div>
              <p className="text-3xl font-extrabold text-red-800">{dashboard.metrics?.slaBreaches || 0}</p>
              <p className="text-[10px] text-red-600 mt-1">Overdue requests</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600">Active Providers</span>
              </div>
              <p className="text-3xl font-extrabold text-purple-800">{dashboard.providers?.active || 0}</p>
              <p className="text-[10px] text-purple-600 mt-1">of {dashboard.providers?.total || 0} total</p>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Today</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">New Requests</span>
                <span className="text-lg font-extrabold text-gray-900">{dashboard.metrics?.todayRequests || 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h4 className="text-sm font-bold text-gray-900 mb-3">This Week</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Requests</span>
                <span className="text-lg font-extrabold text-gray-900">{dashboard.metrics?.weekRequests || 0}</span>
              </div>
            </div>
          </div>

          {/* Principles Banner */}
          <div className="bg-gradient-to-r from-[#C8102E]/5 to-[#003893]/5 border border-[#C8102E]/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-[#C8102E]" />
              <h4 className="text-sm font-bold text-gray-900">Gharun Connect Principles</h4>
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              {[
                { icon: Shield, label: 'Verified Only', desc: 'Every provider is admin-verified' },
                { icon: Eye, label: 'Full Oversight', desc: 'Admin controls every stage' },
                { icon: Activity, label: 'Clear Lifecycle', desc: 'No request left behind' },
                { icon: Target, label: 'Accountability', desc: 'No chaos, no ghosting' },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <p.icon className="w-4 h-4 text-[#C8102E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{p.label}</p>
                    <p className="text-[10px] text-gray-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ PIPELINE VIEW ============ */}
      {view === 'pipeline' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, number, service, location..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'active', label: 'Active' },
                { id: 'needs_action', label: 'Needs Action' },
                { id: 'assigned', label: 'Assigned' },
                { id: 'in-progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map(f => (
                <button key={f.id} onClick={() => setPipelineFilter(f.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pipelineFilter === f.id ? 'bg-[#C8102E] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex gap-1.5">
            {['all', 'normal', 'urgent', 'emergency'].map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  priorityFilter === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {p}
              </button>
            ))}
          </div>

          {/* Request Cards */}
          {filteredPipeline.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Requests</h3>
              <p className="text-sm text-gray-500">No requests match the current filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPipeline.map((req) => {
                const cat = categories.find(c => c.id === req.service_type);
                const isOverdue = req.sla_deadline && new Date(req.sla_deadline) < new Date() && !['completed', 'cancelled'].includes(req.status);
                const assignment = req.active_assignment;
                return (
                  <div key={req.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                      isOverdue ? 'border-red-300 bg-red-50/30' : req.escalation_level > 0 ? 'border-orange-300' : 'border-gray-200'
                    }`}
                    onClick={() => openDetail(req.id)}>
                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Status dot */}
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          req.status === 'submitted' ? 'bg-yellow-500 animate-pulse' :
                          req.status === 'confirmed' ? 'bg-blue-500' :
                          req.status === 'assigned' ? 'bg-indigo-500' :
                          req.status === 'in-progress' ? 'bg-orange-500 animate-pulse' :
                          req.status === 'completed' ? 'bg-green-500' :
                          req.status === 'cancelled' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">{req.request_number || 'N/A'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[req.status] || 'bg-gray-100'}`}>
                              {statusLabels[req.status] || req.status}
                            </span>
                            {req.priority && req.priority !== 'normal' && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${PRIORITY_COLORS[req.priority] || ''}`}>
                                {req.priority}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                                SLA BREACH
                              </span>
                            )}
                            {req.escalation_level > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                                ESC L{req.escalation_level}
                              </span>
                            )}
                            {req.coordination_status && req.coordination_status !== 'uncoordinated' && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${COORD_STATUS_COLORS[req.coordination_status] || 'bg-gray-100 text-gray-600'}`}>
                                {req.coordination_status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {req.client_name} — {cat?.name || req.service_type} — {req.location}
                          </p>
                          {assignment && (
                            <p className="text-[10px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> {assignment.provider_name}
                              {assignment.provider_response !== 'pending' && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  assignment.provider_response === 'accepted' ? 'bg-green-100 text-green-700' :
                                  assignment.provider_response === 'declined' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {assignment.provider_response}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-gray-400 hidden sm:block">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                        {req.total_assignment_attempts > 1 && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">
                            {req.total_assignment_attempts}x
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ DETAIL VIEW ============ */}
      {view === 'detail' && detail && (
        <div className="space-y-6">
          <button onClick={() => setView('pipeline')} className="text-sm text-[#C8102E] font-semibold hover:underline flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Pipeline
          </button>

          {/* Request Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-gray-900">{detail.request?.request_number}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[detail.request?.status] || ''}`}>
                    {statusLabels[detail.request?.status] || detail.request?.status}
                  </span>
                  {detail.request?.priority && detail.request.priority !== 'normal' && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${PRIORITY_COLORS[detail.request.priority] || ''}`}>
                      {detail.request.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {categories.find(c => c.id === detail.request?.service_type)?.name || detail.request?.service_type} — {detail.request?.location}
                </p>
              </div>
              {/* Priority Selector */}
              <div className="flex gap-1.5">
                {['normal', 'urgent', 'emergency'].map(p => (
                  <button key={p} onClick={() => doAction(`Priority → ${p}`, () => connectSetPriority(detail.request.id, p))}
                    disabled={actionLoading !== null}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      detail.request?.priority === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Info */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Users className="w-4 h-4 text-gray-400" />
                <div><p className="text-[10px] text-gray-500">Client</p><p className="text-xs font-semibold">{detail.request?.client_name}</p></div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" />
                <div><p className="text-[10px] text-gray-500">Phone</p><p className="text-xs font-semibold">{detail.request?.client_phone}</p></div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div><p className="text-[10px] text-gray-500">Preferred</p><p className="text-xs font-semibold">{detail.request?.preferred_date || 'Flexible'} {detail.request?.preferred_time || ''}</p></div>
              </div>
            </div>
            {detail.request?.description && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">Description</p>
                <p className="text-xs text-gray-700">{detail.request.description}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C8102E]" /> Coordination Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {detail.request?.status === 'submitted' && (
                <button onClick={() => doAction('Confirmed', () => connectConfirmRequest(detail.request.id))}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                  {actionLoading === 'Confirmed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Confirm Request
                </button>
              )}
              {['confirmed', 'assigned'].includes(detail.request?.status) && detail.request?.status === 'assigned' && (
                <button onClick={() => doAction('Work Started', () => connectStartWork(detail.request.id))}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Start Work
                </button>
              )}
              {detail.request?.status === 'in-progress' && (
                <button onClick={() => setShowCompleteModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete Job
                </button>
              )}
              {detail.request?.status === 'completed' && !detail.request?.completion_verified && (
                <button onClick={() => setShowVerifyModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Verify Completion
                </button>
              )}
              {!['completed', 'cancelled'].includes(detail.request?.status) && (
                <>
                  <button onClick={() => setShowEscalateModal(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                  </button>
                  <button onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              )}
              <button onClick={() => setShowNoteInput(!showNoteInput)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Add Note
              </button>
            </div>

            {/* Note Input */}
            {showNoteInput && (
              <div className="mt-3 flex gap-2">
                <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a coordination note..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#C8102E] focus:outline-none" />
                <button onClick={() => { if (noteText.trim()) { doAction('Note added', () => connectAddNote(detail.request.id, noteText)); setNoteText(''); setShowNoteInput(false); } }}
                  disabled={!noteText.trim() || actionLoading !== null}
                  className="px-4 py-2 bg-[#C8102E] text-white rounded-lg text-xs font-semibold hover:bg-[#a00d24] disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Provider Matching */}
          {['submitted', 'confirmed'].includes(detail.request?.status) && detail.matchedProviders?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#C8102E]" /> Matched Verified Providers ({detail.matchedProviders.length})
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {detail.matchedProviders.map((prov: any) => (
                  <div key={prov.id} className="border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#C8102E]/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-[#C8102E]">{prov.name?.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{prov.name}</p>
                        <p className="text-[10px] text-gray-500">{prov.service}</p>
                      </div>
                      {prov.verified && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500">
                      <MapPin className="w-3 h-3" /> {prov.location}
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500" /> {prov.rating || 0}</span>
                    </div>
                    {prov.metrics && (
                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-bold">
                          Trust: {Math.round(prov.metrics.reliability_score || 0)}%
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold">
                          {prov.metrics.total_completed || 0} done
                        </span>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px] font-bold">
                          {prov.metrics.streak_completed || 0} streak
                        </span>
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); doAction(`Assigned to ${prov.name}`, () => connectAssignProvider(detail.request.id, prov.id)); }}
                      disabled={actionLoading !== null}
                      className="w-full px-3 py-2 bg-[#C8102E] text-white rounded-lg text-xs font-semibold hover:bg-[#a00d24] disabled:opacity-50 flex items-center justify-center gap-1.5">
                      {actionLoading === `Assigned to ${prov.name}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                      Assign Provider
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Assignment */}
          {detail.assignments?.filter((a: any) => a.is_active).map((assignment: any) => (
            <div key={assignment.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-5">
              <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Active Assignment
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <p className="text-[10px] text-indigo-500 font-semibold">Provider</p>
                  <p className="text-xs font-bold text-indigo-900">{assignment.provider_name}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <p className="text-[10px] text-indigo-500 font-semibold">Response</p>
                  <p className={`text-xs font-bold ${
                    assignment.provider_response === 'accepted' ? 'text-green-700' :
                    assignment.provider_response === 'declined' ? 'text-red-700' :
                    'text-yellow-700'
                  }`}>{assignment.provider_response}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <p className="text-[10px] text-indigo-500 font-semibold">SLA Status</p>
                  <p className={`text-xs font-bold ${assignment.sla_status === 'on_track' ? 'text-green-700' : assignment.sla_status === 'at_risk' ? 'text-orange-700' : 'text-red-700'}`}>
                    {assignment.sla_status?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              {assignment.provider_response === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => doAction('Provider accepted', () => connectUpdateAssignment(assignment.id, 'accepted'))}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> Mark Accepted
                  </button>
                  <button onClick={() => doAction('Provider declined', () => connectUpdateAssignment(assignment.id, 'declined', 'Provider unavailable'))}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 flex items-center gap-1.5">
                    <ThumbsDown className="w-3.5 h-3.5" /> Mark Declined
                  </button>
                  <button onClick={() => doAction('No response', () => connectUpdateAssignment(assignment.id, 'no_response'))}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> No Response
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C8102E]" /> Request Timeline ({detail.timeline?.length || 0} events)
            </h4>
            {detail.timeline?.length > 0 ? (
              <div className="space-y-3">
                {detail.timeline.map((event: any, i: number) => {
                  const Icon = EVENT_ICONS[event.event_type] || FileText;
                  const isLast = i === detail.timeline.length - 1;
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.event_type === 'escalated' ? 'bg-red-100' :
                          event.event_type === 'cancelled' ? 'bg-red-50' :
                          event.event_type.includes('completed') || event.event_type.includes('verified') ? 'bg-green-100' :
                          event.event_type.includes('assigned') || event.event_type.includes('accepted') ? 'bg-indigo-100' :
                          'bg-gray-100'
                        }`}>
                          <Icon className={`w-3.5 h-3.5 ${
                            event.event_type === 'escalated' ? 'text-red-600' :
                            event.event_type === 'cancelled' ? 'text-red-500' :
                            event.event_type.includes('completed') || event.event_type.includes('verified') ? 'text-green-600' :
                            event.event_type.includes('assigned') || event.event_type.includes('accepted') ? 'text-indigo-600' :
                            'text-gray-500'
                          }`} />
                        </div>
                        {!isLast && <div className="w-px h-full bg-gray-200 my-1" />}
                      </div>
                      <div className="pb-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-gray-400">{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        {event.notes && <p className="text-xs text-gray-600 mt-0.5">{event.notes}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">by {event.actor_name} ({event.actor_role})</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No timeline events yet. Use Gharun Connect actions to start coordinating.</p>
            )}
          </div>

          {/* Assignment History */}
          {detail.assignments?.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Assignment History ({detail.assignments.length})</h4>
              <div className="space-y-2">
                {detail.assignments.filter((a: any) => !a.is_active).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${a.provider_response === 'declined' ? 'bg-red-500' : a.provider_response === 'no_response' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{a.provider_name}</p>
                      <p className="text-[10px] text-gray-500">{a.provider_response} — {a.decline_reason || 'N/A'}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(a.assigned_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ LEADERBOARD VIEW ============ */}
      {view === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#C8102E] to-[#003893] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6" />
              <h3 className="text-lg font-bold">Provider Trust Leaderboard</h3>
            </div>
            <p className="text-sm text-white/70">Reliability scores based on acceptance rate, completion rate, response time, and client ratings</p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Data Yet</h3>
              <p className="text-sm text-gray-500">Provider metrics will appear after assignments are tracked through Gharun Connect</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry: any, i: number) => {
                const prov = entry.providers || {};
                const score = Math.round(entry.reliability_score || 0);
                return (
                  <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{prov.name || 'Provider'}</p>
                          {prov.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{prov.service} — {prov.location}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-extrabold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {score}
                        </div>
                        <p className="text-[10px] text-gray-400">Trust Score</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { label: 'Assigned', value: entry.total_assigned || 0 },
                        { label: 'Accepted', value: entry.total_accepted || 0 },
                        { label: 'Completed', value: entry.total_completed || 0 },
                        { label: 'Declined', value: entry.total_declined || 0 },
                        { label: 'Avg Response', value: `${entry.avg_response_time_hours || 0}h` },
                        { label: 'Streak', value: entry.streak_completed || 0 },
                      ].map((m, j) => (
                        <div key={j} className="text-center p-1.5 bg-gray-50 rounded-lg">
                          <p className="text-xs font-bold text-gray-900">{m.value}</p>
                          <p className="text-[9px] text-gray-500">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Trust bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ MODALS ============ */}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Job</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Completion Notes</label>
                <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="How did the job go?" rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quality Score (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setQualityScore(s)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${qualityScore === s ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { doAction('Job completed', () => connectCompleteJob(detail.request.id, completionNotes, qualityScore)); setShowCompleteModal(false); setCompletionNotes(''); }}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50">
                  Complete Job
                </button>
                <button onClick={() => setShowCompleteModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowVerifyModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Completion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Client Satisfaction (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setSatisfactionScore(s)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${satisfactionScore === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { doAction('Completion verified', () => connectVerifyCompletion(detail.request.id, satisfactionScore)); setShowVerifyModal(false); }}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                  Verify
                </button>
                <button onClick={() => setShowVerifyModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEscalateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Escalate Request</h3>
            <textarea value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Why is this being escalated?" rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { if (escalateReason.trim()) { doAction('Escalated', () => connectEscalate(detail.request.id, escalateReason)); setShowEscalateModal(false); setEscalateReason(''); } }}
                disabled={!escalateReason.trim() || actionLoading !== null}
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 disabled:opacity-50">
                Escalate
              </button>
              <button onClick={() => setShowEscalateModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancel Request</h3>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..." rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { if (cancelReason.trim()) { doAction('Cancelled', () => connectCancelRequest(detail.request.id, cancelReason)); setShowCancelModal(false); setCancelReason(''); } }}
                disabled={!cancelReason.trim() || actionLoading !== null}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50">
                Cancel Request
              </button>
              <button onClick={() => setShowCancelModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectPanel;
