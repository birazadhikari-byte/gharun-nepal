
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Shield, ShieldOff, Trash2, ClipboardList, Phone, Mail,
  ChevronDown, ChevronUp, AlertTriangle, RefreshCw, UserCheck, XCircle,
  Clock, Filter
} from 'lucide-react';
import {
  adminListUsers, adminBlockUser, adminUnblockUser, adminDeleteUser, adminGetUserOrders
} from '@/lib/database';

const ROLE_COLORS: Record<string, string> = {
  client: 'bg-blue-100 text-blue-700',
  provider: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
  system: 'bg-red-100 text-red-700',
  core: 'bg-purple-100 text-purple-700',
  control: 'bg-indigo-100 text-indigo-700',
  ops: 'bg-amber-100 text-amber-700',
};

const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Record<string, any[]>>({});
  const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState<string | null>(null);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminListUsers({ limit: 200 });
      setUsers(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await adminListUsers({ search: searchQuery, role: roleFilter !== 'all' ? roleFilter : undefined });
      setUsers(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || searchQuery.trim().length === 0) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter]);

  const handleBlock = async (id: string) => {
    try {
      await adminBlockUser(id, blockReason || 'Blocked by admin');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_blocked: true, blocked_reason: blockReason } : u));
      setShowBlockModal(null);
      setBlockReason('');
      showFeedback('User blocked');
    } catch (err: any) { showFeedback('Error: ' + err.message); }
  };

  const handleUnblock = async (id: string) => {
    try {
      await adminUnblockUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_blocked: false, blocked_reason: null } : u));
      showFeedback('User unblocked');
    } catch (err: any) { showFeedback('Error: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setConfirmDelete(null);
      showFeedback('User deleted');
    } catch (err: any) { showFeedback('Error: ' + err.message); }
  };

  const loadUserOrders = async (userId: string) => {
    if (userOrders[userId]) return;
    setOrdersLoading(userId);
    try {
      const data = await adminGetUserOrders(userId);
      setUserOrders(prev => ({ ...prev, [userId]: data || [] }));
    } catch (err) { console.error(err); }
    finally { setOrdersLoading(null); }
  };

  const toggleExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      loadUserOrders(userId);
    }
  };

  const roleCounts = users.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const blockedCount = users.filter(u => u.is_blocked).length;

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-extrabold text-gray-700">{users.length}</p>
          <p className="text-xs font-semibold text-gray-500">Total Users</p>
        </div>
        <div className="bg-blue-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-extrabold text-blue-700">{roleCounts['client'] || 0}</p>
          <p className="text-xs font-semibold text-blue-600">Clients</p>
        </div>
        <div className="bg-green-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-extrabold text-green-700">{roleCounts['provider'] || 0}</p>
          <p className="text-xs font-semibold text-green-600">Providers</p>
        </div>
        <div className="bg-red-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-extrabold text-red-700">{(roleCounts['admin'] || 0) + (roleCounts['system'] || 0)}</p>
          <p className="text-xs font-semibold text-red-600">Admins</p>
        </div>
        <div className="bg-orange-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-extrabold text-orange-700">{blockedCount}</p>
          <p className="text-xs font-semibold text-orange-600">Blocked</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'client', 'provider', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
        <button onClick={() => { setLoading(true); loadUsers(); }} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBlockModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-red-500" /> Block User
            </h3>
            <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-red-500 focus:outline-none resize-none" rows={3} placeholder="Reason for blocking (optional)..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleBlock(showBlockModal)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700">
                Block User
              </button>
              <button onClick={() => { setShowBlockModal(null); setBlockReason(''); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isExpanded = expandedUser === user.id;
                  const orders = userOrders[user.id] || [];
                  const isAdmin = ['admin', 'system', 'core', 'control', 'ops'].includes(user.role);

                  return (
                    <React.Fragment key={user.id}>
                      <tr className={`hover:bg-gray-50 transition-colors ${user.is_blocked ? 'bg-red-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{user.id?.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.email && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>}
                          {user.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                            {user.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.is_blocked ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">BLOCKED</span>
                          ) : user.is_verified ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">VERIFIED</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">ACTIVE</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => toggleExpand(user.id)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="View orders">
                              <ClipboardList className="w-3.5 h-3.5" />
                            </button>
                            {!isAdmin && (
                              <>
                                {user.is_blocked ? (
                                  <button onClick={() => handleUnblock(user.id)}
                                    className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Unblock">
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button onClick={() => setShowBlockModal(user.id)}
                                    className="p-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors" title="Block">
                                    <ShieldOff className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {confirmDelete === user.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleDelete(user.id)}
                                      className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700">
                                      Confirm
                                    </button>
                                    <button onClick={() => setConfirmDelete(null)}
                                      className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] font-bold hover:bg-gray-300">
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDelete(user.id)}
                                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-gray-50">
                            <div className="ml-12">
                              {user.is_blocked && user.blocked_reason && (
                                <div className="p-2 bg-red-50 border border-red-100 rounded-lg mb-3">
                                  <p className="text-xs text-red-700"><strong>Block Reason:</strong> {user.blocked_reason}</p>
                                </div>
                              )}
                              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                <ClipboardList className="w-3.5 h-3.5" /> Order History
                              </h4>
                              {ordersLoading === user.id ? (
                                <div className="flex items-center gap-2 py-3">
                                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                  <span className="text-xs text-gray-500">Loading orders...</span>
                                </div>
                              ) : orders.length === 0 ? (
                                <p className="text-xs text-gray-400 py-2">No orders found for this user.</p>
                              ) : (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                  {orders.map((o: any) => (
                                    <div key={o.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-gray-700">{o.order_number || o.id?.slice(0, 8)}</span>
                                        <span className="text-xs text-gray-500">{o.service_label}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          o.status === 'completed' ? 'bg-green-100 text-green-700' :
                                          o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                          'bg-yellow-100 text-yellow-700'
                                        }`}>{o.status}</span>
                                        {o.final_cost && <span className="text-xs font-bold text-gray-700">Rs.{o.final_cost}</span>}
                                        <span className="text-[10px] text-gray-400">{new Date(o.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  ))}
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
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;
