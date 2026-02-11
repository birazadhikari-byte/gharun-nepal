import React from 'react';
import { User, Shield, Wrench, ArrowRight, Lock, CheckCircle, Phone } from 'lucide-react';
import { t } from '@/lib/i18n';

const TrustFlow: React.FC = () => {
  const steps = [
    {
      icon: User,
      title: t.trust.client.en,
      titleNp: t.trust.client.np,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      description: t.trust.clientDesc.en,
      descriptionNp: t.trust.clientDesc.np,
      features: [
        { en: t.trust.submitRequest.en, np: t.trust.submitRequest.np },
        { en: t.trust.trackStatus.en, np: t.trust.trackStatus.np },
        { en: t.trust.getUpdates.en, np: t.trust.getUpdates.np },
      ],
    },
    {
      icon: Shield,
      title: t.trust.gharunConnect.en,
      titleNp: t.trust.gharunConnect.np,
      color: 'bg-[#C8102E]',
      lightColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-[#C8102E]',
      description: t.trust.connectDesc.en,
      descriptionNp: t.trust.connectDesc.np,
      features: [
        { en: t.trust.verifyDetails.en, np: t.trust.verifyDetails.np },
        { en: t.trust.confirmPrice.en, np: t.trust.confirmPrice.np },
        { en: t.trust.assignProvider.en, np: t.trust.assignProvider.np },
      ],
    },
    {
      icon: Wrench,
      title: t.trust.provider.en,
      titleNp: t.trust.provider.np,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      description: t.trust.providerDesc.en,
      descriptionNp: t.trust.providerDesc.np,
      features: [
        { en: t.trust.receiveJob.en, np: t.trust.receiveJob.np },
        { en: t.trust.executeWork.en, np: t.trust.executeWork.np },
        { en: t.trust.completeTask.en, np: t.trust.completeTask.np },
      ],
    },
  ];

  return (
    <section className="py-20 bg-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 rounded-full mb-4">
            <Lock className="w-4 h-4 text-[#C8102E]" />
            <span className="text-sm font-semibold text-[#C8102E]">{t.trust.architecture.en}</span>
            <span className="text-xs text-[#C8102E]/70">{t.trust.architecture.np}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {t.trust.howTrustWorks.en.replace('Gharun Nepal', '')} <span className="text-[#C8102E]">Gharun Nepal</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.trust.howTrustWorks.np}</p>
          <p className="mt-4 text-lg text-gray-600">{t.trust.noDirectDesc.en}</p>
          <p className="text-sm text-gray-400 mt-1">{t.trust.noDirectDesc.np}</p>
        </div>

        {/* Flow diagram */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connection lines - desktop */}
          <div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] -translate-y-1/2 z-0">
            <div className="flex items-center justify-between px-8">
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-[#C8102E]/50" />
                <ArrowRight className="w-5 h-5 text-[#C8102E]/50 -ml-1" />
              </div>
            </div>
          </div>
          <div className="hidden md:block absolute top-1/2 left-[66%] right-0 -translate-y-1/2 z-0" style={{ right: '16.5%' }}>
            <div className="flex items-center px-8">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#C8102E]/50 to-green-300" />
              <ArrowRight className="w-5 h-5 text-green-400 -ml-1" />
            </div>
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10">
              <div className={`bg-white rounded-2xl p-8 border-2 ${step.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 h-full`}>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className={`w-16 h-16 ${step.lightColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <step.icon className={`w-8 h-8 ${step.textColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className={`text-sm ${step.textColor} font-medium mb-3`}>{step.titleNp}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-1">{step.description}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-5">{step.descriptionNp}</p>
                <div className="space-y-2">
                  {step.features.map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${step.textColor} flex-shrink-0`} />
                      <span className="text-sm text-gray-700">{feature.en} <span className="text-xs text-gray-400">{feature.np}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              {index < 2 && (
                <div className="flex justify-center my-4 md:hidden">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center rotate-90">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Security note */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#C8102E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-[#C8102E]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{t.trust.whyNoContact.en}</h4>
              <p className="text-xs text-gray-500">{t.trust.whyNoContact.np}</p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t.trust.whyNoContactDesc.en}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t.trust.whyNoContactDesc.np}</p>
            </div>
          </div>
        </div>

        {/* Need help? */}
        <div className="mt-6 text-center">
          <a
            href="https://wa.me/9779713242471?text=Namaste!%20I%20need%20help%20from%20Gharun%20Nepal."

            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-green-50 border-2 border-green-200 rounded-2xl hover:bg-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">{t.help.needHelp.en}</p>
              <p className="text-[10px] text-gray-500">{t.help.needHelp.np}</p>
              <p className="text-xs font-semibold text-green-600">WhatsApp: +977-9713242471</p>

            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustFlow;
