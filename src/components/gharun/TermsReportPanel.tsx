import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, FileText, Download, RefreshCw, Clock, CheckCircle2,
  AlertTriangle, TrendingUp, User, Briefcase, Search, ChevronDown,
  ChevronUp, Calendar, Globe, ArrowUpRight, X, Save, Loader2, History
} from 'lucide-react';
import {
  adminGetTermsReport,
  adminListTermsAcceptances,
  adminUpdateTermsVersion,
} from '@/lib/database';

const TermsReportPanel: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [acceptances, setAcceptances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newTermsVersion, setNewTermsVersion] = useState('');
  const [newPrivacyVersion, setNewPrivacyVersion] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  const [updatingVersion, setUpdatingVersion] = useState(false);
  const [versionError, setVersionError] = useState('');
  const [versionSuccess, setVersionSuccess] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reportData, acceptanceData] = await Promise.all([
        adminGetTermsReport().catch(() => null),
        adminListTermsAcceptances({ limit: 500 }).catch(() => []),
      ]);
      if (reportData) setReport(reportData);
      setAcceptances(acceptanceData || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load terms report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateVersion = async () => {
    if (!newTermsVersion && !newPrivacyVersion) {
      setVersionError('Please specify at least one new version.');
      return;
    }
    setUpdatingVersion(true);
    setVersionError('');
    setVersionSuccess('');
    try {
      await adminUpdateTermsVersion({
        new_terms_version: newTermsVersion || undefined,
        new_privacy_version: newPrivacyVersion || undefined,
        change_notes: changeNotes,
      });
      setVersionSuccess('Version updated successfully! All users will be re-prompted to accept the new terms.');
      setNewTermsVersion('');
      setNewPrivacyVersion('');
      setChangeNotes('');
      setTimeout(() => {
        setShowVersionModal(false);
        setVersionSuccess('');
        loadData();
      }, 2000);
    } catch (err: any) {
      setVersionError(err.message || 'Failed to update version');
    } finally {
      setUpdatingVersion(false);
    }
  };

  const handleExportCSV = useCallback(async () => {
    setExporting(true);
    try {
      const data = acceptances.length > 0 ? acceptances : await adminListTermsAcceptances({ limit: 5000 });
      if (!data || data.length === 0) {
        setExporting(false);
        return;
      }
      const headers = [
        'User ID', 'Name', 'Email', 'Phone', 'Role', 'Terms Version',
        'Privacy Version', 'Accepted Terms', 'Accepted Privacy',
        'Accepted At', 'User Agent', 'IP Address'
      ];
      const rows = (data || []).map((r: any) => [
        r.user_id || '',
        r.profile?.full_name || '',
        r.profile?.email || '',
        r.profile?.phone || '',
        r.role || '',
        r.terms_version || '',
        r.privacy_version || '',
        r.accepted_terms ? 'Yes' : 'No',
        r.accepted_privacy ? 'Yes' : 'No',
        r.accepted_at ? new Date(r.accepted_at).toISOString() : '',
        (r.user_agent || '').replace(/,/g, ';'),
        r.ip_address || '',
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `terms-acceptance-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('CSV export error:', err);
    } finally {
      setExporting(false);
    }
  }, [acceptances]);

  // Filter acceptances
  const filteredAcceptances = acceptances.filter((a: any) => {
    if (roleFilter !== 'all' && a.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = a.profile?.full_name?.toLowerCase() || '';
      const email = a.profile?.email?.toLowerCase() || '';
      const phone = a.profile?.phone || '';
      return name.includes(q) || email.includes(q) || phone.includes(q) || a.user_id?.includes(q);
    }
    return true;
  });

  // Get recent acceptances (last 7 days)
  const recentAcceptances = filteredAcceptances
    .filter((a: any) => {
      const d = new Date(a.accepted_at);
      return d.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
    })
    .slice(0, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading terms report...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  const acceptanceRate = report?.acceptanceRate || 0;
  const clientRate = report?.clientRate || 0;
  const providerRate = report?.providerRate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-extrabold text-gray-900">Terms Acceptance Report</h2>
            <span className="text-xs text-gray-400 font-medium">/ सर्त स्वीकृति रिपोर्ट</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Legal compliance dashboard for Terms of Service & Privacy Policy</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || acceptances.length === 0}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export CSV
          </button>
          <button
            onClick={() => { setShowVersionModal(true); setVersionError(''); setVersionSuccess(''); }}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Update Version
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Version Config */}
      {report?.config && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-purple-900">Active Version Configuration</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 border border-purple-100">
              <p className="text-[10px] text-purple-500 font-semibold">Terms Version</p>
              <p className="text-lg font-extrabold text-purple-900 font-mono">{report.config.terms_version}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-purple-100">
              <p className="text-[10px] text-purple-500 font-semibold">Privacy Version</p>
              <p className="text-lg font-extrabold text-purple-900 font-mono">{report.config.privacy_version}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-purple-100">
              <p className="text-[10px] text-purple-500 font-semibold">Terms Updated</p>
              <p className="text-xs font-bold text-purple-900">
                {report.config.terms_updated_at ? new Date(report.config.terms_updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-purple-100">
              <p className="text-[10px] text-purple-500 font-semibold">Privacy Updated</p>
              <p className="text-xs font-bold text-purple-900">
                {report.config.privacy_updated_at ? new Date(report.config.privacy_updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{report?.totalUsers || 0}</p>
          <p className="text-[10px] text-gray-500 font-semibold">Total Users</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-green-700">{report?.totalAccepted || 0}</p>
          <p className="text-[10px] text-gray-500 font-semibold">Accepted (Current)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{acceptanceRate}%</p>
          <p className="text-[10px] text-gray-500 font-semibold">Acceptance Rate</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-700">{report?.todayAccepted || 0}</p>
          <p className="text-[10px] text-gray-500 font-semibold">Today</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{report?.weekAccepted || 0}</p>
          <p className="text-[10px] text-gray-500 font-semibold">This Week</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-700">{report?.allTimeTotal || 0}</p>
          <p className="text-[10px] text-gray-500 font-semibold">All-Time Total</p>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Client Acceptance</h3>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-extrabold text-blue-700">{report?.clientAccepted || 0}</p>
              <p className="text-xs text-gray-500">of {report?.totalClients || 0} clients</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-600">{clientRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(clientRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-bold text-gray-900">Provider Acceptance</h3>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-extrabold text-green-700">{report?.providerAccepted || 0}</p>
              <p className="text-xs text-gray-500">of {report?.totalProviders || 0} providers</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-600">{providerRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(providerRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Acceptances Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900">Recent Acceptances (Last 7 Days)</h3>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
              {recentAcceptances.length}
            </span>
          </div>
          {showTimeline ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showTimeline && (
          <div className="px-5 pb-4">
            {recentAcceptances.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent acceptances</p>
            ) : (
              <div className="space-y-2">
                {recentAcceptances.map((a: any, i: number) => (
                  <div key={a.id || i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      a.role === 'provider' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {a.role === 'provider' ? (
                        <Briefcase className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {a.profile?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {a.profile?.email || a.user_id?.slice(0, 8) + '...'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        a.role === 'provider' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {a.role}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(a.accepted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Version History */}
      {report?.versionHistory && report.versionHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900">Version Change History</h3>
          </div>
          <div className="space-y-2">
            {report.versionHistory.map((v: any, i: number) => (
              <div key={v.id || i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">
                    Terms: {v.previous_terms_version} → {v.new_terms_version}
                    {v.previous_privacy_version !== v.new_privacy_version && (
                      <span className="ml-2">Privacy: {v.previous_privacy_version} → {v.new_privacy_version}</span>
                    )}
                  </p>
                  {v.change_notes && <p className="text-xs text-gray-500 truncate">{v.change_notes}</p>}
                </div>
                <p className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(v.changed_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Acceptance Records Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900">All Acceptance Records</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                {filteredAcceptances.length}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email..."
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-purple-500 focus:outline-none w-48"
                />
              </div>
              {(['all', 'client', 'provider'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRoleFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    roleFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
        {filteredAcceptances.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No acceptance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Version</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Accepted At</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAcceptances.slice(0, 100).map((a: any, i: number) => (
                  <tr key={a.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{a.profile?.full_name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500">{a.profile?.email || a.user_id?.slice(0, 12) + '...'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        a.role === 'provider' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        T:{a.terms_version} P:{a.privacy_version}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.accepted_terms && a.accepted_privacy ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700">
                          <CheckCircle2 className="w-3 h-3" /> Accepted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-700">
                          <AlertTriangle className="w-3 h-3" /> Partial
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500 whitespace-nowrap">
                      {a.accepted_at ? new Date(a.accepted_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] text-gray-400 max-w-[200px] truncate">
                        {a.user_agent?.slice(0, 60) || 'N/A'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAcceptances.length > 100 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Showing 100 of {filteredAcceptances.length} records. Export CSV for full data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Update Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowVersionModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-5 rounded-t-2xl text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Update Terms Version</h2>
                <p className="text-sm text-red-200">This will require ALL users to re-accept</p>
              </div>
              <button onClick={() => setShowVersionModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Updating the version will invalidate all existing acceptances.
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Every user (client & provider) will be required to re-accept the new terms before accessing the platform.
                  </p>
                </div>
              </div>

              {/* Current versions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-semibold">Current Terms</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{report?.config?.terms_version || 'v1.0'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-semibold">Current Privacy</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{report?.config?.privacy_version || 'v1.0'}</p>
                </div>
              </div>

              {/* New version inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Terms Version</label>
                  <input
                    type="text"
                    value={newTermsVersion}
                    onChange={(e) => setNewTermsVersion(e.target.value)}
                    placeholder="e.g. v2.0"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Privacy Version</label>
                  <input
                    type="text"
                    value={newPrivacyVersion}
                    onChange={(e) => setNewPrivacyVersion(e.target.value)}
                    placeholder="e.g. v2.0"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Change Notes (optional)</label>
                <textarea
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="Describe what changed in the terms/privacy policy..."
                  rows={3}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              {versionError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{versionError}</p>
                </div>
              )}

              {versionSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700 font-semibold">{versionSuccess}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateVersion}
                  disabled={updatingVersion || (!newTermsVersion && !newPrivacyVersion)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingVersion ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Update & Invalidate</>
                  )}
                </button>
                <button
                  onClick={() => setShowVersionModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsReportPanel;
