import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, UserPlus, Key, Clock, AlertTriangle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, RefreshCw, Search, Eye, EyeOff,
  Lock, Unlock, History, X, Save, Mail, User, FileText
} from 'lucide-react';
import {
  adminListInternalUsers, adminGrantInternalAccess,
  adminUpdateInternalLevel, adminRevokeInternalAccess,
  adminGetInternalAccessLogs, adminGetMyInternalLevel
} from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

const ACCESS_LEVELS = [
  { id: 'system', label: 'SYSTEM', labelNp: 'प्रणाली', level: 4, color: 'bg-red-100 text-red-800 border-red-200', desc: 'Full platform authority and ownership control', descNp: 'पूर्ण प्लेटफर्म अधिकार र स्वामित्व नियन्त्रण' },
  { id: 'core', label: 'CORE', labelNp: 'मूल', level: 3, color: 'bg-purple-100 text-purple-800 border-purple-200', desc: 'Platform policy, approvals, and strategic oversight', descNp: 'प्लेटफर्म नीति, स्वीकृति, र रणनीतिक निरीक्षण' },
  { id: 'control', label: 'CONTROL', labelNp: 'नियन्त्रण', level: 2, color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Verification, compliance, and operational handling', descNp: 'प्रमाणीकरण, अनुपालन, र सञ्चालन ह्यान्डलिङ' },
  { id: 'ops', label: 'OPS', labelNp: 'सञ्चालन', level: 1, color: 'bg-green-100 text-green-800 border-green-200', desc: 'Task execution and support coordination', descNp: 'कार्य कार्यान्वयन र सहयोग समन्वय' },
];

const InternalAccessPanel: React.FC = () => {
  const { user } = useAuth();
  const [internalUsers, setInternalUsers] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [myLevel, setMyLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'users' | 'grant' | 'logs' | 'levels'>('users');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Grant form state
  const [grantForm, setGrantForm] = useState({
    email: '',
    display_name: '',
    access_level: 'ops',
    notes: '',
  });
  const [granting, setGranting] = useState(false);

  // Edit level state
  const [editingLevel, setEditingLevel] = useState<{ id: string; level: string; notes: string } | null>(null);
  const [savingLevel, setSavingLevel] = useState(false);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [users, level] = await Promise.all([
        adminListInternalUsers().catch(() => []),
        adminGetMyInternalLevel().catch(() => null),
      ]);
      setInternalUsers(users || []);
      setMyLevel(level);
    } catch (err) {
      console.error('Failed to load internal access data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const logs = await adminGetInternalAccessLogs(200);
      setAccessLogs(logs || []);
    } catch (err) {
      console.error('Failed to load access logs:', err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeView === 'logs') loadLogs();
  }, [activeView, loadLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    if (activeView === 'logs') loadLogs();
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantForm.email || !grantForm.display_name || !grantForm.access_level) {
      showFeedback('error', 'Please fill all required fields.');
      return;
    }
    setGranting(true);
    try {
      const result = await adminGrantInternalAccess({
        email: grantForm.email.trim().toLowerCase(),
        access_level: grantForm.access_level,
        display_name: grantForm.display_name.trim(),
        notes: grantForm.notes.trim() || undefined,
      });
      setInternalUsers(prev => {
        const exists = prev.find(u => u.id === result.id);
        if (exists) return prev.map(u => u.id === result.id ? result : u);
        return [result, ...prev];
      });
      setGrantForm({ email: '', display_name: '', access_level: 'ops', notes: '' });
      showFeedback('success', `Internal access granted to ${grantForm.email}`);
      setActiveView('users');
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to grant access');
    } finally {
      setGranting(false);
    }
  };

  const handleUpdateLevel = async () => {
    if (!editingLevel) return;
    setSavingLevel(true);
    try {
      await adminUpdateInternalLevel(editingLevel.id, editingLevel.level, editingLevel.notes || undefined);
      setInternalUsers(prev => prev.map(u =>
        u.id === editingLevel.id ? { ...u, access_level: editingLevel.level, notes: editingLevel.notes } : u
      ));
      showFeedback('success', 'Access level updated successfully');
      setEditingLevel(null);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update level');
    } finally {
      setSavingLevel(false);
    }
  };

  const handleRevokeAccess = async (id: string, email: string) => {
    if (!confirm(`Revoke internal access for ${email}? They will lose all internal privileges.`)) return;
    try {
      await adminRevokeInternalAccess(id);
      setInternalUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: false } : u));
      showFeedback('success', `Access revoked for ${email}`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to revoke access');
    }
  };

  const getLevelInfo = (level: string) => ACCESS_LEVELS.find(l => l.id === level);

  const filteredUsers = internalUsers.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.display_name?.toLowerCase().includes(q) || u.access_level?.toLowerCase().includes(q);
  });

  const activeUsers = filteredUsers.filter(u => u.is_active);
  const inactiveUsers = filteredUsers.filter(u => !u.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading internal access...</p>
          <p className="text-xs text-gray-400">आन्तरिक पहुँच लोड गर्दै...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300 ${
          feedback.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-extrabold text-gray-900">Internal Access Management</h2>
          </div>
          <p className="text-xs text-gray-500">
            Manage internal team access levels
            <span className="block text-[0.85em] opacity-70">आन्तरिक टोली पहुँच स्तर व्यवस्थापन</span>
          </p>
          {myLevel && (
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getLevelInfo(myLevel.access_level)?.color || 'bg-gray-100 text-gray-600'}`}>
                {myLevel.access_level?.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">Your access level / तपाईंको पहुँच स्तर</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {(['users', 'grant', 'levels', 'logs'] as const).map((view) => (
            <button key={view} onClick={() => setActiveView(view)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeView === view
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}>
              {view === 'users' ? 'Team' : view === 'grant' ? 'Grant Access' : view === 'levels' ? 'Access Levels' : 'Audit Logs'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACCESS_LEVELS.map(level => {
          const count = internalUsers.filter(u => u.access_level === level.id && u.is_active).length;
          return (
            <div key={level.id} className={`rounded-xl p-4 border ${level.color}`}>
              <p className="text-2xl font-extrabold">{count}</p>
              <p className="text-xs font-semibold">{level.label}</p>
              <p className="text-[10px] opacity-60">{level.labelNp}</p>
            </div>
          );
        })}
      </div>

      {/* ============ TEAM VIEW ============ */}
      {activeView === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, name, or level... / इमेल, नाम, वा स्तरले खोज्नुहोस्..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none" />
          </div>

          {/* Active Users */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Active Internal Users ({activeUsers.length})
              <span className="text-[0.85em] opacity-60 font-normal">/ सक्रिय आन्तरिक प्रयोगकर्ताहरू</span>
            </h3>
            {activeUsers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active internal users found</p>
                <p className="text-xs text-gray-400">कुनै सक्रिय आन्तरिक प्रयोगकर्ता भेटिएन</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeUsers.map((iu) => {
                  const levelInfo = getLevelInfo(iu.access_level);
                  const isExpanded = expandedUser === iu.id;
                  const isSelf = user?.email === iu.email;
                  return (
                    <div key={iu.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <button onClick={() => setExpandedUser(isExpanded ? null : iu.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            iu.access_level === 'system' ? 'bg-red-100' :
                            iu.access_level === 'core' ? 'bg-purple-100' :
                            iu.access_level === 'control' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <Shield className={`w-5 h-5 ${
                              iu.access_level === 'system' ? 'text-red-600' :
                              iu.access_level === 'core' ? 'text-purple-600' :
                              iu.access_level === 'control' ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">{iu.display_name}</p>
                              {isSelf && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">YOU</span>}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${levelInfo?.color || 'bg-gray-100 text-gray-600'}`}>
                                {iu.access_level?.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{iu.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {iu.last_login && (
                            <span className="text-[10px] text-gray-400 hidden sm:block">
                              Last: {new Date(iu.last_login).toLocaleDateString()}
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                          <div className="grid sm:grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-gray-500 font-medium">Access Level / पहुँच स्तर</p>
                              <p className="text-sm font-bold">{levelInfo?.label} — {levelInfo?.desc}</p>
                              <p className="text-xs text-gray-400">{levelInfo?.descNp}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-gray-500 font-medium">Granted / प्रदान गरिएको</p>
                              <p className="text-sm">{iu.granted_at ? new Date(iu.granted_at).toLocaleString() : 'N/A'}</p>
                              {iu.last_login && <p className="text-xs text-gray-400">Last login: {new Date(iu.last_login).toLocaleString()}</p>}
                            </div>
                          </div>
                          {iu.notes && (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4">
                              <p className="text-[10px] text-amber-600 font-medium">Notes / टिप्पणी</p>
                              <p className="text-sm text-amber-800">{iu.notes}</p>
                            </div>
                          )}
                          {!isSelf && (
                            <div className="flex gap-2">
                              <button onClick={() => setEditingLevel({ id: iu.id, level: iu.access_level, notes: iu.notes || '' })}
                                className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center gap-1.5">
                                <Key className="w-3.5 h-3.5" /> Change Level / स्तर परिवर्तन
                              </button>
                              <button onClick={() => handleRevokeAccess(iu.id, iu.email)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" /> Revoke / रद्द
                              </button>
                            </div>
                          )}
                          {isSelf && (
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <p className="text-xs text-gray-500">You cannot modify your own access. Another SYSTEM user must do this.</p>
                              <p className="text-[10px] text-gray-400">तपाईं आफ्नो पहुँच परिमार्जन गर्न सक्नुहुन्न। अर्को SYSTEM प्रयोगकर्ताले यो गर्नुपर्छ।</p>
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

          {/* Inactive Users */}
          {inactiveUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-gray-400" />
                Revoked Access ({inactiveUsers.length})
                <span className="text-[0.85em] opacity-60 font-normal">/ रद्द गरिएको पहुँच</span>
              </h3>
              <div className="space-y-2">
                {inactiveUsers.map((iu) => (
                  <div key={iu.id} className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-3 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 line-through">{iu.display_name}</p>
                        <p className="text-xs text-gray-400">{iu.email} — was {iu.access_level?.toUpperCase()}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">REVOKED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ GRANT ACCESS VIEW ============ */}
      {activeView === 'grant' && (
        <div className="max-w-xl">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-lg font-bold">Grant Internal Access</h3>
              </div>
              <p className="text-sm text-red-200">
                आन्तरिक पहुँच प्रदान गर्नुहोस्
              </p>
            </div>
            <form onSubmit={handleGrantAccess} className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-800 font-medium">This action grants internal platform access.</p>
                  <p className="text-xs text-amber-600 mt-0.5">यो कार्यले आन्तरिक प्लेटफर्म पहुँच प्रदान गर्छ। सावधानीपूर्वक प्रयोग गर्नुहोस्।</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email Address <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400 ml-1">/ इमेल ठेगाना</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={grantForm.email} onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
                    placeholder="team@gharunepal.com"
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Display Name <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400 ml-1">/ प्रदर्शन नाम</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={grantForm.display_name} onChange={(e) => setGrantForm({ ...grantForm, display_name: e.target.value })}
                    placeholder="Team member name"
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Access Level <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400 ml-1">/ पहुँच स्तर</span>
                </label>
                <div className="space-y-2">
                  {ACCESS_LEVELS.map(level => (
                    <label key={level.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        grantForm.access_level === level.id
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}>
                      <input type="radio" name="access_level" value={level.id}
                        checked={grantForm.access_level === level.id}
                        onChange={() => setGrantForm({ ...grantForm, access_level: level.id })}
                        className="mt-1 text-red-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${level.color}`}>{level.label}</span>
                          <span className="text-xs text-gray-400">{level.labelNp}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{level.desc}</p>
                        <p className="text-[10px] text-gray-400">{level.descNp}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Notes (optional)
                  <span className="font-normal text-gray-400 ml-1">/ टिप्पणी (वैकल्पिक)</span>
                </label>
                <textarea value={grantForm.notes} onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                  placeholder="Internal notes about this team member..."
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none resize-none" rows={2} />
              </div>

              <button type="submit" disabled={granting || !grantForm.email || !grantForm.display_name}
                className="w-full py-3 bg-red-700 text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {granting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Granting Access...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Grant Internal Access / आन्तरिक पहुँच प्रदान गर्नुहोस्</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ ACCESS LEVELS INFO ============ */}
      {activeView === 'levels' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Internal Access Hierarchy</h3>
            <p className="text-xs text-gray-500 mb-4">
              आन्तरिक पहुँच पदानुक्रम — Each level inherits permissions from levels below it
            </p>
            <div className="space-y-4">
              {ACCESS_LEVELS.map((level, i) => (
                <div key={level.id} className={`rounded-xl border-2 p-5 ${
                  level.id === 'system' ? 'border-red-200 bg-red-50/50' :
                  level.id === 'core' ? 'border-purple-200 bg-purple-50/50' :
                  level.id === 'control' ? 'border-blue-200 bg-blue-50/50' : 'border-green-200 bg-green-50/50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      level.id === 'system' ? 'bg-red-600' :
                      level.id === 'core' ? 'bg-purple-600' :
                      level.id === 'control' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {level.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900">{level.label}</span>
                        <span className="text-xs text-gray-400">{level.labelNp}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{level.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{level.descNp}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {level.id === 'system' && ['All permissions', 'Grant/revoke access', 'Delete data', 'Platform settings', 'View all logs'].map(p => (
                      <span key={p} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">{p}</span>
                    ))}
                    {level.id === 'core' && ['Approve providers', 'Set policies', 'Delete providers', 'Strategic decisions', 'View team'].map(p => (
                      <span key={p} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">{p}</span>
                    ))}
                    {level.id === 'control' && ['Verify providers', 'Manage submissions', 'Handle compliance', 'Create providers', 'Review changes'].map(p => (
                      <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">{p}</span>
                    ))}
                    {level.id === 'ops' && ['Update requests', 'Coordinate tasks', 'Support clients', 'View dashboard', 'Basic operations'].map(p => (
                      <span key={p} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-800 font-medium">Security Rules / सुरक्षा नियमहरू</p>
                <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Internal access cannot be selected during signup / साइन अप गर्दा आन्तरिक पहुँच छान्न सकिँदैन</li>
                  <li>No public registration exists for internal access / आन्तरिक पहुँचको लागि कुनै सार्वजनिक दर्ता छैन</li>
                  <li>Internal access is granted only through verified assignment / आन्तरिक पहुँच प्रमाणित असाइनमेन्ट मार्फत मात्र प्रदान गरिन्छ</li>
                  <li>Unauthorized attempts are denied silently / अनधिकृत प्रयासहरू चुपचाप अस्वीकार गरिन्छ</li>
                  <li>All internal actions are logged and auditable / सबै आन्तरिक कार्यहरू लग र लेखापरीक्षा योग्य छन्</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ AUDIT LOGS VIEW ============ */}
      {activeView === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Internal Access Logs ({accessLogs.length})</h3>
              <p className="text-xs text-gray-400">आन्तरिक पहुँच लगहरू — All access changes are recorded</p>
            </div>
          </div>
          {accessLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Access Logs</h3>
              <p className="text-sm text-gray-500">Access changes will be logged here automatically.</p>
              <p className="text-xs text-gray-400">पहुँच परिवर्तनहरू यहाँ स्वचालित रूपमा लग हुनेछन्।</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time / समय</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action / कार्य</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Target / लक्ष्य</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Level / स्तर</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">By / द्वारा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {accessLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            log.action === 'grant' ? 'bg-green-100 text-green-700' :
                            log.action === 'revoke' ? 'bg-red-100 text-red-700' :
                            log.action === 'update_level' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{log.target_email}</td>
                        <td className="px-4 py-3">
                          {log.target_access_level && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLevelInfo(log.target_access_level)?.color || 'bg-gray-100'}`}>
                              {log.target_access_level?.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{log.performed_by_email || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ EDIT LEVEL MODAL ============ */}
      {editingLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingLevel(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-5 rounded-t-2xl text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Change Access Level</h3>
                <p className="text-sm text-blue-200">पहुँच स्तर परिवर्तन गर्नुहोस्</p>
              </div>
              <button onClick={() => setEditingLevel(null)} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  New Access Level / नयाँ पहुँच स्तर
                </label>
                <div className="space-y-2">
                  {ACCESS_LEVELS.map(level => (
                    <label key={level.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        editingLevel.level === level.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input type="radio" name="edit_level" value={level.id}
                        checked={editingLevel.level === level.id}
                        onChange={() => setEditingLevel({ ...editingLevel, level: level.id })}
                        className="text-blue-600" />
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${level.color}`}>{level.label}</span>
                        <span className="text-xs text-gray-500 ml-2">{level.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / टिप्पणी</label>
                <textarea value={editingLevel.notes} onChange={(e) => setEditingLevel({ ...editingLevel, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none" rows={2} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleUpdateLevel} disabled={savingLevel}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {savingLevel ? 'Saving...' : 'Update Level'}
                </button>
                <button onClick={() => setEditingLevel(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
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

export default InternalAccessPanel;
