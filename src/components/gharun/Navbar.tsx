import React, { useState } from 'react';
import { Menu, X, Phone, Shield, User, ChevronDown, LogOut, MessageCircle, LayoutDashboard, Wrench } from 'lucide-react';
import { isInternalRole } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';

const GHARUN_WHATSAPP = '9779713242471';


interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: { name: string; role: string } | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', en: t.nav.home.en, np: t.nav.home.np },
    { id: 'providers', en: t.nav.services.en, np: t.nav.services.np },
    { id: 'how-it-works', en: t.nav.howItWorks.en, np: t.nav.howItWorks.np },
    { id: 'track', en: t.nav.trackRequest.en, np: t.nav.trackRequest.np },
  ];

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  // Public-facing role labels only - internal roles show as generic "User"
  const getRoleLabel = (role: string) => {
    if (isInternalRole(role)) return 'User'; // Never expose internal roles
    switch (role) {
      case 'provider': return `${t.auth.iAmProvider.en.replace('I am a ', '')}`;
      case 'client': return `${t.trust.client.en}`;
      default: return 'User';
    }
  };

  const getRoleLabelNp = (role: string) => {
    if (isInternalRole(role)) return 'प्रयोगकर्ता';
    switch (role) {
      case 'provider': return t.trust.provider.np;
      case 'client': return t.trust.client.np;
      default: return 'प्रयोगकर्ता';
    }
  };

  const getRoleColor = (role: string) => {
    if (isInternalRole(role)) return 'bg-gray-100 text-gray-700'; // Neutral for internal
    switch (role) {
      case 'provider': return 'bg-green-100 text-green-700';
      case 'client': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvatarColor = (role: string) => {
    if (isInternalRole(role)) return 'bg-gray-600'; // Neutral
    switch (role) {
      case 'provider': return 'bg-green-600';
      case 'client': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Top help strip */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium">{t.help.needHelp.en}</span>
            <span className="text-green-300 hidden sm:inline">&mdash;</span>
            <span className="text-[10px] sm:text-xs text-green-200 hidden sm:inline">{t.help.needHelp.np}</span>
            <a
              href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-green-200 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +977-9713242471

            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
  <img
    src="/gharun-logo.png"
    alt="घरन नेपाल"
    className="h-10 w-auto object-contain"
  />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight">{t.brand.en}</span>
              <span className="text-[10px] text-[#C8102E] font-medium leading-none -mt-0.5">{t.brand.np}</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-[#C8102E]/10 text-[#C8102E]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.en}</span>
                <span className="block text-[9px] opacity-50 -mt-0.5">{item.np}</span>
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => handleNav('dashboard')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.nav.myDashboard.en}</span>
                <span className="text-[9px] opacity-50">{t.nav.myDashboard.np}</span>
              </button>
            )}

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-200"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-green-600" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden xl:inline">+977-9713242471</span>
              <span className="xl:hidden">WhatsApp</span>
            </a>


            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getAvatarColor(user.role)}`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)} / {getRoleLabelNp(user.role)}
                        </span>
                      </div>
                      <button
                        onClick={() => { handleNav('dashboard'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        <span>{t.nav.myDashboard.en} <span className="text-[10px] text-gray-400">{t.nav.myDashboard.np}</span></span>
                      </button>
                      <button
                        onClick={() => { handleNav('track'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{t.nav.trackRequest.en} <span className="text-[10px] text-gray-400">{t.nav.trackRequest.np}</span></span>
                      </button>
                      <a
                        href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t.help.whatsappSupport.en} <span className="text-[10px] text-green-500">{t.help.whatsappSupport.np}</span></span>
                      </a>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { onLogout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t.nav.signOut.en} <span className="text-[10px] text-red-400">{t.nav.signOut.np}</span></span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-semibold hover:bg-[#A00D24] transition-colors shadow-sm hover:shadow-md"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.signIn.en}</span>
                <span className="hidden sm:inline text-[10px] opacity-70">{t.nav.signIn.np}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-[#C8102E]/10 text-[#C8102E]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.en} <span className="text-xs opacity-50">{item.np}</span>
              </button>
            ))}
            {user && (
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> {t.nav.myDashboard.en} <span className="text-xs opacity-50">{t.nav.myDashboard.np}</span>
              </button>
            )}

            <div className="mt-2 pt-3 border-t border-gray-100">
              <a
                href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-200"
              >
                <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-600">+977-9713242471</p>
                  <p className="text-[10px] text-green-600">{t.help.needHelp.np}</p>

                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
