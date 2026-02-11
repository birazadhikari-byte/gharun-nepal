import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers, MapPin, Car, Plus, Edit3, Trash2, Save, X, Search,
  ToggleLeft, ToggleRight, RefreshCw, AlertTriangle, ChevronUp,
  ChevronDown, GripVertical, Check, XCircle, Package
} from 'lucide-react';
import {
  adminListServices, adminCreateService, adminUpdateService,
  adminToggleService, adminDeleteService,
  adminRideListAreas, adminRideCreateArea, adminRideUpdateArea,
  adminRideToggleArea, adminRideDeleteArea,
  adminRideListVehicleTypes, adminRideCreateVehicleType,
  adminRideUpdateVehicleType, adminRideToggleVehicleType,
  adminRideDeleteVehicleType,
} from '@/lib/database';

type CatalogSubTab = 'services' | 'areas' | 'vehicles';

// ============ INLINE EDIT ROW COMPONENT ============
interface InlineEditRowProps {
  item: any;
  fields: { key: string; label: string; type?: string; placeholder?: string }[];
  onSave: (id: string, updates: Record<string, any>) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  colorScheme: 'teal' | 'blue' | 'amber';
  icon: React.ReactNode;
  titleKey: string;
  subtitleKey?: string;
}

const InlineEditRow: React.FC<InlineEditRowProps> = ({
  item, fields, onSave, onToggle, onDelete, colorScheme, icon, titleKey, subtitleKey,
}) => {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const colors = {
    teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', focus: 'focus:border-teal-500', btn: 'bg-teal-600 hover:bg-teal-700', btnLight: 'bg-teal-100 text-teal-700 hover:bg-teal-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', focus: 'focus:border-blue-500', btn: 'bg-blue-600 hover:bg-blue-700', btnLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', focus: 'focus:border-amber-500', btn: 'bg-amber-600 hover:bg-amber-700', btnLight: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  }[colorScheme];

  const startEdit = () => {
    const data: Record<string, any> = {};
    fields.forEach(f => { data[f.key] = item[f.key] ?? ''; });
    setEditData(data);
    setEditing(true);
    setConfirmDelete(false);
  };

  const cancelEdit = () => { setEditing(false); setEditData({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(item.id, editData);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setSaving(true);
    try { await onDelete(item.id); } catch (err) { console.error(err); } finally { setSaving(false); setConfirmDelete(false); }
  };

  if (editing) {
    return (
      <div className={`bg-white rounded-2xl border-2 ${colors.border} shadow-lg p-5 space-y-4 transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-bold text-gray-900">Editing: {item[titleKey]}</span>
          </div>
          <button onClick={cancelEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  value={editData[f.key] || ''}
                  onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                  className={`w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none resize-none`}
                  rows={2}
                  placeholder={f.placeholder}
                />
              ) : f.type === 'number' ? (
                <input
                  type="number"
                  value={editData[f.key] ?? ''}
                  onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value === '' ? '' : Number(e.target.value) })}
                  className={`w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none`}
                  placeholder={f.placeholder}
                />
              ) : f.type === 'time' ? (
                <input
                  type="time"
                  value={editData[f.key] || ''}
                  onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                  className={`w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none`}
                />
              ) : (
                <input
                  type="text"
                  value={editData[f.key] || ''}
                  onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                  className={`w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none`}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={handleSave} disabled={saving}
            className={`flex-1 py-2.5 ${colors.btn} text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors`}>
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={cancelEdit}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md ${
      item.enabled !== false ? 'border-gray-200' : 'border-gray-200 opacity-60'
    }`}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 ${item.enabled !== false ? colors.bg : 'bg-gray-100'} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900 truncate">{item[titleKey]}</p>
            {subtitleKey && item[subtitleKey] && (
              <span className="text-xs text-gray-500 truncate">({item[subtitleKey]})</span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.sort_order !== undefined && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
                Sort: {item.sort_order}
              </span>
            )}
            {item.district && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
                {item.district}
              </span>
            )}
            {item.service_hours_start && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
                {item.service_hours_start?.slice(0, 5)} - {item.service_hours_end?.slice(0, 5)}
              </span>
            )}
            {item.capacity && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
                Cap: {item.capacity}
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              item.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {item.enabled !== false ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onToggle(item.id, item.enabled === false)}
            title={item.enabled !== false ? 'Disable' : 'Enable'}
            className={`p-1.5 rounded-lg transition-colors ${
              item.enabled !== false ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
            }`}>
            {item.enabled !== false ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
          </button>
          <button onClick={startEdit}
            title="Edit"
            className={`p-1.5 rounded-lg transition-colors ${colors.btnLight}`}>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={handleDelete} disabled={saving}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Confirm delete">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                title="Cancel">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={handleDelete}
              title="Delete"
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ CREATE FORM COMPONENT ============
interface CreateFormProps {
  fields: { key: string; label: string; type?: string; placeholder?: string; required?: boolean }[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  title: string;
  colorScheme: 'teal' | 'blue' | 'amber';
}

const CreateForm: React.FC<CreateFormProps> = ({ fields, onSubmit, onCancel, title, colorScheme }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const colors = {
    teal: { gradient: 'from-teal-600 to-emerald-700', btn: 'bg-teal-600 hover:bg-teal-700', focus: 'focus:border-teal-500' },
    blue: { gradient: 'from-blue-600 to-indigo-700', btn: 'bg-blue-600 hover:bg-blue-700', focus: 'focus:border-blue-500' },
    amber: { gradient: 'from-amber-600 to-orange-700', btn: 'bg-amber-600 hover:bg-amber-700', focus: 'focus:border-amber-500' },
  }[colorScheme];

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(formData);
      setFormData({});
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };

  const requiredFields = fields.filter(f => f.required);
  const isValid = requiredFields.every(f => formData[f.key]?.toString().trim());

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-8">
        <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-5 rounded-t-2xl text-white flex items-center justify-between`}>
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm opacity-80">Fill in the details below</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className={`w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none resize-none`}
                    rows={2}
                    placeholder={f.placeholder}
                  />
                ) : f.type === 'number' ? (
                  <input
                    type="number"
                    value={formData[f.key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value === '' ? '' : Number(e.target.value) })}
                    className={`w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none`}
                    placeholder={f.placeholder}
                  />
                ) : f.type === 'time' ? (
                  <input
                    type="time"
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className={`w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className={`w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm ${colors.focus} focus:outline-none`}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={saving || !isValid}
              className={`flex-1 py-3 ${colors.btn} text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors`}>
              <Plus className="w-4 h-4" /> {saving ? 'Creating...' : 'Create'}
            </button>
            <button onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN CATALOG PANEL ============
const CatalogPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<CatalogSubTab>('services');
  const [services, setServices] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadAll = useCallback(async () => {
    try {
      const [svcData, areaData, vtData] = await Promise.all([
        adminListServices().catch(() => []),
        adminRideListAreas().catch(() => []),
        adminRideListVehicleTypes().catch(() => []),
      ]);
      setServices(svcData || []);
      setAreas(areaData || []);
      setVehicleTypes(vtData || []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRefresh = () => { setRefreshing(true); loadAll(); };

  // ============ SERVICE HANDLERS ============
  const handleSaveService = async (id: string, updates: Record<string, any>) => {
    try {
      const result = await adminUpdateService(id, updates);
      setServices(prev => prev.map(s => s.id === id ? (result || { ...s, ...updates }) : s));
      showFeedback('Service updated successfully');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to update')); throw err; }
  };

  const handleToggleService = async (id: string, enabled: boolean) => {
    try {
      const result = await adminToggleService(id, enabled);
      setServices(prev => prev.map(s => s.id === id ? (result || { ...s, enabled }) : s));
      showFeedback(`Service ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed')); }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await adminDeleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      showFeedback('Service deleted');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to delete')); }
  };

  const handleCreateService = async (data: Record<string, any>) => {
    try {
      const result = await adminCreateService(data);
      setServices(prev => [...prev, result]);
      setShowCreateForm(false);
      showFeedback('Service created successfully');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to create')); throw err; }
  };

  // ============ AREA HANDLERS ============
  const handleSaveArea = async (id: string, updates: Record<string, any>) => {
    try {
      const result = await adminRideUpdateArea(id, updates);
      setAreas(prev => prev.map(a => a.id === id ? (result || { ...a, ...updates }) : a));
      showFeedback('Area updated successfully');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to update')); throw err; }
  };

  const handleToggleArea = async (id: string, enabled: boolean) => {
    try {
      const result = await adminRideToggleArea(id, enabled);
      setAreas(prev => prev.map(a => a.id === id ? (result || { ...a, enabled }) : a));
      showFeedback(`Area ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed')); }
  };

  const handleDeleteArea = async (id: string) => {
    try {
      await adminRideDeleteArea(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      showFeedback('Area deleted');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to delete')); }
  };

  const handleCreateArea = async (data: Record<string, any>) => {
    try {
      const result = await adminRideCreateArea(data);
      setAreas(prev => [...prev, result]);
      setShowCreateForm(false);
      showFeedback('Area created successfully');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to create')); throw err; }
  };

  // ============ VEHICLE TYPE HANDLERS ============
  const handleSaveVehicleType = async (id: string, updates: Record<string, any>) => {
    try {
      const result = await adminRideUpdateVehicleType(id, updates);
      setVehicleTypes(prev => prev.map(v => v.id === id ? (result || { ...v, ...updates }) : v));
      showFeedback('Vehicle type updated successfully');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to update')); throw err; }
  };

  const handleToggleVehicleType = async (id: string, enabled: boolean) => {
    try {
      const result = await adminRideToggleVehicleType(id, enabled);
      setVehicleTypes(prev => prev.map(v => v.id === id ? (result || { ...v, enabled }) : v));
      showFeedback(`Vehicle type ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed')); }
  };

  const handleDeleteVehicleType = async (id: string) => {
    try {
      await adminRideDeleteVehicleType(id);
      setVehicleTypes(prev => prev.filter(v => v.id !== id));
      showFeedback('Vehicle type deleted');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to delete')); }
  };

  const handleCreateVehicleType = async (data: Record<string, any>) => {
    try {
      const result = await adminRideCreateVehicleType(data);
      setVehicleTypes(prev => [...prev, result]);
      setShowCreateForm(false);
      showFeedback('Vehicle type created successfully');
    } catch (err: any) { showFeedback('Error: ' + (err.message || 'Failed to create')); throw err; }
  };

  // ============ FIELD DEFINITIONS ============
  const serviceFields = [
    { key: 'name', label: 'Name (EN)', placeholder: 'e.g., Plumbing', required: true },
    { key: 'name_np', label: 'Name (NP)', placeholder: 'e.g., प्लम्बिङ' },
    { key: 'slug', label: 'Slug', placeholder: 'e.g., plumbing' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    { key: 'icon', label: 'Icon Name', placeholder: 'e.g., wrench' },
    { key: 'category_group', label: 'Category Group', placeholder: 'e.g., home' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Service description...' },
  ];

  const areaFields = [
    { key: 'area_name', label: 'Area Name (EN)', placeholder: 'e.g., Birtamode', required: true },
    { key: 'area_name_np', label: 'Area Name (NP)', placeholder: 'e.g., बिर्तामोड' },
    { key: 'district', label: 'District', placeholder: 'e.g., Jhapa' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    { key: 'service_hours_start', label: 'Service Start', type: 'time' },
    { key: 'service_hours_end', label: 'Service End', type: 'time' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Area description...' },
  ];

  const vehicleFields = [
    { key: 'name', label: 'Name (EN)', placeholder: 'e.g., Auto Rickshaw', required: true },
    { key: 'name_np', label: 'Name (NP)', placeholder: 'e.g., अटो रिक्सा' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
    { key: 'capacity', label: 'Capacity', type: 'number', placeholder: 'e.g., 3' },
    { key: 'icon', label: 'Icon Name', placeholder: 'e.g., car' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Vehicle type description...' },
  ];

  // ============ SEARCH FILTER ============
  const filterItems = (items: any[], keys: string[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => keys.some(k => item[k]?.toString().toLowerCase().includes(q)));
  };

  const filteredServices = filterItems(services, ['name', 'name_np', 'slug', 'description', 'category_group']);
  const filteredAreas = filterItems(areas, ['area_name', 'area_name_np', 'district', 'description']);
  const filteredVehicles = filterItems(vehicleTypes, ['name', 'name_np', 'description']);

  // ============ SUB-TAB CONFIG ============
  const subTabConfig: Record<CatalogSubTab, {
    label: string; icon: React.ReactNode; count: number; color: string;
    items: any[]; titleKey: string; subtitleKey?: string;
    itemIcon: React.ReactNode; colorScheme: 'teal' | 'blue' | 'amber';
    fields: typeof serviceFields;
    onSave: (id: string, updates: Record<string, any>) => Promise<void>;
    onToggle: (id: string, enabled: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onCreate: (data: Record<string, any>) => Promise<void>;
    createTitle: string;
  }> = {
    services: {
      label: 'Services', icon: <Layers className="w-4 h-4" />, count: services.length,
      color: 'teal', items: filteredServices, titleKey: 'name', subtitleKey: 'name_np',
      itemIcon: <Package className="w-5 h-5 text-teal-700" />, colorScheme: 'teal',
      fields: serviceFields, onSave: handleSaveService, onToggle: handleToggleService,
      onDelete: handleDeleteService, onCreate: handleCreateService, createTitle: 'Create New Service',
    },
    areas: {
      label: 'Areas', icon: <MapPin className="w-4 h-4" />, count: areas.length,
      color: 'blue', items: filteredAreas, titleKey: 'area_name', subtitleKey: 'area_name_np',
      itemIcon: <MapPin className="w-5 h-5 text-blue-700" />, colorScheme: 'blue',
      fields: areaFields, onSave: handleSaveArea, onToggle: handleToggleArea,
      onDelete: handleDeleteArea, onCreate: handleCreateArea, createTitle: 'Create New Service Area',
    },
    vehicles: {
      label: 'Vehicle Types', icon: <Car className="w-4 h-4" />, count: vehicleTypes.length,
      color: 'amber', items: filteredVehicles, titleKey: 'name', subtitleKey: 'name_np',
      itemIcon: <Car className="w-5 h-5 text-amber-700" />, colorScheme: 'amber',
      fields: vehicleFields, onSave: handleSaveVehicleType, onToggle: handleToggleVehicleType,
      onDelete: handleDeleteVehicleType, onCreate: handleCreateVehicleType, createTitle: 'Create New Vehicle Type',
    },
  };

  const current = subTabConfig[activeSubTab];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading catalog data...</p>
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

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateForm
          fields={current.fields}
          onSubmit={current.onCreate}
          onCancel={() => setShowCreateForm(false)}
          title={current.createTitle}
          colorScheme={current.colorScheme}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Catalog Management</h2>
            <p className="text-xs text-gray-500">Manage services, areas, and vehicle types — full CRUD control</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(Object.keys(subTabConfig) as CatalogSubTab[]).map((tab) => {
            const cfg = subTabConfig[tab];
            const isActive = activeSubTab === tab;
            const tabColors: Record<string, string> = {
              teal: isActive ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
              blue: isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
              amber: isActive ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
            };
            return (
              <button key={tab} onClick={() => { setActiveSubTab(tab); setSearchQuery(''); setShowCreateForm(false); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${tabColors[cfg.color]}`}>
                {cfg.icon}
                {cfg.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cfg.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${current.label.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <button onClick={() => setShowCreateForm(true)}
            className={`px-4 py-2.5 ${
              activeSubTab === 'services' ? 'bg-teal-600 hover:bg-teal-700' :
              activeSubTab === 'areas' ? 'bg-blue-600 hover:bg-blue-700' :
              'bg-amber-600 hover:bg-amber-700'
            } text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap`}>
            <Plus className="w-4 h-4" /> Add {current.label === 'Vehicle Types' ? 'Vehicle' : current.label.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-extrabold text-gray-900">{current.items.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {searchQuery ? 'Matching' : 'Total'} {current.label}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700">
            {current.items.filter(i => i.enabled !== false).length}
          </p>
          <p className="text-xs text-green-600 mt-0.5">Enabled</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <p className="text-2xl font-extrabold text-red-600">
            {current.items.filter(i => i.enabled === false).length}
          </p>
          <p className="text-xs text-red-500 mt-0.5">Disabled</p>
        </div>
      </div>

      {/* Items List */}
      {current.items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {current.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {searchQuery ? `No ${current.label} Found` : `No ${current.label} Yet`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery
              ? `No ${current.label.toLowerCase()} match "${searchQuery}". Try a different search.`
              : `Create your first ${current.label.toLowerCase().slice(0, -1)} using the button above.`
            }
          </p>
          {!searchQuery && (
            <button onClick={() => setShowCreateForm(true)}
              className={`px-5 py-2.5 ${
                activeSubTab === 'services' ? 'bg-teal-600 hover:bg-teal-700' :
                activeSubTab === 'areas' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-amber-600 hover:bg-amber-700'
              } text-white rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2`}>
              <Plus className="w-4 h-4" /> Create {current.label.slice(0, -1)}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {current.items.map((item) => (
            <InlineEditRow
              key={item.id}
              item={item}
              fields={current.fields}
              onSave={current.onSave}
              onToggle={current.onToggle}
              onDelete={current.onDelete}
              colorScheme={current.colorScheme}
              icon={current.itemIcon}
              titleKey={current.titleKey}
              subtitleKey={current.subtitleKey}
            />
          ))}
        </div>
      )}

      {/* Info Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-700">Catalog Note</p>
          <p className="text-xs text-gray-500 mt-1">
            Disabling an item hides it from public users but keeps the data intact. Deleting is permanent.
            Changes to services, areas, and vehicle types take effect immediately on the public site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CatalogPanel;
