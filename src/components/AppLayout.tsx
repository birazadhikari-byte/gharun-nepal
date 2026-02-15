import React, { useState, useCallback, useEffect } from 'react';
import { useAuth, isInternalRole } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';

import Navbar from '@/components/gharun/Navbar';
import Hero from '@/components/gharun/Hero';
import ServiceCategories from '@/components/gharun/ServiceCategories';
import TrustFlow from '@/components/gharun/TrustFlow';
import ProviderDirectory from '@/components/gharun/ProviderDirectory';
import HowItWorks from '@/components/gharun/HowItWorks';
import Testimonials from '@/components/gharun/Testimonials';
import CTASection from '@/components/gharun/CTASection';
import StatusTracker from '@/components/gharun/StatusTracker';
import AdminDashboard from '@/components/gharun/AdminDashboard';
import ClientDashboard from '@/components/gharun/ClientDashboard';
import ProviderDashboard from '@/components/gharun/ProviderDashboard';
import Footer from '@/components/gharun/Footer';
import AuthModal from '@/components/gharun/AuthModal';
import RequestForm from '@/components/gharun/RequestForm';
import ProviderRegistration from '@/components/gharun/ProviderRegistration';
import LegalTerms from '@/components/gharun/LegalTerms';
import HelpBanner from '@/components/gharun/HelpBanner';
import SecureAdminLogin from '@/components/gharun/SecureAdminLogin';
import AdminSetup from '@/components/gharun/AdminSetup';
import NotificationToast, { type Notification } from '@/components/gharun/NotificationToast';
import RideConnector from '@/components/gharun/RideConnector';
import RoleSelection, { clearSavedRole } from '@/components/gharun/RoleSelection';
import CostEstimator from '@/components/gharun/CostEstimator';
import GharunAI from '@/components/gharun/GharunAI';
import TermsGate from '@/components/gharun/TermsGate';
import { type Provider } from '@/data/gharunData';



const GHARUN_WHATSAPP = '9779713242471';

const ADMIN_SETUP_KEY = 'masterkey2026';
const INTERNAL_ACCESS_KEY = 'gharun2026';
const OPS_SESSION_KEY = '__gharun_ops';


type ViewType = 'home' | 'providers' | 'how-it-works' | 'track' | 'internal' | 'internal-login' |
  'provider-portal' | 'request' | 'register' | 'terms' | 'privacy' | 'faq' | 'rides' |
  'client-dashboard' | 'provider-dashboard' | 'provider-terms' | 'role-selection';



const AppLayout: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showProviderReg, setShowProviderReg] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [opsDetected, setOpsDetected] = useState(false);

  // STEP 1: Detect ops parameter IMMEDIATELY on mount (before auth loads)
  // Persist to sessionStorage so it survives React re-renders and auth state changes
  useEffect(() => {
    const url = new URL(window.location.href);

    // Check for admin setup key
    const setupKey = url.searchParams.get('setup');
    if (setupKey === ADMIN_SETUP_KEY) {
      setShowAdminSetup(true);
      return;
    }

    // Check for ops key in URL
    const opsKey = url.searchParams.get('ops');
    if (opsKey === INTERNAL_ACCESS_KEY) {
      // Save to sessionStorage BEFORE cleaning URL
      try { sessionStorage.setItem(OPS_SESSION_KEY, '1'); } catch {}
      setOpsDetected(true);
      // Clean URL immediately
      url.searchParams.delete('ops');
      window.history.replaceState({}, '', url.pathname);
      return;
    }

    // Check sessionStorage (in case of page reload during login flow)
    try {
      if (sessionStorage.getItem(OPS_SESSION_KEY) === '1') {
        setOpsDetected(true);
      }
    } catch {}
  }, []);

  // STEP 2: Route based on auth state + ops detection
  useEffect(() => {
    if (authLoading) return;
    if (showAdminSetup) return;

    // OPS ACCESS: Show admin login or dashboard
    if (opsDetected) {
      if (user && isInternalRole(user.role)) {
        // Already logged in as admin → go to dashboard
        setCurrentView('internal');
        setHasRedirected(true);
        // Clear session flag - no longer needed
        try { sessionStorage.removeItem(OPS_SESSION_KEY); } catch {}
      } else if (!user) {
        // Not logged in → show admin login
        setCurrentView('internal-login');
        setHasRedirected(true);
      } else {
        // Logged in but NOT admin → show admin login (they need admin credentials)
        setCurrentView('internal-login');
        setHasRedirected(true);
      }
      return;
    }

    // NORMAL FLOW: Auto-redirect logged-in users to their dashboard
    if (user && !hasRedirected) {
      if (isInternalRole(user.role)) {
        setCurrentView('internal');
      } else if (user.role === 'client') {
        setCurrentView('client-dashboard');
      } else if (user.role === 'provider') {
        setCurrentView('provider-dashboard');
      } else {
        setCurrentView('home');
      }
      setHasRedirected(true);
    }

    // If user logs out, go home
    if (!user && hasRedirected && !opsDetected) {
      setCurrentView('home');
      setHasRedirected(false);
    }
  }, [user, authLoading, hasRedirected, showAdminSetup, opsDetected]);


  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, type, title, message }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleNavigate = useCallback((view: string) => {
    // SECURITY: Block internal access from public navigation - silently redirect
    if (view === 'admin' || view === 'admin-login' || view === 'internal' || view === 'internal-login') {
      if (user && isInternalRole(user.role)) {
        setCurrentView('internal');
      } else {
        // Silent redirect - no explanation
        setCurrentView('home');
      }
      return;
    }

    // Redirect to dashboard views
    if (view === 'dashboard' || view === 'my-dashboard') {
      if (user && isInternalRole(user.role)) { setCurrentView('internal'); return; }
      if (user?.role === 'client') { setCurrentView('client-dashboard'); return; }
      if (user?.role === 'provider') { setCurrentView('provider-dashboard'); return; }
      setShowAuthModal(true);
      return;
    }

    if (view === 'provider-portal') {
      if (!user) { setShowAuthModal(true); return; }
      if (user.role === 'provider') { setCurrentView('provider-dashboard'); return; }
      if (isInternalRole(user.role)) { setCurrentView('internal'); return; }
      addNotification('error', 'Access Denied / पहुँच अस्वीकृत', 'Only providers can access the portal / प्रदायकहरूले मात्र पोर्टल पहुँच गर्न सक्छन्');
      return;
    }

    if (view === 'request') {
      if (!user) { setShowAuthModal(true); return; }
      if (user.role === 'client') { setCurrentView('client-dashboard'); return; }
      setShowRequestForm(true);
      return;
    }

    if (view === 'register') {
      setShowProviderReg(true);
      return;
    }

    setCurrentView(view as ViewType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user, addNotification]);

  const handleLogin = useCallback((loggedInUser: { name: string; role: string }) => {
    addNotification('success', `Welcome, ${loggedInUser.name}! / स्वागत छ, ${loggedInUser.name}!`, `Signed in successfully / सफलतापूर्वक साइन इन भयो`);
    setHasRedirected(false); // Reset so useEffect triggers redirect
  }, [addNotification]);

  const handleLogout = useCallback(async () => {
    await signOut();
    clearSavedRole(); // Clear saved role on logout
    setOpsDetected(false);
    try { sessionStorage.removeItem(OPS_SESSION_KEY); } catch {}
    setCurrentView('home');
    setHasRedirected(false);
    addNotification('info', 'Signed Out / साइन आउट', 'You have been signed out successfully / तपाईं सफलतापूर्वक साइन आउट हुनुभयो');
  }, [signOut, addNotification]);

  // Role selection handler
  const handleRoleSelect = useCallback((role: 'client' | 'provider') => {
    if (role === 'client') {
      if (user) {
        setCurrentView('client-dashboard');
      } else {
        setShowAuthModal(true);
        addNotification('info', 'Sign In Required / साइन इन आवश्यक', 'Please sign in to request a service / सेवा अनुरोध गर्न कृपया साइन इन गर्नुहोस्');
      }
    } else {
      setShowProviderReg(true);
    }
    setCurrentView('home');
  }, [user, addNotification]);


  const handleRequestService = useCallback((provider?: Provider) => {
    if (!user) {
      setShowAuthModal(true);
      addNotification('info', 'Sign In Required / साइन इन आवश्यक', 'Please sign in to submit a service request / सेवा अनुरोध पेश गर्न कृपया साइन इन गर्नुहोस्');
      return;
    }
    if (user.role === 'client') {
      setCurrentView('client-dashboard');
      return;
    }
    setSelectedProvider(provider || null);
    setShowRequestForm(true);
  }, [user, addNotification]);

  const handleRequestSubmit = useCallback(() => {
    addNotification('success', 'Request Submitted! / अनुरोध पेश भयो!', 'Gharun Connect will find a verified provider for you / घरन कनेक्टले तपाईंको लागि प्रमाणित प्रदायक खोज्नेछ');
  }, [addNotification]);

  const handleInternalLoginSuccess = useCallback(() => {
    setCurrentView('internal');
    setHasRedirected(true);
    setOpsDetected(false);
    try { sessionStorage.removeItem(OPS_SESSION_KEY); } catch {}
  }, []);

  const handleInternalLoginCancel = useCallback(() => {
    setOpsDetected(false);
    try { sessionStorage.removeItem(OPS_SESSION_KEY); } catch {}
    setCurrentView('home');
  }, []);
  const handleGoHome = useCallback(() => {
    setCurrentView('home');
  }, []);

  const handleAdminSetupComplete = useCallback(() => {
    setShowAdminSetup(false);
    setCurrentView('internal');
    setHasRedirected(true);
  }, []);

  const handleAdminSetupCancel = useCallback(() => {
    setShowAdminSetup(false);
    setCurrentView('home');
  }, []);

  // ============ TERMS GATE NAVIGATION HELPERS ============
  // Must be defined before any conditional returns (React hooks rule)
  const handleTermsGateNavigateTerms = useCallback(() => {
    window.open('/terms', '_blank');
  }, []);

  const handleTermsGateNavigatePrivacy = useCallback(() => {
    window.open('/privacy', '_blank');
  }, []);


  // Map auth context user to navbar format - NEVER expose internal roles
  const navUser = user ? { 
    name: user.name, 
    role: isInternalRole(user.role) ? user.role : user.role // Navbar handles masking internally
  } : null;

  // Check if current view is a full-screen dashboard (no navbar/footer)
  const isFullDashboard = ['client-dashboard', 'provider-dashboard', 'internal'].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      // ============ ROLE-BASED DASHBOARDS ============
      case 'client-dashboard':
        if (!user || user.role !== 'client') {
          return renderGuestHome();
        }
        return <ClientDashboard />;

      case 'provider-dashboard':
        if (!user || user.role !== 'provider') {
          return renderGuestHome();
        }
        return <ProviderDashboard />

      // INTERNAL LOGIN (hidden from public)
      case 'internal-login':
        if (user && isInternalRole(user.role)) {
          return <AdminDashboard />;
        }
        return (
          <SecureAdminLogin
            onSuccess={handleInternalLoginSuccess}
            onCancel={handleInternalLoginCancel}
          />
        );

      // INTERNAL DASHBOARD (hidden from public)
      case 'internal':
        if (!user || !isInternalRole(user.role)) {
          // Silent redirect - no error, no explanation
          return renderGuestHome();
        }
        return <AdminDashboard />;

      // ============ PUBLIC PAGES ============
      case 'track':
        return (
          <>
            <StatusTracker />
            <HelpBanner variant="compact" />
            <Footer onNavigate={handleNavigate} />
          </>
        );
      case 'providers':
        return (
          <>
            <ProviderDirectory onRequestService={handleRequestService} />
            <HelpBanner variant="compact" />
            <CTASection onGetStarted={() => handleRequestService()} onRegisterProvider={() => setShowProviderReg(true)} />
            <Footer onNavigate={handleNavigate} />
          </>
        );
      case 'how-it-works':
        return (
          <>
            <HowItWorks />
            <TrustFlow />
            <Testimonials />
            <HelpBanner variant="full" />
            <CTASection onGetStarted={() => handleRequestService()} onRegisterProvider={() => setShowProviderReg(true)} />
            <Footer onNavigate={handleNavigate} />
          </>
        );
      case 'terms':
        return (<><LegalTerms initialTab="terms" onBack={() => handleNavigate('home')} /><HelpBanner variant="compact" /><Footer onNavigate={handleNavigate} /></>);
      case 'privacy':
        return (<><LegalTerms initialTab="privacy" onBack={() => handleNavigate('home')} /><HelpBanner variant="compact" /><Footer onNavigate={handleNavigate} /></>);
      case 'provider-terms':
        return (<><LegalTerms initialTab="provider-terms" onBack={() => handleNavigate('home')} /><HelpBanner variant="compact" /><Footer onNavigate={handleNavigate} /></>);
      case 'rides':
        return (<><RideConnector onNavigate={handleNavigate} onLogin={() => setShowAuthModal(true)} /><Footer onNavigate={handleNavigate} /></>);
      case 'faq':
        return (<><LegalTerms initialTab="faq" onBack={() => handleNavigate('home')} /><HelpBanner variant="compact" /><Footer onNavigate={handleNavigate} /></>);

      // ============ ROLE SELECTION ============
      case 'role-selection':
        return (
          <RoleSelection
            onSelectRole={handleRoleSelect}
            onNavigateTerms={() => handleNavigate('terms')}
            onNavigatePrivacy={() => handleNavigate('privacy')}
          />
        );

      case 'home':
      default:
        return renderGuestHome();
    }
  };


  const renderGuestHome = () => (
    <>
      <Hero onGetStarted={() => handleRequestService()} onViewProviders={() => handleNavigate('providers')} />
      <ServiceCategories onRequestService={() => handleRequestService()} />
      <TrustFlow />
      <ProviderDirectory onRequestService={handleRequestService} />
      <HowItWorks />
      <HelpBanner variant="full" />
      <Testimonials />
      <CTASection onGetStarted={() => handleRequestService()} onRegisterProvider={() => setShowProviderReg(true)} />
      <Footer onNavigate={handleNavigate} />
    </>
  );


  // ============ ADMIN SETUP PAGE (one-time, secret URL) ============
  if (showAdminSetup) {
    return (
      <AdminSetup
        onComplete={handleAdminSetupComplete}
        onCancel={handleAdminSetupCancel}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t.loading.en}</p>
          <p className="text-gray-400 text-xs mt-0.5">{t.loading.np}</p>
        </div>
      </div>
    );
  }


  // Role selection is a full-screen standalone view
  if (currentView === 'role-selection') {
    return (
      <div className="min-h-screen">
        <RoleSelection
          onSelectRole={handleRoleSelect}
          onNavigateTerms={() => handleNavigate('terms')}
          onNavigatePrivacy={() => handleNavigate('privacy')}
        />
        <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
        <ProviderRegistration isOpen={showProviderReg} onClose={() => setShowProviderReg(false)} />
      </div>
    );
  }

  // Internal login view is completely isolated - no public UI elements
  if (currentView === 'internal-login' && (!user || !isInternalRole(user.role))) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SecureAdminLogin
          onSuccess={handleInternalLoginSuccess}
          onCancel={handleInternalLoginCancel}
        />
        <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
      </div>
    );
  }


  // Full-screen dashboards (no navbar, no footer, no floating buttons)
  // Wrapped with TermsGate for client and provider dashboards
  if (isFullDashboard && user) {
    // Admin/internal dashboards bypass TermsGate
    const isInternalDashboard = currentView === 'internal';

    const dashboardContent = (
      <div className="min-h-screen bg-gray-50">
        {renderView()}
        <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
        {/* Modals */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onNavigateTerms={() => handleNavigate('terms')}
          onNavigatePrivacy={() => handleNavigate('privacy')}
        />
        <RequestForm isOpen={showRequestForm} onClose={() => { setShowRequestForm(false); setSelectedProvider(null); }} selectedProvider={selectedProvider} onSubmit={handleRequestSubmit} />
        <ProviderRegistration isOpen={showProviderReg} onClose={() => setShowProviderReg(false)} />
      </div>
    );

    // Wrap client/provider dashboards with TermsGate
    if (!isInternalDashboard) {
      return (
        <TermsGate
          onNavigateTerms={handleTermsGateNavigateTerms}
          onNavigatePrivacy={handleTermsGateNavigatePrivacy}
          onLogout={handleLogout}
        >
          {dashboardContent}
        </TermsGate>
      );
    }

    return dashboardContent;
  }

  // Public pages with navbar and footer
  return (
    <div className="min-h-screen bg-white">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={navUser}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="pt-[6.5rem]">
        {renderView()}
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        title="Need help? Call Gharun Connect / सहयोग चाहिन्छ? +977-9713242471"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t.help.needHelp.en}
          <br />
          <span className="text-[10px] opacity-70">{t.help.needHelp.np}</span>
          <br />
          <span className="text-green-400 font-bold">+977-9713242471</span>
        </span>
      </a>

      {/* Gharun AI Assistant - Floating Chat Widget */}
      <GharunAI
        onNavigate={handleNavigate}
        onRequestService={() => handleRequestService()}
      />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onNavigateTerms={() => handleNavigate('terms')}
        onNavigatePrivacy={() => handleNavigate('privacy')}
      />
      <RequestForm isOpen={showRequestForm} onClose={() => { setShowRequestForm(false); setSelectedProvider(null); }} selectedProvider={selectedProvider} onSubmit={handleRequestSubmit} />
      <ProviderRegistration isOpen={showProviderReg} onClose={() => setShowProviderReg(false)} />
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
};

export default AppLayout;
