import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator, MapPin, ChevronRight, ArrowRight, Loader2,
  AlertCircle, Wrench, Zap, Sparkles, Paintbrush, Hammer,
  ShoppingBag, Pill, Scissors, BookOpen, Truck, Settings, Flower2,
  CheckCircle2, Info, X
} from 'lucide-react';
import { fetchServicePricing, type ServicePricing } from '@/lib/database';
import { categories, JHAPA_AREAS } from '@/data/gharunData';

const SCOPE_LABELS = {
  small: { en: 'Small', np: 'सानो', color: 'bg-green-100 text-green-800 border-green-300', ring: 'ring-green-400', gradient: 'from-green-500 to-emerald-600' },
  medium: { en: 'Medium', np: 'मध्यम', color: 'bg-blue-100 text-blue-800 border-blue-300', ring: 'ring-blue-400', gradient: 'from-blue-500 to-indigo-600' },
  large: { en: 'Large', np: 'ठूलो', color: 'bg-purple-100 text-purple-800 border-purple-300', ring: 'ring-purple-400', gradient: 'from-purple-500 to-violet-600' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  plumbing: Wrench, electrical: Zap, cleaning: Sparkles, painting: Paintbrush,
  carpentry: Hammer, grocery: ShoppingBag, pharmacy: Pill, beauty: Scissors,
  tutoring: BookOpen, delivery: Truck, appliance: Settings, gardening: Flower2,
};

interface CostEstimatorProps {
  onRequestService?: () => void;
  onClose?: () => void;
  isModal?: boolean;
  preSelectedCategory?: string;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({ onRequestService, onClose, isModal = false, preSelectedCategory }) => {
  const [pricing, setPricing] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || '');
  const [selectedScope, setSelectedScope] = useState<'small' | 'medium' | 'large' | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchServicePricing();
        setPricing(data);
      } catch (err) {
        console.error('Failed to load pricing:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (preSelectedCategory) setSelectedCategory(preSelectedCategory);
  }, [preSelectedCategory]);

  // Get unique categories from pricing data
  const availableCategories = useMemo(() => {
    const catIds = [...new Set(pricing.map(p => p.service_category))];
    return categories.filter(c => catIds.includes(c.id));
  }, [pricing]);

  // Get pricing for selected category
  const categoryPricing = useMemo(() => {
    if (!selectedCategory) return [];
    return pricing.filter(p => p.service_category === selectedCategory);
  }, [pricing, selectedCategory]);

  // Get the estimate
  const estimate = useMemo(() => {
    if (!selectedCategory || !selectedScope) return null;
    return categoryPricing.find(p => p.job_scope === selectedScope) || null;
  }, [categoryPricing, selectedScope]);

  const handleEstimate = () => {
    if (selectedCategory && selectedScope) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedScope('');
    setSelectedLocation('');
    setShowResult(false);
  };

  const selectedCat = categories.find(c => c.id === selectedCategory);
  const CatIcon = selectedCategory ? (CATEGORY_ICONS[selectedCategory] || Wrench) : Calculator;

  const content = (
    <div className={`${isModal ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] rounded-t-2xl px-6 py-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 20h20v20H20zM0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Service Cost Estimator</h2>
              <p className="text-sm text-white/80">सेवा लागत अनुमानक</p>
              <p className="text-xs text-white/60 mt-0.5">Get an instant price estimate for your service needs</p>
            </div>
          </div>
          {isModal && onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-b-2xl border border-gray-200 border-t-0">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#C8102E] animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading pricing data...</p>
          </div>
        ) : showResult && estimate ? (
          /* ============ RESULT VIEW ============ */
          <div className="p-6 space-y-6">
            {/* Estimate Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-[#C8102E]/20 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8102E] via-[#E8334A] to-[#C8102E]" />
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#C8102E]/10 rounded-xl flex items-center justify-center">
                  <CatIcon className="w-6 h-6 text-[#C8102E]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{selectedCat?.name || selectedCategory}</p>
                  <p className="text-xs text-gray-500">{selectedCat?.nameNp}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${SCOPE_LABELS[selectedScope as keyof typeof SCOPE_LABELS]?.color}`}>
                  {SCOPE_LABELS[selectedScope as keyof typeof SCOPE_LABELS]?.en} / {SCOPE_LABELS[selectedScope as keyof typeof SCOPE_LABELS]?.np}
                </span>
              </div>

              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Estimated Price Range / अनुमानित मूल्य</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#C8102E]">
                  Rs. {estimate.min_price.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-400 font-bold">—</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#C8102E]">
                  Rs. {estimate.max_price.toLocaleString()}
                </span>
              </div>

              {/* Scope Description */}
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 text-left">
                <p className="text-sm text-gray-700 font-medium">{estimate.scope_description}</p>
                <p className="text-xs text-gray-500 mt-1">{estimate.scope_description_np}</p>
              </div>

              {selectedLocation && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[#C8102E]" />
                  <span>Jhapa, {selectedLocation}</span>
                </div>
              )}
            </div>

            {/* All Scopes Comparison */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">All Scope Options / सबै विकल्पहरू</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                {(['small', 'medium', 'large'] as const).map(scope => {
                  const p = categoryPricing.find(cp => cp.job_scope === scope);
                  if (!p) return null;
                  const isSelected = scope === selectedScope;
                  const label = SCOPE_LABELS[scope];
                  return (
                    <button
                      key={scope}
                      onClick={() => setSelectedScope(scope)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? `border-[#C8102E] bg-[#C8102E]/5 ring-2 ${label.ring}`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${label.color}`}>
                          {label.en}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C8102E]" />}
                      </div>
                      <p className="text-lg font-extrabold text-gray-900">
                        Rs. {p.min_price.toLocaleString()} - {p.max_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.scope_description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Important Disclaimer / महत्त्वपूर्ण सूचना</p>
                <p className="text-xs text-amber-700 mt-1">
                  This is an <strong>estimated price range</strong> based on typical jobs in Jhapa District. 
                  Final pricing is confirmed by Gharun Connect after provider assessment. 
                  Actual costs may vary based on materials, complexity, and specific requirements.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  यो झापा जिल्लाको सामान्य कामको आधारमा <strong>अनुमानित मूल्य</strong> हो। 
                  अन्तिम मूल्य प्रदायक मूल्याङ्कन पछि घरन कनेक्टद्वारा पुष्टि हुन्छ।
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {onRequestService && (
                <button
                  onClick={onRequestService}
                  className="flex-1 py-3.5 bg-[#C8102E] text-white rounded-xl font-bold text-sm hover:bg-[#A00D24] transition-all shadow-lg shadow-[#C8102E]/20 flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Submit Service Request / सेवा अनुरोध पेश गर्नुहोस्
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                New Estimate / नयाँ अनुमान
              </button>
            </div>
          </div>
        ) : (
          /* ============ FORM VIEW ============ */
          <div className="p-6 space-y-6">
            {/* Step 1: Select Category */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#C8102E] rounded-lg flex items-center justify-center text-white text-xs font-bold">1</div>
                <h3 className="text-sm font-bold text-gray-900">Select Service Category / सेवा श्रेणी छान्नुहोस्</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {(availableCategories.length > 0 ? availableCategories : categories).map(cat => {
                  const Icon = CATEGORY_ICONS[cat.id] || Wrench;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedScope(''); setShowResult(false); }}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#C8102E] bg-[#C8102E]/5 ring-1 ring-[#C8102E]/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-[#C8102E]' : 'text-gray-700'}`}>{cat.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{cat.nameNp}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Job Scope */}
            {selectedCategory && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-[#C8102E] rounded-lg flex items-center justify-center text-white text-xs font-bold">2</div>
                  <h3 className="text-sm font-bold text-gray-900">Select Job Scope / कामको आकार छान्नुहोस्</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map(scope => {
                    const p = categoryPricing.find(cp => cp.job_scope === scope);
                    const label = SCOPE_LABELS[scope];
                    const isSelected = selectedScope === scope;
                    return (
                      <button
                        key={scope}
                        onClick={() => { setSelectedScope(scope); setShowResult(false); }}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? `border-[#C8102E] bg-[#C8102E]/5 ring-2 ${label.ring}`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${label.color}`}>
                            {label.en} / {label.np}
                          </span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-[#C8102E]" />}
                        </div>
                        {p ? (
                          <>
                            <p className="text-lg font-extrabold text-gray-900 mt-2">
                              Rs. {p.min_price.toLocaleString()} - {p.max_price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{p.scope_description}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{p.scope_description_np}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 mt-2">Pricing not available</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Location (Optional) */}
            {selectedCategory && selectedScope && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gray-300 rounded-lg flex items-center justify-center text-white text-xs font-bold">3</div>
                  <h3 className="text-sm font-bold text-gray-900">Your Location (Optional) / तपाईंको स्थान</h3>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none bg-white appearance-none"
                  >
                    <option value="">Select area in Jhapa (optional)...</option>
                    {JHAPA_AREAS.map(area => (
                      <option key={area.name} value={area.name}>{area.name} ({area.nameNp})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Get Estimate Button */}
            {selectedCategory && selectedScope && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={handleEstimate}
                  className="w-full py-4 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white rounded-xl font-bold text-base hover:from-[#A00D24] hover:to-[#8B0A1E] transition-all shadow-lg shadow-[#C8102E]/25 flex items-center justify-center gap-3"
                >
                  <Calculator className="w-5 h-5" />
                  Get Estimate / अनुमान प्राप्त गर्नुहोस्
                </button>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-800">
                  <strong>How it works:</strong> Select your service and job size to see an estimated price range. 
                  These estimates are based on typical rates in Jhapa District and are managed by Gharun Nepal admin.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  <strong>कसरी काम गर्छ:</strong> अनुमानित मूल्य हेर्न सेवा र कामको आकार छान्नुहोस्। 
                  यी अनुमानहरू झापा जिल्लाको सामान्य दरमा आधारित छन्।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-4xl mb-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default CostEstimator;
