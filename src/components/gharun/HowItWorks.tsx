import React from 'react';
import { LogIn, Search, Send, Phone, UserCheck, CheckCircle, MessageCircle } from 'lucide-react';
import { t } from '@/lib/i18n';

const GHARUN_WHATSAPP = '9779713242471';


const HowItWorks: React.FC = () => {
  const steps = [
    { icon: LogIn, en: t.howItWorks.step1.en, np: t.howItWorks.step1.np, descEn: t.howItWorks.step1Desc.en, descNp: t.howItWorks.step1Desc.np, lightColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: Search, en: t.howItWorks.step2.en, np: t.howItWorks.step2.np, descEn: t.howItWorks.step2Desc.en, descNp: t.howItWorks.step2Desc.np, lightColor: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { icon: Send, en: t.howItWorks.step3.en, np: t.howItWorks.step3.np, descEn: t.howItWorks.step3Desc.en, descNp: t.howItWorks.step3Desc.np, lightColor: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: Phone, en: t.howItWorks.step4.en, np: t.howItWorks.step4.np, descEn: t.howItWorks.step4Desc.en, descNp: t.howItWorks.step4Desc.np, lightColor: 'bg-red-50', iconColor: 'text-[#C8102E]' },
    { icon: UserCheck, en: t.howItWorks.step5.en, np: t.howItWorks.step5.np, descEn: t.howItWorks.step5Desc.en, descNp: t.howItWorks.step5Desc.np, lightColor: 'bg-orange-50', iconColor: 'text-orange-600' },
    { icon: CheckCircle, en: t.howItWorks.step6.en, np: t.howItWorks.step6.np, descEn: t.howItWorks.step6Desc.en, descNp: t.howItWorks.step6Desc.np, lightColor: 'bg-green-50', iconColor: 'text-green-600' },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-[#C8102E]">{t.howItWorks.badge.en}</span>
            <span className="text-xs text-[#C8102E]/70">{t.howItWorks.badge.np}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            How <span className="text-[#C8102E]">Gharun Nepal</span> Works
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.howItWorks.title.np}</p>
          <p className="mt-4 text-lg text-gray-600">{t.howItWorks.subtitle.en}</p>
          <p className="text-sm text-gray-400 mt-1">{t.howItWorks.subtitle.np}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#C8102E]/20 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 ${step.lightColor} rounded-2xl flex items-center justify-center relative`}>
                    <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{step.en}</h3>
                    <p className="text-xs text-gray-500">{step.np}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-[72px] -mt-2">{step.descEn}</p>
                <p className="text-xs text-gray-400 leading-relaxed pl-[72px] mt-1">{step.descNp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Need help? Call Gharun Connect */}
        <div className="mt-14">
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 relative">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                  </span>
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl font-extrabold text-gray-900">{t.help.needHelp.en}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{t.help.needHelp.np}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.help.weSpeak.en} — {t.help.weSpeak.np}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <a
                  href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal. Can you assist me?')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" /> +977-9713242471

                </a>
                <a
                  href={`tel:+${GHARUN_WHATSAPP}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-800 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Phone className="w-4 h-4" /> {t.help.callNow.en} / {t.help.callNow.np}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
