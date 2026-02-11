
import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, RefreshCw, CheckCircle2, XCircle, Clock, Search,
  AlertCircle, TrendingUp, BarChart3, Filter, ChevronDown, Eye
} from 'lucide-react';
import { adminListEmailLogs, adminGetEmailStats, adminSendManualEmail } from '@/lib/database';

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  event_type: string;
  request_number: string | null;
  status: string;
  sendgrid_status_code: number | null;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  today: number;
  thisWeek: number;
}

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  submitted: { label: 'Request Submitted', color: 'bg-yellow-100 text-yellow-700', icon: '📋' },
  confirmed: { label: 'Request Confirmed', color: 'bg-blue-100 text-blue-700', icon: '✓' },
  assigned: { label: 'Provider Assigned', color: 'bg-indigo-100 text-indigo-700', icon: '👤' },
  'in-progress': { label: 'Work Started', color: 'bg-orange-100 text-orange-700', icon: '⚡' },
  completed: { label: 'Job Completed', color: 'bg-green-100 text-green-700', icon: '✅' },
  cancelled: { label: 'Request Cancelled', color: 'bg-red-100 text-red-700', icon: '✗' },
  payment_received: { label: 'Payment Received', color: 'bg-emerald-100 text-emerald-700', icon: '💰' },
  welcome: { label: 'Welcome Email', color: 'bg-purple-100 text-purple-700', icon: '🎉' },
};

const EmailNotificationsPanel: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [showManualSend, setShowManualSend] = useState(false);
  const [manualForm, setManualForm] = useState({
    eventType: 'confirmed',
    recipientEmail: '',
    recipientName: '',
    clientName: '',
    requestNumber: '',
    serviceType: '',
    location: '',
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const filters: any = {};
      if (filterType !== 'all') filters.event_type = filterType;
      if (filterStatus !== 'all') filters.status = filterStatus;
      
      const [logsData, statsData] = await Promise.all([
        adminListEmailLogs(filters).catch(() => []),
        adminGetEmailStats().catch(() => null),
      ]);
      setLogs(logsData || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load email data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleManualSend = async () => {
    if (!manualForm.recipientEmail || !manualForm.eventType) return;
    setSending(true);
    setSendResult(null);
    try {
      const result = await adminSendManualEmail(
        manualForm.eventType,
        {
          clientName: manualForm.clientName || manualForm.recipientName || 'Client',
          requestNumber: manualForm.requestNumber || 'N/A',
          serviceType: manualForm.serviceType || 'Service',
          location: manualForm.location || 'Jhapa',
          preferredDate: '',
          preferredTime: '',
          providerName: '',
          estimatedCost: '',
          finalCost: '',
        },
        manualForm.recipientEmail,
        manualForm.recipientName
      );
      setSendResult({ success: result?.success || false, message: result?.message || result?.error || 'Email sent' });
      if (result?.success) {
        setTimeout(() => loadData(), 1000);
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.recipient_email?.toLowerCase().includes(q) ||
        log.recipient_name?.toLowerCase().includes(q) ||
        log.subject?.toLowerCase().includes(q) ||
        log.request_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading email notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Email Notifications
            <span className="text-xs text-gray-400 font-normal">/ इमेल सूचनाहरू</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">SendGrid-powered automatic email notifications on status changes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualSend(!showManualSend)}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send Email
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-purple-600" />
              <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Total Sent</p>
            </div>
            <p className="text-2xl font-extrabold text-purple-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Delivered</p>
            </div>
            <p className="text-2xl font-extrabold text-green-900">{stats.sent}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">Failed</p>
            </div>
            <p className="text-2xl font-extrabold text-red-900">{stats.failed}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Today</p>
            </div>
            <p className="text-2xl font-extrabold text-blue-900">{stats.today}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">This Week</p>
            </div>
            <p className="text-2xl font-extrabold text-amber-900">{stats.thisWeek}</p>
          </div>
        </div>
      )}

      {/* Auto-notification Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-green-900">Automatic Email Notifications Active</h3>
            <p className="text-xs text-green-700 mt-1">
              Emails are automatically sent to clients when request status changes:
              <span className="font-semibold"> Submitted → Confirmed → Assigned → In Progress → Completed</span>.
              Both WhatsApp and Email notifications are sent simultaneously.
            </p>
            <p className="text-[10px] text-green-600 mt-1 italic">
              स्वचालित इमेल सूचना सक्रिय छ। स्थिति परिवर्तन हुँदा ग्राहकलाई WhatsApp र Email दुवै पठाइन्छ।
            </p>
          </div>
        </div>
      </div>

      {/* Manual Send Form */}
      {showManualSend && (
        <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-600" />
            Send Manual Email Notification
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Email Type *</label>
              <select
                value={manualForm.eventType}
                onChange={(e) => setManualForm({ ...manualForm, eventType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-purple-500 focus:outline-none"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Recipient Email *</label>
              <input
                type="email"
                value={manualForm.recipientEmail}
                onChange={(e) => setManualForm({ ...manualForm, recipientEmail: e.target.value })}
                placeholder="client@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Recipient Name</label>
              <input
                type="text"
                value={manualForm.recipientName}
                onChange={(e) => setManualForm({ ...manualForm, recipientName: e.target.value, clientName: e.target.value })}
                placeholder="Ram Bahadur"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Request Number</label>
              <input
                type="text"
                value={manualForm.requestNumber}
                onChange={(e) => setManualForm({ ...manualForm, requestNumber: e.target.value })}
                placeholder="GN-260210-0001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Service Type</label>
              <input
                type="text"
                value={manualForm.serviceType}
                onChange={(e) => setManualForm({ ...manualForm, serviceType: e.target.value })}
                placeholder="Plumbing"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Location</label>
              <input
                type="text"
                value={manualForm.location}
                onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                placeholder="Birtamode, Jhapa"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleManualSend}
              disabled={sending || !manualForm.recipientEmail}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Email</>
              )}
            </button>
            <button
              onClick={() => { setShowManualSend(false); setSendResult(null); }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
          {sendResult && (
            <div className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              sendResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {sendResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {sendResult.message}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, subject, or request number..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Email Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Email Logs</h3>
          <p className="text-sm text-gray-500">Email notifications will appear here when status changes trigger automatic emails.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Request</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => {
                  const typeInfo = EVENT_TYPE_LABELS[log.event_type] || { label: log.event_type, color: 'bg-gray-100 text-gray-600' };
                  const isExpanded = selectedLog === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(isExpanded ? null : log.id)}
                      >
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium text-gray-900 truncate max-w-[180px]">{log.recipient_email}</p>
                            {log.recipient_name && <p className="text-[10px] text-gray-400">{log.recipient_name}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{log.subject}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.request_number || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {log.status === 'sent' ? 'Sent' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <div className="grid sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-gray-400 font-semibold mb-1">SendGrid Status</p>
                                <p className="text-gray-700">{log.sendgrid_status_code || 'N/A'} {log.sendgrid_status_code === 202 ? '(Accepted)' : ''}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-semibold mb-1">Full Subject</p>
                                <p className="text-gray-700">{log.subject}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-semibold mb-1">Metadata</p>
                                <p className="text-gray-700">{log.metadata ? JSON.stringify(log.metadata) : 'N/A'}</p>
                              </div>
                              {log.error_message && (
                                <div className="sm:col-span-3">
                                  <p className="text-red-500 font-semibold mb-1">Error</p>
                                  <p className="text-red-600 bg-red-50 p-2 rounded text-[11px] font-mono break-all">{log.error_message}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Showing {filteredLogs.length} of {logs.length} email notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNotificationsPanel;
