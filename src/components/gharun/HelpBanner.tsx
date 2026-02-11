import React from 'react';
import { Phone, MessageCircle, Shield, Headphones, Clock, ArrowRight } from 'lucide-react';
import { t } from '@/lib/i18n';

const GHARUN_WHATSAPP = '9779713242471';
const GHARUN_DISPLAY_NUMBER = '+977-9713242471';


interface HelpBannerProps {
  variant?: 'full' | 'compact' | 'inline' | 'hero-strip';
  className?: string;
}

const HelpBanner: React.FC<HelpBannerProps> = ({ variant = 'full', className = '' }) => {
  const openWhatsApp = (message?: string) => {
    const msg = encodeURIComponent(message || 'Namaste! I need help from Gharun Nepal. Can you assist me?');
    window.open(`https://wa.me/${GHARUN_WHATSAPP}?text=${msg}`, '_blank');
  };

  if (variant === 'full') {
    return (
      <section className={`py-16 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <Headphones className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">24/7 Support Available</span>
                <span className="text-xs text-white/70">सधैं उपलब्ध</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {t.help.needHelp.en.replace('Call Gharun Connect', '')}
                <span className="block mt-1 text-green-200">Call Gharun Connect</span>
              </h2>
              <p className="text-sm text-green-200 mt-2">{t.help.needHelp.np}</p>
              <p className="text-base sm:text-lg text-green-100 mt-4 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                We're here to help you with any service request, question, or concern — in English or Nepali.
              </p>
              <p className="text-sm text-green-200/70 mt-1 max-w-lg mx-auto lg:mx-0">
                हामी तपाईंलाई कुनै पनि सेवा अनुरोध, प्रश्न, वा चिन्तामा सहयोग गर्न यहाँ छौं — अंग्रेजी वा नेपालीमा।
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                {[
                  { icon: Shield, en: 'Verified & Trusted', np: 'प्रमाणित र भरोसायोग्य' },
                  { icon: Clock, en: 'Quick Response', np: 'छिटो प्रतिक्रिया' },
                  { icon: MessageCircle, en: 'English & Nepali', np: 'अंग्रेजी र नेपाली' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/10">
                    <item.icon className="w-3.5 h-3.5 text-green-200" />
                    <span className="text-xs font-medium text-white">{item.en} <span className="opacity-60 text-[10px]">{item.np}</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative">
                <div className="absolute -top-2 -right-2">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center">
                      <Phone className="w-2.5 h-2.5 text-white" />
                    </span>
                  </span>
                </div>

                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
                  <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 text-center mb-0.5">Gharun Connect</h3>
                <p className="text-sm text-gray-500 text-center mb-5">{t.trust.gharunConnect.np}</p>

                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-5">
                  <p className="text-xs text-green-600 font-semibold text-center mb-1">WhatsApp / Call / कल गर्नुहोस्</p>
                  <p className="text-2xl font-extrabold text-green-700 text-center tracking-wide">{GHARUN_DISPLAY_NUMBER}</p>
                </div>

                <button onClick={() => openWhatsApp()}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp / व्हाट्सएपमा कुरा गर्नुहोस्
                </button>

                <a href={`tel:+${GHARUN_WHATSAPP}`}
                  className="w-full mt-3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> {t.help.callNow.en} / {t.help.callNow.np}
                </a>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Available 7 AM - 10 PM Nepal Time / बिहान ७ - राति १०</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-green-600 to-green-700 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm sm:text-base">{t.help.needHelp.en}</p>
                <p className="text-green-200 text-xs">{t.help.needHelp.np}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors shadow-md">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {GHARUN_DISPLAY_NUMBER}
              </a>
              <a href={`tel:+${GHARUN_WHATSAPP}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors border border-white/20">
                <Phone className="w-4 h-4" /> {t.help.callNow.en}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 bg-green-50 border-2 border-green-200 rounded-2xl ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-700">{t.help.needHelp.en}</p>
            <p className="text-[10px] text-gray-500">{t.help.needHelp.np}</p>
          </div>
        </div>
        <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {GHARUN_DISPLAY_NUMBER}
        </a>
      </div>
    );
  }

  if (variant === 'hero-strip') {
    return (
      <div className={`bg-green-600 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-300"></span>
              </span>
              <span className="text-sm font-semibold text-white">{t.help.needHelp.en}</span>
              <span className="text-xs text-green-200 hidden sm:inline">{t.help.needHelp.np}</span>
            </div>
            <span className="hidden sm:inline text-green-300">|</span>
            <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-white hover:text-green-200 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {GHARUN_DISPLAY_NUMBER}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HelpBanner;
