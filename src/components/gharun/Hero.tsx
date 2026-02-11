import React, { useState, useEffect } from 'react';

import { Shield, ArrowRight, Users, CheckCircle, MapPin } from 'lucide-react';
import { fetchStats } from '@/lib/database';
import { t } from '@/lib/i18n';
import { useAuth, isInternalRole } from '@/contexts/AuthContext';

const LAUNCH_DATE = new Date(2026, 1, 19, 0, 0, 0); // Feb 19, 2026 00:00:00 local time
const LAUNCH_POSTER_URL = 'https://d64gsuwffb70l.cloudfront.net/6988b0250a2d62ea2949420e_1770713582334_6e7e1a56.png';
const ORIGINAL_HERO_URL = 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565784442_9e8ddf77.jpg';

interface HeroProps {
  onGetStarted: () => void;
  onViewProviders: () => void;
}


const Hero: React.FC<HeroProps> = ({ onGetStarted, onViewProviders }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    verifiedProviders: 47,
    completedJobs: 312,
    happyClients: 289,
    activeRiders: 14,
  });

  // Date-based hero image: show launch poster before Feb 19, 2026
  // Admin users always see the original hero image
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // If before launch date, set a timer to auto-switch at midnight on launch day
    const msUntilLaunch = LAUNCH_DATE.getTime() - now.getTime();
    if (msUntilLaunch > 0 && msUntilLaunch < 86400000 * 10) {
      // Only set timer if within 10 days to avoid huge timeout
      const timer = setTimeout(() => setNow(new Date()), msUntilLaunch + 1000);
      return () => clearTimeout(timer);
    }
  }, [now]);

  const isAdminUser = user && isInternalRole(user.role);
  const showLaunchPoster = !isAdminUser && now < LAUNCH_DATE;
  const heroImageSrc = showLaunchPoster ? LAUNCH_POSTER_URL : ORIGINAL_HERO_URL;
  const heroImageFit = showLaunchPoster ? 'object-contain' : 'object-cover';
  const heroImageBg = showLaunchPoster ? 'bg-gradient-to-br from-[#1a0a3e] via-[#2d1b69] to-[#1a3a8a]' : '';

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        if (data) {
          setStats({
            verifiedProviders: data.verifiedProviders || 47,
            completedJobs: data.completedJobs || 312,
            happyClients: data.happyClients || 289,
            activeRiders: data.activeRiders || 14,
          });
        }
      } catch (err) {
        // Keep defaults
      }
    };
    loadStats();
  }, []);


  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#FFF8F6] via-white to-[#F5F5F0]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8102E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Red accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8102E] via-[#E8334A] to-[#C8102E]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 rounded-full">
              <Shield className="w-4 h-4 text-[#C8102E]" />
              <span className="text-sm font-semibold text-[#C8102E]">{t.tagline.en}</span>
              <span className="text-xs text-[#C8102E]/70">{t.tagline.np}</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                <span className="block">{t.hero.headline.np}</span>
                <span className="block mt-2 bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] bg-clip-text text-transparent">
                  {t.hero.subheadline.np}
                </span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                {t.hero.description.en}
              </p>
              <p className="mt-1 text-sm text-gray-400 leading-relaxed max-w-xl">
                {t.hero.description.np}
              </p>
            </div>

            {/* Trust points */}
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                { icon: Shield, en: t.hero.verifiedProviders.en, np: t.hero.verifiedProviders.np },
                { icon: Users, en: t.hero.noDirectContact.en, np: t.hero.noDirectContact.np },
                { icon: MapPin, en: t.hero.jhapaNepal.en, np: t.hero.jhapaNepal.np },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C8102E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-[#C8102E]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">{item.en}</span>
                    <span className="block text-[10px] text-gray-400">{item.np}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C8102E] text-white rounded-xl font-bold text-base hover:bg-[#A00D24] transition-all shadow-lg shadow-[#C8102E]/25 hover:shadow-xl hover:shadow-[#C8102E]/30 hover:-translate-y-0.5"
              >
                <span>{t.hero.submitRequest.en}</span>
                <span className="text-sm opacity-70">{t.hero.submitRequest.np}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onViewProviders}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-base border-2 border-gray-200 hover:border-[#C8102E] hover:text-[#C8102E] transition-all hover:-translate-y-0.5"
              >
                <span>{t.hero.browseServices.en}</span>
                <span className="text-sm opacity-50">{t.hero.browseServices.np}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {[
                { value: `${stats.verifiedProviders}+`, en: t.hero.verifiedProviders.en, np: t.hero.verifiedProviders.np },
                { value: `${stats.completedJobs}+`, en: t.hero.jobsCompleted.en, np: t.hero.jobsCompleted.np },
                { value: `${stats.happyClients}+`, en: t.hero.happyClients.en, np: t.hero.happyClients.np },
                { value: `${stats.activeRiders}+`, en: t.hero.activeRiders.en, np: t.hero.activeRiders.np },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <p className="text-2xl font-extrabold text-[#C8102E]">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.en}</p>
                  <p className="text-[10px] text-gray-400">{stat.np}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Hero image (date-based) */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className={`rounded-3xl overflow-hidden shadow-2xl border-4 border-white ${heroImageBg}`}>
                <img
                  src={heroImageSrc}
                  alt="Gharun Nepal - Connecting communities in Jhapa"
                  className={`w-full h-[500px] ${heroImageFit} transition-opacity duration-500`}
                />
                {!showLaunchPoster && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl" />
                )}
              </div>

              {/* Floating card - Trust */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.hero.verified100.en}</p>
                    <p className="text-[10px] text-gray-600">{t.hero.verified100.np}</p>
                    <p className="text-xs text-gray-500">{t.hero.approvedOnly.en}</p>
                  </div>
                </div>
              </div>

              {/* Floating card - Active */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#C8102E]/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#C8102E]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{stats.verifiedProviders} {t.footer.providers.en}</p>
                    <p className="text-[10px] text-gray-600">{t.footer.providers.np}</p>
                    <p className="text-xs text-gray-500">{t.hero.readyToServe.en}</p>
                    <p className="text-[10px] text-gray-400">{t.hero.readyToServe.np}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="#F5F5F0" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
