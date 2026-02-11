
import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Search, Filter, CheckCircle2, Clock, RefreshCw,
  TrendingUp, CreditCard, Banknote, Download, Calendar, ArrowUpRight
} from 'lucide-react';
import { adminListTransactions, adminMarkCashReceived, adminGetRevenueReport } from '@/lib/database';

const PaymentPanel: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmCash, setConfirmCash] = useState<string | null>(null);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const loadData = useCallback(async () => {
    try {
      const [txData, revData] = await Promise.all([
        adminListTransactions().catch(() => []),
        adminGetRevenueReport().catch(() => null),
      ]);
      setTransactions(txData || []);
      setRevenue(revData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkCashReceived = async (id: string) => {
    try {
      const data = await adminMarkCashReceived(id);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data, cash_received: true, payment_status: 'completed' } : t));
      setConfirmCash(null);
      showFeedback('Cash marked as received');
      // Reload revenue
      adminGetRevenueReport().then(r => { if (r) setRevenue(r); }).catch(() => {});
    } catch (err: any) { showFeedback('Error: ' + err.message); }
  };

  const handleExport = () => {
    const csv = [
      ['Order #', 'Client', 'Phone', 'Service', 'Amount', 'Method', 'Status', 'Cash Received', 'Date'].join(','),
      ...transactions.map(t => [
        t.order_number || '', t.client_name || '', t.client_phone || '', t.service_label || '',
        t.amount || 0, t.payment_method || '', t.payment_status || '',
        t.cash_received ? 'Yes' : 'No', new Date(t.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gharun-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('CSV exported');
  };

  const filtered = transactions.filter(t => {
    if (methodFilter !== 'all' && t.payment_method !== methodFilter) return false;
    if (statusFilter !== 'all' && t.payment_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.order_number?.toLowerCase().includes(q) ||
        t.client_name?.toLowerCase().includes(q) ||
        t.client_phone?.includes(q) ||
        t.service_label?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatNPR = (amount: number) => `Rs. ${(amount || 0).toLocaleString('en-NP')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
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

      {/* Revenue Report Cards */}
      {revenue && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Today', data: revenue.today, color: 'from-green-500 to-emerald-600' },
            { label: 'This Week', data: revenue.week, color: 'from-blue-500 to-indigo-600' },
            { label: 'This Month', data: revenue.month, color: 'from-purple-500 to-violet-600' },
            { label: 'All Time', data: revenue.all, color: 'from-gray-700 to-gray-900' },
          ].map((period, i) => (
            <div key={i} className={`bg-gradient-to-br ${period.color} rounded-2xl p-4 text-white relative overflow-hidden`}>
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
              <p className="text-xs font-medium opacity-80">{period.label}</p>
              <p className="text-2xl font-extrabold mt-1">{formatNPR(period.data?.total || 0)}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] opacity-80">
                <span className="flex items-center gap-0.5"><Banknote className="w-3 h-3" /> Cash: {formatNPR(period.data?.cash || 0)}</span>
                <span className="flex items-center gap-0.5"><CreditCard className="w-3 h-3" /> Online: {formatNPR(period.data?.online || 0)}</span>
              </div>
              <p className="text-[10px] opacity-60 mt-1">{period.data?.count || 0} transactions</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending Cash Alert */}
      {revenue?.pendingCash > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">{revenue.pendingCash} pending cash payments</p>
              <p className="text-xs text-amber-600">Cash orders awaiting confirmation of receipt</p>
            </div>
          </div>
          <button onClick={() => setStatusFilter('pending')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700">
            View Pending
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-green-500">
            <option value="all">All Methods</option>
            <option value="cash">Cash Only</option>
            <option value="online">Online Only</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-green-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => { setLoading(true); loadData(); }} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Transactions</h3>
          <p className="text-sm text-gray-500">Transactions are auto-created when orders are completed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Service</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Method</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono font-bold text-gray-700">{tx.order_number || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{tx.client_name}</p>
                      {tx.client_phone && <p className="text-[10px] text-gray-400">{tx.client_phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600">{tx.service_label || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-bold text-gray-900">{formatNPR(tx.amount)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.payment_method === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {tx.payment_method === 'online' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                        {tx.payment_method === 'online' ? 'Online' : 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.payment_status === 'completed' ? 'Received' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tx.payment_method === 'cash' && !tx.cash_received && (
                        confirmCash === tx.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleMarkCashReceived(tx.id)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700">
                              Confirm
                            </button>
                            <button onClick={() => setConfirmCash(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] font-bold hover:bg-gray-300">
                              No
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmCash(tx.id)}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-semibold hover:bg-green-200 flex items-center gap-1 ml-auto">
                            <CheckCircle2 className="w-3 h-3" /> Mark Received
                          </button>
                        )
                      )}
                      {tx.cash_received && (
                        <span className="text-[10px] text-green-600 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Received
                          {tx.cash_received_at && <span className="text-gray-400 ml-1">{new Date(tx.cash_received_at).toLocaleDateString()}</span>}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Summary Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">{filtered.length} transactions shown</p>
            <p className="text-sm font-bold text-gray-900">
              Total: {formatNPR(filtered.reduce((s, t) => s + Number(t.amount || 0), 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPanel;
