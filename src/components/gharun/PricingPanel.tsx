import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Edit3, Trash2, Plus, Save, X, RefreshCw,
  Loader2, CheckCircle2, AlertCircle, Search, Eye, EyeOff,
  ArrowUpDown
} from 'lucide-react';
import { adminListPricing, adminCreatePricing, adminUpdatePricing, adminDeletePricing } from '@/lib/database';
import { categories } from '@/data/gharunData';

interface PricingItem {
  id: string;
  service_category: string;
  service_category_name: string;
  service_category_name_np: string;
  job_scope: string;
  min_price: number;
  max_price: number;
  scope_description: string;
  scope_description_np: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const SCOPE_COLORS: Record<string, string> = {
  small: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  large: 'bg-purple-100 text-purple-700 border-purple-300',
};

const emptyForm = {
  service_category: '',
  service_category_name: '',
  service_category_name_np: '',
  job_scope: 'small',
  min_price: '',
  max_price: '',
  scope_description: '',
  scope_description_np: '',
  enabled: true,
};

const PricingPanel: React.FC = () => {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState('all');

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadPricing = useCallback(async () => {
    try {
      const data = await adminListPricing();
      setPricing((data || []).map((d: any) => ({ ...d, min_price: Number(d.min_price), max_price: Number(d.max_price) })));
    } catch (err: any) {
      console.error('Failed to load pricing:', err);
      showFeedback('Error loading pricing: ' + (err.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPricing(); }, [loadPricing]);

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    setForm({
      ...form,
      service_category: catId,
      service_category_name: cat?.name || '',
      service_category_name_np: cat?.nameNp || '',
    });
  };

  const handleSave = async () => {
    if (!form.service_category || !form.job_scope || !form.min_price || !form.max_price) {
      showFeedback('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await adminUpdatePricing(editingId, {
          service_category: form.service_category,
          service_category_name: form.service_category_name,
          service_category_name_np: form.service_category_name_np,
          job_scope: form.job_scope,
          min_price: Number(form.min_price),
          max_price: Number(form.max_price),
          scope_description: form.scope_description,
          scope_description_np: form.scope_description_np,
          enabled: form.enabled,
        });
        showFeedback('Pricing updated successfully');
      } else {
        await adminCreatePricing({
          service_category: form.service_category,
          service_category_name: form.service_category_name,
          service_category_name_np: form.service_category_name_np,
          job_scope: form.job_scope,
          min_price: Number(form.min_price),
          max_price: Number(form.max_price),
          scope_description: form.scope_description,
          scope_description_np: form.scope_description_np,
          enabled: form.enabled,
        });
        showFeedback('Pricing created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadPricing();
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: PricingItem) => {
    setEditingId(item.id);
    setForm({
      service_category: item.service_category,
      service_category_name: item.service_category_name,
      service_category_name_np: item.service_category_name_np,
      job_scope: item.job_scope,
      min_price: String(item.min_price),
      max_price: String(item.max_price),
      scope_description: item.scope_description,
      scope_description_np: item.scope_description_np,
      enabled: item.enabled,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing entry? This cannot be undone.')) return;
    try {
      await adminDeletePricing(id);
      setPricing(prev => prev.filter(p => p.id !== id));
      showFeedback('Pricing deleted');
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed to delete'));
    }
  };

  const handleToggleEnabled = async (item: PricingItem) => {
    try {
      await adminUpdatePricing(item.id, { enabled: !item.enabled });
      setPricing(prev => prev.map(p => p.id === item.id ? { ...p, enabled: !p.enabled } : p));
      showFeedback(item.enabled ? 'Pricing disabled' : 'Pricing enabled');
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Failed to toggle'));
    }
  };

  const filtered = pricing.filter(p => {
    if (filterScope !== 'all' && p.job_scope !== filterScope) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.service_category_name.toLowerCase().includes(q) || p.service_category.toLowerCase().includes(q) || p.scope_description.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.service_category]) acc[item.service_category] = [];
    acc[item.service_category].push(item);
    return acc;
  }, {} as Record<string, PricingItem[]>);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading pricing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300">
          {feedback}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-8">
            <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5 rounded-t-2xl text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{editingId ? 'Edit Pricing' : 'Add New Pricing'}</h2>
                <p className="text-sm text-purple-200">Service cost estimate entry</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Service Category *</label>
                  <select value={form.service_category} onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none bg-white">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nameNp})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Job Scope *</label>
                  <select value={form.job_scope} onChange={(e) => setForm({ ...form, job_scope: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none bg-white">
                    <option value="small">Small / सानो</option>
                    <option value="medium">Medium / मध्यम</option>
                    <option value="large">Large / ठूलो</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Price (Rs.) *</label>
                  <input type="number" value={form.min_price} onChange={(e) => setForm({ ...form, min_price: e.target.value })}
                    placeholder="e.g. 500" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max Price (Rs.) *</label>
                  <input type="number" value={form.max_price} onChange={(e) => setForm({ ...form, max_price: e.target.value })}
                    placeholder="e.g. 3000" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Scope Description (English)</label>
                <input type="text" value={form.scope_description} onChange={(e) => setForm({ ...form, scope_description: e.target.value })}
                  placeholder="e.g. Minor fixes: tap repair, small leaks" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Scope Description (Nepali)</label>
                <input type="text" value={form.scope_description_np} onChange={(e) => setForm({ ...form, scope_description_np: e.target.value })}
                  placeholder="e.g. सानो मर्मत: ट्याप मर्मत, सानो चुहावट" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Enabled (visible to clients)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !form.service_category || !form.min_price || !form.max_price}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Service Pricing Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{pricing.length} pricing entries across {Object.keys(grouped).length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setLoading(true); loadPricing(); }} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Pricing
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service name..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {['all', 'small', 'medium', 'large'].map(scope => (
            <button key={scope} onClick={() => setFilterScope(scope)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterScope === scope ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {scope === 'all' ? `All (${pricing.length})` : `${scope} (${pricing.filter(p => p.job_scope === scope).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Table grouped by category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">No pricing entries found</h4>
          <p className="text-sm text-gray-500">Add pricing entries for your service categories</p>
        </div>
      ) : (
        Object.entries(grouped).map(([catId, items]) => {
          const cat = categories.find(c => c.id === catId);
          return (
            <div key={catId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{cat?.name || catId}</h4>
                  <span className="text-xs text-gray-500">({cat?.nameNp})</span>
                </div>
                <span className="text-xs text-gray-400">{items.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Scope</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Min (Rs.)</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Max (Rs.)</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Description</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Status</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.sort((a, b) => {
                      const order = { small: 0, medium: 1, large: 2 };
                      return (order[a.job_scope as keyof typeof order] || 0) - (order[b.job_scope as keyof typeof order] || 0);
                    }).map(item => (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.enabled ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${SCOPE_COLORS[item.job_scope] || 'bg-gray-100 text-gray-600'}`}>
                            {item.job_scope}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{Number(item.min_price).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{Number(item.max_price).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700 truncate max-w-[200px]">{item.scope_description}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{item.scope_description_np}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleToggleEnabled(item)} title={item.enabled ? 'Disable' : 'Enable'}>
                            {item.enabled ? (
                              <Eye className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleEdit(item)} className="p-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PricingPanel;
