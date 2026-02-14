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

  /* ===============================
     LOAD PROVIDERS FROM DB (SAFE)
  ============================== */
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await fetchProviders();
        if (Array.isArray(data)) {
          setDbProviders(data);
        }
      } catch (err) {
        console.error('Provider fetch failed:', err);
      } finally {
        setLoadingDb(false);
      }
    };

    loadProviders();
  }, []);

  /* ===============================
     MERGE DB + HARDCODED (SAFE)
  ============================== */
  const allProviders: (Provider & { documents_verified?: boolean })[] = useMemo(() => {

    if (dbProviders.length > 0) {
      return dbProviders.map((p: any) => ({
        id: p.id,
        name: p.name,
        service: p.service,
        category: p.category,
        location: p.location,
        image: p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`,
        verified: p.verified,
        documents_verified: p.documents_verified || false,
        rating: Number(p.rating) || 0,
        jobsCompleted: p.jobs_completed || 0,
        status: p.status || 'active',
      }));
    }

    // fallback if DB empty
    return hardcodedProviders;
  }, [dbProviders]);

  /* ===============================
     FILTER LOGIC
  ============================== */
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
        p.location.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'jobs') return b.jobsCompleted - a.jobsCompleted;
      return a.name.localeCompare(b.name);
    });

    return result;

  }, [allProviders, selectedCategory, search, sortBy]);

  /* ===============================
     UI (UNCHANGED)
  ============================== */
  return (
    <section id="providers" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-3xl font-extrabold text-center mb-8">
          Trusted Service Providers
        </h2>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search providers..."
            className="w-full p-3 border rounded-xl"
          />
        </div>

        {loadingDb && <p className="text-sm text-gray-400 mb-4">Loading providers...</p>}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredProviders.map(provider => {

            const isDocsVerified = (provider as any).documents_verified;
            const isFullyVerified = provider.verified && isDocsVerified;

            return (
              <div key={provider.id} className="bg-white rounded-xl border overflow-hidden">

                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">

                  <h3 className="font-bold">{provider.name}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4"/>
                    {provider.location}
                  </div>

                  <div className="flex justify-between mt-3">
                    <span className="text-sm font-semibold text-red-600">
                      {provider.service}
                    </span>

                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500"/>
                      {provider.rating}
                    </div>
                  </div>

                  <button
                    onClick={()=>onRequestService(provider)}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
                  >
                    Request Service
                  </button>

                </div>
              </div>
            )
          })}

        </div>

      </div>
    </section>
  );
};

export default ProviderDirectory;