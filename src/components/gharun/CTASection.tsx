import React from 'react';
import { ArrowRight, Shield, Users, Briefcase, Phone, Headphones } from 'lucide-react';
import { t } from '@/lib/i18n';

const GHARUN_WHATSAPP = '9779713242471';


interface CTASectionProps {
  onGetStarted: () => void;
  onRegisterProvider: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onGetStarted, onRegisterProvider }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* For Clients */}
          <div className="relative bg-gradient-to-br from-[#C8102E] to-[#8B0A1E] rounded-3xl p-8 lg:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">{t.cta.needService.en}</h3>
              <p className="text-white/70 text-sm mb-3">{t.cta.needService.np}</p>
              <p className="text-white/80 mb-2 leading-relaxed text-sm">{t.cta.needServiceDesc.en}</p>
              <p className="text-white/50 mb-6 leading-relaxed text-xs">{t.cta.needServiceDesc.np}</p>
              <ul className="space-y-2 mb-8">
                {[
                  { en: t.cta.verifiedProviders.en, np: t.cta.verifiedProviders.np },
                  { en: t.cta.noDirectContact.en, np: t.cta.noDirectContact.np },
                  { en: t.cta.fairPricing.en, np: t.cta.fairPricing.np },
                  { en: t.cta.realTimeTracking.en, np: t.cta.realTimeTracking.np },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                    <Shield className="w-4 h-4 text-white/70" />
                    <span>{item.en} <span className="text-xs opacity-60">{item.np}</span></span>
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#C8102E] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg">
                {t.cta.submitRequest.en} <span className="text-xs opacity-70">{t.cta.submitRequest.np}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* For Providers */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">{t.cta.areYouProvider.en}</h3>
              <p className="text-gray-500 text-sm mb-3">{t.cta.areYouProvider.np}</p>
              <p className="text-gray-400 mb-2 leading-relaxed text-sm">{t.cta.providerDesc.en}</p>
              <p className="text-gray-500 mb-6 leading-relaxed text-xs">{t.cta.providerDesc.np}</p>
              <ul className="space-y-2 mb-8">
                {[
                  { en: t.cta.steadyJobs.en, np: t.cta.steadyJobs.np },
                  { en: t.cta.buildReputation.en, np: t.cta.buildReputation.np },
                  { en: t.cta.fairPayment.en, np: t.cta.fairPayment.np },
                  { en: t.cta.professionalSupport.en, np: t.cta.professionalSupport.np },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span>{item.en} <span className="text-xs opacity-60">{item.np}</span></span>
                  </li>
                ))}
              </ul>
              <button onClick={onRegisterProvider}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#C8102E] text-white rounded-xl font-bold text-sm hover:bg-[#A00D24] transition-colors shadow-lg">
                {t.cta.registerProvider.en} <span className="text-xs opacity-70">{t.cta.registerProvider.np}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Need help? Call Gharun Connect */}
        <div className="mt-10 bg-gradient-to-r from-green-600 via-green-700 to-green-600 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                <Headphones className="w-7 h-7 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
                </span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">{t.help.needHelp.en}</h3>
                <p className="text-green-200 text-sm mt-0.5">{t.help.needHelp.np}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-green-700 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors shadow-lg">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                +977-9713242471

              </a>
              <a href={`tel:+${GHARUN_WHATSAPP}`}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/15 text-white rounded-xl font-semibold text-sm hover:bg-white/25 transition-colors border border-white/20">
                <Phone className="w-4 h-4" /> {t.help.callNow.en} / {t.help.callNow.np}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
