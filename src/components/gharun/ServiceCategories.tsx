import React, { useState } from 'react';
import {
  Wrench, Zap, Sparkles, Paintbrush, Hammer, Settings, Droplets, Bug,
  ShoppingBag, Pill, Truck, Package, Car, Home,
  Scissors, Heart, Ruler,
  BookOpen, Laptop, Camera, Wifi,
  Flower2, UserCheck, PartyPopper, Store,
  ChevronRight, ArrowRight, GraduationCap, TreePine, User
} from 'lucide-react';
import { categories, categoryGroups, getCategoriesByGroup } from '@/data/gharunData';

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Wrench, Zap, Sparkles, Paintbrush, Hammer, Settings, Droplets, Bug,
  ShoppingBag, Pill, Truck, Package, Car, Home,
  Scissors, Heart, Ruler,
  BookOpen, Laptop, Camera, Wifi,
  Flower2, UserCheck, PartyPopper, Store,
  GraduationCap, TreePine, User,
};

const groupIconMap: Record<string, React.FC<{ className?: string }>> = {
  Home, Truck, User, GraduationCap, TreePine,
};

// Group color schemes
const groupColors: Record<string, {
  gradient: string;
  iconBg: string;
  iconText: string;
  cardBorder: string;
  cardHover: string;
  badge: string;
  badgeText: string;
  headerBg: string;
}> = {
  home: {
    gradient: 'from-blue-600 to-indigo-600',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    cardBorder: 'border-blue-100',
    cardHover: 'hover:border-blue-300 hover:shadow-blue-100/50',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-700',
    headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
  },
  delivery: {
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    cardBorder: 'border-orange-100',
    cardHover: 'hover:border-orange-300 hover:shadow-orange-100/50',
    badge: 'bg-orange-100',
    badgeText: 'text-orange-700',
    headerBg: 'bg-gradient-to-r from-orange-50 to-amber-50',
  },
  personal: {
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100',
    iconText: 'text-pink-600',
    cardBorder: 'border-pink-100',
    cardHover: 'hover:border-pink-300 hover:shadow-pink-100/50',
    badge: 'bg-pink-100',
    badgeText: 'text-pink-700',
    headerBg: 'bg-gradient-to-r from-pink-50 to-rose-50',
  },
  education: {
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    cardBorder: 'border-purple-100',
    cardHover: 'hover:border-purple-300 hover:shadow-purple-100/50',
    badge: 'bg-purple-100',
    badgeText: 'text-purple-700',
    headerBg: 'bg-gradient-to-r from-purple-50 to-violet-50',
  },
  outdoor: {
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    cardBorder: 'border-green-100',
    cardHover: 'hover:border-green-300 hover:shadow-green-100/50',
    badge: 'bg-green-100',
    badgeText: 'text-green-700',
    headerBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
  },
};

interface ServiceCategoriesProps {
  onRequestService: () => void;
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ onRequestService }) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  return (
    <section id="services" className="py-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-[#C8102E]">Our Services</span>
            <span className="text-xs text-[#C8102E]/70">हाम्रा सेवाहरू</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            <span className="text-[#C8102E]">26+</span> Service Categories
          </h2>
          <p className="text-sm text-gray-500 mb-2">२६+ सेवा श्रेणीहरू</p>
          <p className="text-lg text-gray-600">
            From home repairs to deliveries, personal care to professional services — we connect you with verified providers across Jhapa District.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            घर मर्मतदेखि डेलिभरी, व्यक्तिगत हेरचाहदेखि पेशागत सेवासम्म — हामी तपाईंलाई झापा जिल्लाभरका प्रमाणित प्रदायकहरूसँग जोड्छौं।
          </p>
        </div>

        {/* Category Group Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          <button
            onClick={() => setActiveGroup(null)}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeGroup === null
                ? 'bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C8102E]/30 hover:text-[#C8102E]'
            }`}
          >
            All Services
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
              {categories.length}
            </span>
          </button>
          {categoryGroups.map((group) => {
            const GroupIcon = groupIconMap[group.icon] || Home;
            const colors = groupColors[group.id];
            const count = getCategoriesByGroup(group.id).length;
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(isActive ? null : group.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <GroupIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{group.name}</span>
                <span className="sm:hidden">{group.name.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Groups */}
        <div className="space-y-10">
          {categoryGroups
            .filter(group => activeGroup === null || activeGroup === group.id)
            .map((group) => {
              const GroupIcon = groupIconMap[group.icon] || Home;
              const colors = groupColors[group.id];
              const groupCategories = getCategoriesByGroup(group.id);

              return (
                <div key={group.id} className="animate-in fade-in duration-300">
                  {/* Group Header */}
                  <div className={`${colors.headerBg} rounded-2xl p-5 mb-5 border ${colors.cardBorder}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
                        <GroupIcon className={`w-6 h-6 ${colors.iconText}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                          {group.name}
                          <span className={`px-2 py-0.5 ${colors.badge} ${colors.badgeText} rounded-full text-xs font-bold`}>
                            {groupCategories.length}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500">{group.nameNp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {groupCategories.map((cat) => {
                      const IconComp = iconMap[cat.icon] || Settings;
                      return (
                        <button
                          key={cat.id}
                          onClick={onRequestService}
                          className={`group bg-white rounded-2xl border-2 ${colors.cardBorder} ${colors.cardHover} p-4 sm:p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                        >
                          <div className={`w-11 h-11 ${colors.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <IconComp className={`w-5 h-5 ${colors.iconText}`} />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-[#C8102E] transition-colors">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mb-1">{cat.nameNp}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                            {cat.description}
                          </p>
                          <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-[#C8102E] opacity-0 group-hover:opacity-100 transition-opacity">
                            Request Service <ChevronRight className="w-3 h-3" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-1">More service categories are being added regularly based on local demand.</p>
            <p className="text-xs text-gray-400 mb-5">स्थानीय मागको आधारमा नियमित रूपमा थप सेवा श्रेणीहरू थपिँदैछन्।</p>
            <button
              onClick={onRequestService}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C8102E] text-white rounded-xl font-bold text-sm hover:bg-[#A00D24] transition-all shadow-lg shadow-[#C8102E]/25 hover:shadow-xl hover:shadow-[#C8102E]/30 hover:-translate-y-0.5"
            >
              Request Any Service <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Don't see your service? Submit a request and we'll find a provider for you!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
