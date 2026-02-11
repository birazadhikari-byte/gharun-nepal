import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Star, CheckCircle2, Filter, ChevronDown, Shield, Award, FileCheck } from 'lucide-react';
import { categories, providers as hardcodedProviders, type Provider } from '@/data/gharunData';
import { fetchProviders } from '@/lib/database';

interface ProviderDirectoryProps {
  onRequestService: (provider?: Provider) => void;
}

const ProviderDirectory: React.FC<ProviderDirectoryProps> = ({ onRequestService }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'name'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await fetchProviders();
        if (data && data.length > 0) {
          setDbProviders(data);
          setDbLoaded(true);
        }
      } catch (err) {
        console.error('Failed to fetch providers from DB:', err);
      } finally {
        setLoadingDb(false);
      }
    };
    loadProviders();
  }, []);

  const allProviders: (Provider & { documents_verified?: boolean })[] = useMemo(() => {
    if (dbLoaded && dbProviders.length > 0) {
      return dbProviders.map((p: any) => ({
        id: p.id,
        name: p.name,
        service: p.service,
        category: p.category,
        location: p.location,
        image: p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C8102E&color=fff&size=200`,
        verified: p.verified,
        documents_verified: p.documents_verified || false,
        rating: Number(p.rating) || 0,
        jobsCompleted: p.jobs_completed || 0,
        status: p.status,
      }));
    }
    return hardcodedProviders;
  }, [dbProviders, dbLoaded]);

  const filteredProviders = useMemo(() => {
    let result = allProviders.filter(p => p.status === 'active' || p.verified);
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'jobs') return b.jobsCompleted - a.jobsCompleted;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [allProviders, selectedCategory, search, sortBy]);

  return (
    <section id="providers" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-[#C8102E]/10 text-[#C8102E] rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Verified Providers
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Trusted Service Providers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            All providers are manually verified by Gharun Nepal admin. Only admin-approved profiles appear here.
          </p>
        </div>

        {/* Admin-Approved Badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">All profiles admin-verified</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Documents verified</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search providers by name, service, or location..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#C8102E] transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-[#C8102E] focus:outline-none transition-colors shadow-sm appearance-none"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="jobs">Sort: Most Jobs</option>
              <option value="name">Sort: Name A-Z</option>
            </select>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === 'all' ? 'bg-[#C8102E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Services
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id ? 'bg-[#C8102E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <strong>{filteredProviders.length}</strong> verified providers
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
          {loadingDb && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProviders.map((provider) => {
            const isDocsVerified = (provider as any).documents_verified;
            const isFullyVerified = provider.verified && isDocsVerified;

            return (
              <div
                key={provider.id}
                className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                  isFullyVerified
                    ? 'border-green-300 hover:border-green-400 ring-1 ring-green-100'
                    : provider.verified
                    ? 'border-gray-200 hover:border-[#C8102E]/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=C8102E&color=fff&size=200`;
                    }}
                  />
                  {/* Verified Badge - Prominent Green */}
                  {isFullyVerified ? (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-green-500/30 ring-2 ring-white">
                      <Award className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : provider.verified ? (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </div>
                  ) : null}

                  {/* Documents Verified Sub-badge */}
                  {isDocsVerified && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md border border-green-200">
                      <FileCheck className="w-3 h-3" />
                      Docs Verified
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-1.5">
                      {provider.name}
                      {isFullyVerified && (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#C8102E]">{provider.service}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{provider.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {provider.location}
                  </div>

                  {/* Verification Status Bar */}
                  {isFullyVerified && (
                    <div className="mb-3 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[10px] font-semibold text-green-700">
                        ID & Documents Verified / कागजात प्रमाणित
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{provider.jobsCompleted} jobs done</span>
                    <button
                      onClick={() => onRequestService(provider)}
                      className="px-4 py-2 bg-[#C8102E] text-white rounded-lg text-xs font-bold hover:bg-[#A00D24] transition-colors shadow-sm"
                    >
                      Request Service
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No providers found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProviderDirectory;
