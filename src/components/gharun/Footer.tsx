import React, { useState } from 'react';
import { Shield, Mail, Phone, MapPin, Send, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import { stats } from '@/data/gharunData';
import { t } from '@/lib/i18n';

const GHARUN_WHATSAPP = '9779713242471';


interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-extrabold">{t.footer.stayUpdated.en}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{t.footer.stayUpdated.np}</p>
              <p className="text-gray-400 mt-2 text-sm">{t.footer.getNotified.en}</p>
              <p className="text-gray-500 text-xs">{t.footer.getNotified.np}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email / इमेल हाल्नुहोस्"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:border-[#C8102E] focus:outline-none" />
              <button type="submit"
                className="px-6 py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors flex items-center gap-2">
                {subscribed ? <><CheckCircle2 className="w-4 h-4" /> {t.footer.subscribed.en}</> : <><Send className="w-4 h-4" /> {t.footer.subscribe.en}</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#C8102E] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{t.brand.en}</p>
                <p className="text-xs text-[#C8102E]">{t.brand.np}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-1">{t.footer.brandDesc.en}</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{t.footer.brandDesc.np}</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{stats.verifiedProviders}+</p>
                <p className="text-xs text-gray-500">{t.footer.providers.en}</p>
                <p className="text-[10px] text-gray-600">{t.footer.providers.np}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{stats.completedJobs}+</p>
                <p className="text-xs text-gray-500">{t.footer.jobsDone.en}</p>
                <p className="text-[10px] text-gray-600">{t.footer.jobsDone.np}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{stats.happyClients}+</p>
                <p className="text-xs text-gray-500">{t.footer.clients.en}</p>
                <p className="text-[10px] text-gray-600">{t.footer.clients.np}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-1">{t.footer.quickLinks.en}</h4>
            <p className="text-xs text-gray-500 mb-4">{t.footer.quickLinks.np}</p>
            <ul className="space-y-2.5">
              {[
                { en: t.footer.home.en, np: t.footer.home.np, view: 'home' },
                { en: t.footer.browseServices.en, np: t.footer.browseServices.np, view: 'providers' },
                { en: t.footer.howItWorks.en, np: t.footer.howItWorks.np, view: 'how-it-works' },
                { en: t.footer.trackRequest.en, np: t.footer.trackRequest.np, view: 'track' },
                { en: t.footer.submitRequest.en, np: t.footer.submitRequest.np, view: 'request' },
                { en: t.footer.faq.en, np: t.footer.faq.np, view: 'faq' },
              ].map((link, i) => (
                <li key={i}>
                  <button onClick={() => onNavigate(link.view)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.en} <span className="text-xs opacity-50">{link.np}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-bold text-white mb-1">{t.footer.forProviders.en}</h4>
            <p className="text-xs text-gray-500 mb-4">{t.footer.forProviders.np}</p>
            <ul className="space-y-2.5">
              {[
                { en: t.footer.registerProvider.en, np: t.footer.registerProvider.np, view: 'register' },
                { en: t.footer.providerPortal.en, np: t.footer.providerPortal.np, view: 'provider-portal' },
                { en: t.footer.becomeRider.en, np: t.footer.becomeRider.np, view: 'register' },
                { en: t.footer.verificationProcess.en, np: t.footer.verificationProcess.np, view: 'how-it-works' },
                { en: 'Provider Agreement', np: 'प्रदायक सम्झौता', view: 'provider-terms' },
                { en: t.footer.termsOfService.en, np: t.footer.termsOfService.np, view: 'terms' },
                { en: t.footer.privacyPolicy.en, np: t.footer.privacyPolicy.np, view: 'privacy' },
              ].map((link, i) => (
                <li key={i}>
                  <button onClick={() => onNavigate(link.view)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.en} <span className="text-xs opacity-50">{link.np}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-1">{t.footer.contactUs.en}</h4>
            <p className="text-xs text-gray-500 mb-4">{t.footer.contactUs.np}</p>
            <ul className="space-y-3">
              <li>
                <a href={`https://wa.me/${GHARUN_WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors font-semibold">
                  <MessageCircle className="w-4 h-4" /> +977-9713242471

                </a>
              </li>
              <li>
                <a href="mailto:info@gharunepal.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#C8102E]" /> info@gharunepal.com
                </a>
              </li>
              <li>
                <a href="mailto:support@gharunepal.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#C8102E]" /> support@gharunepal.com
                </a>
              </li>
              <li>
                <a href="mailto:connect@gharunepal.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#C8102E]" /> connect@gharunepal.com
                </a>
              </li>
              <li>
                <a href="mailto:verify@gharunepal.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#C8102E]" /> verify@gharunepal.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#C8102E] mt-0.5" />
                <span>{t.hero.jhapaNepal.en} / {t.hero.jhapaNepal.np}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-800 bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">{t.disclaimer.connector.en} {t.disclaimer.agreement.en}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{t.disclaimer.connector.np} {t.disclaimer.agreement.np}</p>
          </div>
        </div>
      </div>

      {/* WhatsApp floating bar */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <p className="text-sm text-gray-400">{t.footer.needHelp.en}</p>
            <p className="text-xs text-gray-500 sm:hidden">{t.footer.needHelp.np}</p>
            <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help with Gharun Nepal.')}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp: +977-9713242471
            </a>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2026 {t.brand.en} ({t.brand.np}). {t.footer.allRightsReserved.en}
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate('privacy')} className="text-sm text-gray-500 hover:text-white transition-colors">{t.footer.privacyPolicy.en}</button>
              <button onClick={() => onNavigate('terms')} className="text-sm text-gray-500 hover:text-white transition-colors">{t.footer.termsOfService.en}</button>
              <button onClick={() => onNavigate('faq')} className="text-sm text-gray-500 hover:text-white transition-colors">{t.footer.faq.en}</button>
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Heart className="w-3 h-3 text-[#C8102E] fill-[#C8102E]" /> {t.footer.madeInNepal.en}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
