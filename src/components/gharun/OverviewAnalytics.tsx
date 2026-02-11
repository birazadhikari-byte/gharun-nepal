import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Clock, Users, Car,
  ClipboardList, UserPlus, CheckCircle2, Shield, Activity, Filter,
  ChevronDown, ChevronUp, MapPin, Key, FileText, Eye, AlertTriangle,
  ArrowUpRight, BarChart3, Zap, Globe, Search
} from 'lucide-react';
import { adminGetActivityAnalytics, adminGetActivityTimeline } from '@/lib/database';

// ============ TYPES ============
interface AnalyticsData {
  today: {
    serviceRequests: number;
    providerSignups: number;
    rideRequests: number;
    completedJobs: number;
    auditActions: number;
  };
  yesterday: {
    serviceRequests: number;
    providerSignups: number;
    rideRequests: number;
    completedJobs: number;
    auditActions: number;
  };
  active: {
    providers: number;
    pendingRequests: number;
    rideDrivers: number;
    internalUsers: number;
  };
  hourlyData: number[];
  callerAccessLevel: string;
  timestamp: string;
}

interface TimelineEvent {
  id: string;
  source: string;
  type: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  actor_id?: string;
  details: any;
  timestamp: string;
  ip?: string;
}

interface TimelineData {
  timeline: TimelineEvent[];
  actionTypes: string[];
  teamMembers: { id: string; name: string }[];
  totalEvents: number;
}

// ============ HELPER: TREND INDICATOR ============
const TrendBadge: React.FC<{ today: number; yesterday: number }> = ({ today, yesterday }) => {
  if (yesterday === 0 && today === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-400">
        <Minus className="w-3 h-3" /> No change
        <span className="text-[9px] opacity-60 ml-0.5">/ परिवर्तन छैन</span>
      </span>
    );
  }
  if (yesterday === 0 && today > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600">
        <TrendingUp className="w-3 h-3" /> New today
        <span className="text-[9px] opacity-60 ml-0.5">/ आज नयाँ</span>
      </span>
    );
  }
  const diff = today - yesterday;
  const pct = yesterday > 0 ? Math.round((diff / yesterday) * 100) : 0;

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600">
        <TrendingUp className="w-3 h-3" /> +{diff} ({pct > 0 ? `+${pct}%` : 'new'})
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-500">
        <TrendingDown className="w-3 h-3" /> {diff} ({pct}%)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-400">
      <Minus className="w-3 h-3" /> Same as yesterday
    </span>
  );
};

// ============ SPARKLINE CHART ============
const Sparkline: React.FC<{ data: number[]; height?: number }> = ({ data, height = 48 }) => {
  const max = Math.max(...data, 1);
  const currentHour = new Date().getHours();
  const width = 100;
  const barWidth = width / 24;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {data.map((val, i) => {
        const barH = (val / max) * (height - 8);
        const isCurrent = i === currentHour;
        return (
          <g key={i}>
            <rect
              x={i * barWidth + 0.5}
              y={height - barH - 2}
              width={barWidth - 1}
              height={Math.max(barH, 1)}
              rx={1}
              className={
                isCurrent
                  ? 'fill-purple-500'
                  : val > 0
                  ? 'fill-purple-300'
                  : 'fill-gray-200'
              }
            />
            {isCurrent && (
              <circle
                cx={i * barWidth + barWidth / 2}
                cy={height - barH - 5}
                r={2}
                className="fill-purple-600"
              />
            )}
          </g>
        );
      })}
      {/* Hour labels */}
      {[0, 6, 12, 18].map(h => (
        <text key={h} x={h * barWidth + barWidth / 2} y={height} textAnchor="middle"
          className="fill-gray-400" style={{ fontSize: 3 }}>
          {h === 0 ? '12a' : h === 6 ? '6a' : h === 12 ? '12p' : '6p'}
        </text>
      ))}
    </svg>
  );
};

// ============ EVENT ICON & COLOR ============
const getEventMeta = (type: string) => {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string; label: string; labelNp: string }> = {
    new_service_request: { icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Service Request', labelNp: 'सेवा अनुरोध' },
    provider_signup: { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100', label: 'Provider Signup', labelNp: 'प्रदायक दर्ता' },
    new_ride_request: { icon: Car, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Ride Request', labelNp: 'सवारी अनुरोध' },
    create_provider: { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Provider Created', labelNp: 'प्रदायक सिर्जना' },
    update_provider: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Provider Updated', labelNp: 'प्रदायक अपडेट' },
    verify_provider: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Provider Verified', labelNp: 'प्रदायक प्रमाणित' },
    suspend_provider: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Provider Suspended', labelNp: 'प्रदायक निलम्बित' },
    hide_provider: { icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Provider Hidden', labelNp: 'प्रदायक लुकाइयो' },
    delete_provider: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Provider Deleted', labelNp: 'प्रदायक मेटाइयो' },
    update_request: { icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Request Updated', labelNp: 'अनुरोध अपडेट' },
    review_submission: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Submission Reviewed', labelNp: 'पेशकश समीक्षा' },
    review_change_request: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Change Reviewed', labelNp: 'परिवर्तन समीक्षा' },
    access_grant: { icon: Key, color: 'text-green-600', bg: 'bg-green-100', label: 'Access Granted', labelNp: 'पहुँच प्रदान' },
    access_revoke: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100', label: 'Access Revoked', labelNp: 'पहुँच रद्द' },
    access_update_level: { icon: Key, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Level Changed', labelNp: 'स्तर परिवर्तन' },
    grant_internal_access: { icon: Key, color: 'text-green-600', bg: 'bg-green-100', label: 'Access Granted', labelNp: 'पहुँच प्रदान' },
    revoke_internal_access: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100', label: 'Access Revoked', labelNp: 'पहुँच रद्द' },
    update_internal_level: { icon: Key, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Level Changed', labelNp: 'स्तर परिवर्तन' },
    ride_create_driver: { icon: Car, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Driver Created', labelNp: 'चालक सिर्जना' },
    ride_update_driver: { icon: Car, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Driver Updated', labelNp: 'चालक अपडेट' },
    ride_verify_driver: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Driver Verified', labelNp: 'चालक प्रमाणित' },
    ride_suspend_driver: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Driver Suspended', labelNp: 'चालक निलम्बित' },
    ride_create_connection: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Ride Connected', labelNp: 'सवारी जोडियो' },
    ride_update_request: { icon: Car, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Ride Updated', labelNp: 'सवारी अपडेट' },
  };
  return map[type] || { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100', label: type.replace(/_/g, ' '), labelNp: type };
};

// ============ TIME AGO ============
const timeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now / अहिले मात्र';
  if (mins < 60) return `${mins}m ago / ${mins} मिनेट अघि`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago / ${hours} घण्टा अघि`;
  const days = Math.floor(hours / 24);
  return `${days}d ago / ${days} दिन अघि`;
};

// ============ MAIN COMPONENT ============
const OverviewAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [actionFilter, setActionFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [timeRange, setTimeRange] = useState(24);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback data when API is unavailable
  const fallbackAnalytics: AnalyticsData = {
    today: { serviceRequests: 0, providerSignups: 0, rideRequests: 0, completedJobs: 0, auditActions: 0 },
    yesterday: { serviceRequests: 0, providerSignups: 0, rideRequests: 0, completedJobs: 0, auditActions: 0 },
    active: { providers: 0, pendingRequests: 0, rideDrivers: 0, internalUsers: 0 },
    hourlyData: Array(24).fill(0),
    callerAccessLevel: 'unknown',
    timestamp: new Date().toISOString(),
  };

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await adminGetActivityAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      console.error('Analytics load error:', err);
      // Use fallback data instead of showing error
      if (!analytics) {
        setAnalytics(fallbackAnalytics);
      }
      setError(err.message || 'Analytics temporarily unavailable — using cached data');
    }
  }, []);

  const loadTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const data = await adminGetActivityTimeline({
        hours: timeRange,
        action_filter: actionFilter !== 'all' ? actionFilter : undefined,
        team_member_filter: teamFilter !== 'all' ? teamFilter : undefined,
        limit: 100,
      });
      setTimeline(data);
    } catch (err: any) {
      console.error('Timeline load error:', err);
      // Don't crash — just show empty timeline
      if (!timeline) {
        setTimeline({ timeline: [], actionTypes: [], teamMembers: [], totalEvents: 0 });
      }
    } finally {
      setTimelineLoading(false);
    }
  }, [timeRange, actionFilter, teamFilter]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadAnalytics(), loadTimeline()]);
    setLastRefresh(new Date());
    setLoading(false);
  }, [loadAnalytics, loadTimeline]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadAll();
      }, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, loadAll]);

  // Reload timeline when filters change
  useEffect(() => {
    if (!loading) loadTimeline();
  }, [actionFilter, teamFilter, timeRange]);

  const handleManualRefresh = () => {
    loadAll();
  };

  // Filter timeline by search query
  const filteredTimeline = timeline?.timeline.filter(event => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      event.actor?.toLowerCase().includes(q) ||
      event.entity_id?.toLowerCase().includes(q) ||
      event.type?.toLowerCase().includes(q) ||
      getEventMeta(event.type).label.toLowerCase().includes(q)
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading analytics...</p>
          <p className="text-xs text-gray-400">विश्लेषण लोड गर्दै...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* ============ HEADER BAR ============ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-extrabold text-gray-900">Live Activity</h2>
            <span className="text-xs text-gray-400">/ प्रत्यक्ष गतिविधि</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString()} 
            {autoRefresh && <span className="ml-1 text-green-500">(auto-refresh on / स्वचालित रिफ्रेस चालु)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={handleManualRefresh}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ============ TODAY'S METRICS WITH TRENDS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {analytics && [
          {
            label: 'Service Requests',
            labelNp: 'सेवा अनुरोधहरू',
            today: analytics.today.serviceRequests,
            yesterday: analytics.yesterday.serviceRequests,
            icon: ClipboardList,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
          },
          {
            label: 'Provider Signups',
            labelNp: 'प्रदायक दर्ताहरू',
            today: analytics.today.providerSignups,
            yesterday: analytics.yesterday.providerSignups,
            icon: UserPlus,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
          },
          {
            label: 'Ride Requests',
            labelNp: 'सवारी अनुरोधहरू',
            today: analytics.today.rideRequests,
            yesterday: analytics.yesterday.rideRequests,
            icon: Car,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
          },
          {
            label: 'Completed Jobs',
            labelNp: 'पूरा भएका कामहरू',
            today: analytics.today.completedJobs,
            yesterday: analytics.yesterday.completedJobs,
            icon: CheckCircle2,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
          },
          {
            label: 'Team Actions',
            labelNp: 'टोली कार्यहरू',
            today: analytics.today.auditActions,
            yesterday: analytics.yesterday.auditActions,
            icon: Shield,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
          },
        ].map((metric, i) => (
          <div key={i} className={`${metric.bg} rounded-2xl p-4 border ${metric.border} relative overflow-hidden`}>
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
              <span className="text-[10px] text-gray-400 font-medium">TODAY</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{metric.today}</p>
            <p className="text-[11px] text-gray-600 font-medium mt-0.5">{metric.label}</p>
            <p className="text-[9px] text-gray-400">{metric.labelNp}</p>
            <div className="mt-2 pt-2 border-t border-gray-200/50">
              <TrendBadge today={metric.today} yesterday={metric.yesterday} />
              <p className="text-[9px] text-gray-400 mt-0.5">vs yesterday ({metric.yesterday}) / हिजो ({metric.yesterday})</p>
            </div>
            {/* Decorative gradient */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${metric.bg.replace('50', '400')}`} />
          </div>
        ))}
      </div>

      {/* ============ HOURLY ACTIVITY + PLATFORM STATUS ============ */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Hourly Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Today's Hourly Activity
              </h3>
              <p className="text-[10px] text-gray-400">आजको घण्टागत गतिविधि — Service requests by hour</p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          {analytics?.hourlyData && (
            <Sparkline data={analytics.hourlyData} height={80} />
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400">12 AM</span>
            <span className="text-[10px] text-gray-400">
              Peak hour: {analytics?.hourlyData ? `${analytics.hourlyData.indexOf(Math.max(...analytics.hourlyData))}:00` : 'N/A'}
              {' '}({analytics?.hourlyData ? Math.max(...analytics.hourlyData) : 0} requests)
            </span>
            <span className="text-[10px] text-gray-400">11 PM</span>
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <Globe className="w-4 h-4 text-green-500" />
            Platform Status
          </h3>
          <p className="text-[10px] text-gray-400 mb-3">प्लेटफर्म स्थिति — Active counts</p>
          {analytics && (
            <div className="space-y-3">
              {[
                { label: 'Active Providers', labelNp: 'सक्रिय प्रदायकहरू', value: analytics.active.providers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
                { label: 'Pending Requests', labelNp: 'पेन्डिङ अनुरोधहरू', value: analytics.active.pendingRequests, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { label: 'Active Ride Drivers', labelNp: 'सक्रिय चालकहरू', value: analytics.active.rideDrivers, icon: Car, color: 'text-amber-600', bg: 'bg-amber-100' },
                { label: 'Internal Team', labelNp: 'आन्तरिक टोली', value: analytics.active.internalUsers, icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                    <p className="text-[10px] text-gray-500 truncate">{item.label}</p>
                    <p className="text-[9px] text-gray-400 truncate">{item.labelNp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ ACTIVITY TIMELINE ============ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Timeline Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                Activity Timeline
                <span className="text-xs text-gray-400 font-normal">/ गतिविधि समयरेखा</span>
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Last {timeRange} hours — {timeline?.totalEvents || 0} events
                <span className="ml-1">/ पछिल्लो {timeRange} घण्टा — {timeline?.totalEvents || 0} घटनाहरू</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Time range selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-purple-400"
              >
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  showFilters || actionFilter !== 'all' || teamFilter !== 'all'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-3 h-3" />
                Filters
                {(actionFilter !== 'all' || teamFilter !== 'all') && (
                  <span className="w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] flex items-center justify-center">
                    {(actionFilter !== 'all' ? 1 : 0) + (teamFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  Action Type / कार्य प्रकार
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Actions / सबै कार्यहरू</option>
                  <option value="service_request">Service Requests / सेवा अनुरोध</option>
                  <option value="provider_signup">Provider Signups / प्रदायक दर्ता</option>
                  <option value="ride_request">Ride Requests / सवारी अनुरोध</option>
                  <option value="access_change">Access Changes / पहुँच परिवर्तन</option>
                  {timeline?.actionTypes.map(at => (
                    <option key={at} value={at}>{getEventMeta(at).label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  Team Member / टोली सदस्य
                </label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Members / सबै सदस्यहरू</option>
                  {timeline?.teamMembers.map(tm => (
                    <option key={tm.id} value={tm.id}>{tm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  Search / खोज्नुहोस्
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              {(actionFilter !== 'all' || teamFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setActionFilter('all'); setTeamFilter('all'); setSearchQuery(''); }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium sm:col-span-3"
                >
                  Clear all filters / सबै फिल्टर हटाउनुहोस्
                </button>
              )}
            </div>
          )}
        </div>

        {/* Timeline Content */}
        <div className="max-h-[600px] overflow-y-auto">
          {timelineLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTimeline.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No activity found</p>
              <p className="text-xs text-gray-400">कुनै गतिविधि भेटिएन</p>
              <p className="text-xs text-gray-400 mt-1">
                {actionFilter !== 'all' || teamFilter !== 'all'
                  ? 'Try adjusting your filters / फिल्टर समायोजन गर्नुहोस्'
                  : `No events in the last ${timeRange} hours / पछिल्लो ${timeRange} घण्टामा कुनै घटना छैन`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredTimeline.map((event) => {
                const meta = getEventMeta(event.type);
                const Icon = meta.icon;
                const isExpanded = expandedEvent === event.id;

                return (
                  <div
                    key={event.id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="w-full px-5 py-3.5 flex items-start gap-3 text-left"
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 ${meta.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          {event.source === 'access' && (
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold border border-red-100">
                              INTERNAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{meta.labelNp}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-700 font-medium">{event.actor}</span>
                          {event.entity_id && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-xs text-gray-500 truncate max-w-[200px]">{event.entity_id}</span>
                            </>
                          )}
                        </div>
                        {/* Quick detail preview */}
                        {event.details && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {event.details.service_type && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{event.details.service_type}</span>
                            )}
                            {event.details.location && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />{event.details.location}
                              </span>
                            )}
                            {event.details.pickup && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />{event.details.pickup}
                              </span>
                            )}
                            {event.details.status && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                event.details.status === 'completed' ? 'bg-green-100 text-green-700' :
                                event.details.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                event.details.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {event.details.status}
                              </span>
                            )}
                            {event.details.target_level && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                event.details.target_level === 'system' ? 'bg-red-50 text-red-700 border-red-200' :
                                event.details.target_level === 'core' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                event.details.target_level === 'control' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-green-50 text-green-700 border-green-200'
                              }`}>
                                {event.details.target_level?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(event.timestamp)}</p>
                        <p className="text-[9px] text-gray-300 mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</p>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-gray-300 ml-auto mt-1" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-gray-300 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && event.details && (
                      <div className="px-5 pb-4 ml-11">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-500 mb-1.5">
                            Event Details / घटना विवरण
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(event.details).map(([key, value]) => {
                              if (value === null || value === undefined || typeof value === 'object') return null;
                              return (
                                <div key={key} className="text-xs">
                                  <span className="text-gray-400 font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                  <span className="text-gray-700">{String(value)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-3 text-[10px] text-gray-400">
                            <span>Source: {event.source}</span>
                            <span>ID: {event.id.slice(0, 12)}...</span>
                            {event.ip && <span>IP: {event.ip}</span>}
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline Footer */}
        {filteredTimeline.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">
              Showing {filteredTimeline.length} of {timeline?.totalEvents || 0} events
              <span className="ml-1">/ {filteredTimeline.length} मध्ये {timeline?.totalEvents || 0} घटनाहरू</span>
            </p>
            {filteredTimeline.length >= 100 && (
              <p className="text-[10px] text-purple-500 font-medium">
                Max 100 events shown. Use filters to narrow results.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewAnalytics;
