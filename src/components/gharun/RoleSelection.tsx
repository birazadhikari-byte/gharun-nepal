import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield,
  Home,
  Wrench,
  ChevronRight,
  Lock,
  CheckCircle,
  Users,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  FileText,
  AlertTriangle,
  Star,
} from 'lucide-react';

const ROLE_STORAGE_KEY = 'gharun_selected_role';
const ADMIN_BYPASS_KEY = 'gharun_admin_bypass';

interface RoleSelectionProps {
  onSelectRole: (role: 'client' | 'provider') => void;
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({
  onSelectRole,
  onNavigateTerms,
  onNavigatePrivacy,
}) => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'provider' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [shakeConsent, setShakeConsent] = useState(false);
  const consentRef = useRef<HTMLDivElement>(null);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-redirect returning users
  useEffect(() => {
    try {
      const adminBypass = sessionStorage.getItem(ADMIN_BYPASS_KEY);
      if (adminBypass === '1') return;

      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRole === 'client' || savedRole === 'provider') {
        onSelectRole(savedRole);
      }
    } catch {
      // localStorage not available
    }
  }, [onSelectRole]);

  // Clear error when consent is checked
  useEffect(() => {
    if (consentChecked) {
      setConsentError(false);
    }
  }, [consentChecked]);

  const triggerConsentError = useCallback(() => {
    setConsentError(true);
    setShakeConsent(true);
    // Scroll consent into view
    consentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Remove shake after animation
    setTimeout(() => setShakeConsent(false), 600);
  }, []);

  const handleSelect = useCallback(
    (role: 'client' | 'provider') => {
      if (isTransitioning) return;

      // Enforce consent
      if (!consentChecked) {
        triggerConsentError();
        return;
      }

      setSelectedRole(role);
      setIsTransitioning(true);

      try {
        localStorage.setItem(ROLE_STORAGE_KEY, role);
      } catch {
        // Silently fail
      }

      setTimeout(() => {
        onSelectRole(role);
      }, 500);
    },
    [isTransitioning, onSelectRole, consentChecked, triggerConsentError]
  );

  const handleTermsClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onNavigateTerms) onNavigateTerms();
    },
    [onNavigateTerms]
  );

  const handlePrivacyClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onNavigatePrivacy) onNavigatePrivacy();
    },
    [onNavigatePrivacy]
  );

  const handleConsentToggle = useCallback(() => {
    setConsentChecked((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C8102E]/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.015] rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div
          className={`w-full max-w-[680px] transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* ======================== */}
          {/* HEADER & BRANDING       */}
          {/* ======================== */}
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-[72px] h-[72px] bg-gradient-to-br from-[#C8102E] to-[#9B0B22] rounded-[22px] shadow-xl shadow-red-200/40 mb-5 ring-4 ring-white">
              <Shield className="w-9 h-9 text-white" strokeWidth={2.2} />
            </div>

            {/* Title — exact bilingual text */}
            <h1 className="text-[1.65rem] sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              How do you want to use
              <br />
              <span className="text-[#C8102E]">Gharun Nepal</span>?
            </h1>
            <p className="text-sm sm:text-[15px] text-gray-500 mt-2 font-medium">
              घरन नेपाल कसरी प्रयोग गर्न चाहनुहुन्छ?
            </p>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-full shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-xs sm:text-[13px] font-semibold text-emerald-700">
                Verified platform
              </span>
              <span className="w-1 h-1 bg-emerald-400 rounded-full" />
              <span className="text-xs sm:text-[13px] font-medium text-emerald-600">
                Admin-verified providers only
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
              प्रमाणित प्लेटफर्म — एडमिन-प्रमाणित सेवा प्रदायकहरू मात्र
            </p>
          </div>

          {/* ======================== */}
          {/* LEGAL CONSENT CHECKBOX   */}
          {/* ======================== */}
          <div
            ref={consentRef}
            className={`mb-6 transition-all duration-300 ${shakeConsent ? 'animate-shake' : ''}`}
          >
            <div
              className={`
                rounded-2xl border-2 px-5 py-4 transition-all duration-300 cursor-pointer
                ${
                  consentError
                    ? 'border-red-400 bg-red-50/80 shadow-lg shadow-red-100/50'
                    : consentChecked
                    ? 'border-emerald-400 bg-emerald-50/60 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={handleConsentToggle}
              role="checkbox"
              aria-checked={consentChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleConsentToggle();
                }
              }}
            >
              <div className="flex items-start gap-3.5">
                {/* Custom Checkbox */}
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`
                      w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                      ${
                        consentChecked
                          ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200'
                          : consentError
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }
                    `}
                  >
                    {consentChecked && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Label Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm text-gray-800 font-medium leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTermsClick(e);
                      }}
                      className="text-[#C8102E] hover:text-[#a00d24] font-bold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
                    >
                      Terms of Service
                    </button>
                    {' and '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrivacyClick(e);
                      }}
                      className="text-[#C8102E] hover:text-[#a00d24] font-bold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </p>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 leading-relaxed">
                    म{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTermsClick(e);
                      }}
                      className="text-gray-600 hover:text-[#C8102E] font-semibold underline underline-offset-2 transition-colors"
                    >
                      सेवा सर्त
                    </button>
                    {' तथा '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrivacyClick(e);
                      }}
                      className="text-gray-600 hover:text-[#C8102E] font-semibold underline underline-offset-2 transition-colors"
                    >
                      गोपनीयता नीति
                    </button>
                    मा सहमत छु
                  </p>
                </div>

                {/* Status indicator */}
                {consentChecked && (
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {consentError && (
              <div className="mt-3 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-red-700">
                    Please agree to the Terms of Service and Privacy Policy to continue.
                  </p>
                  <p className="text-[12px] text-red-600 mt-0.5">
                    कृपया जारी राख्न सेवा सर्त तथा गोपनीयता नीतिमा सहमत हुनुहोस्।
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ======================== */}
          {/* ROLE CARDS               */}
          {/* ======================== */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {/* ---- CARD 1: CLIENT ---- */}
            <button
              type="button"
              onClick={() => handleSelect('client')}
              disabled={isTransitioning}
              aria-label="Select Client role — I need a service"
              className={`
                group relative w-full text-left rounded-[20px] border-2 
                transition-all duration-300 ease-out overflow-hidden
                focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C8102E]/30
                ${
                  !consentChecked && !isTransitioning
                    ? 'border-gray-200/60 bg-gray-50/80 opacity-60 cursor-not-allowed'
                    : selectedRole === 'client'
                    ? 'border-[#C8102E] bg-gradient-to-br from-red-50 to-white shadow-2xl shadow-red-200/40 scale-[1.02]'
                    : selectedRole === 'provider'
                    ? 'border-gray-200 bg-white/80 opacity-50 scale-[0.97] pointer-events-none'
                    : 'border-gray-200/80 bg-white hover:border-[#C8102E]/60 hover:shadow-xl hover:shadow-red-100/30 hover:-translate-y-1.5 active:scale-[0.98]'
                }
              `}
            >
              {/* Popular Badge */}
              <div className="absolute top-3.5 right-3.5 z-10">
                <span
                  className={`
                    inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold
                    shadow-sm transition-all duration-300
                    ${
                      !consentChecked
                        ? 'bg-gray-200 text-gray-400'
                        : selectedRole === 'client'
                        ? 'bg-[#C8102E] text-white shadow-red-200'
                        : 'bg-[#C8102E]/10 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white group-hover:shadow-red-200'
                    }
                  `}
                >
                  <Star className="w-3 h-3" />
                  Most people choose this
                </span>
              </div>

              <div className="p-6 sm:p-7 pt-14 sm:pt-14">
                {/* Icon Container */}
                <div
                  className={`
                    w-[56px] h-[56px] rounded-2xl flex items-center justify-center mb-5
                    transition-all duration-300
                    ${
                      !consentChecked
                        ? 'bg-gray-200'
                        : selectedRole === 'client'
                        ? 'bg-[#C8102E] shadow-lg shadow-red-300/50'
                        : 'bg-red-100/80 group-hover:bg-[#C8102E] group-hover:shadow-lg group-hover:shadow-red-300/40'
                    }
                  `}
                >
                  <Home
                    className={`w-7 h-7 transition-colors duration-300 ${
                      !consentChecked
                        ? 'text-gray-400'
                        : selectedRole === 'client'
                        ? 'text-white'
                        : 'text-[#C8102E] group-hover:text-white'
                    }`}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h2
                  className={`text-xl sm:text-[22px] font-extrabold leading-tight transition-colors ${
                    !consentChecked ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  I need a service
                </h2>
                <p
                  className={`text-[14px] font-semibold mt-1 transition-colors ${
                    !consentChecked ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  मलाई सेवा चाहिन्छ
                </p>

                {/* Description */}
                <p
                  className={`text-[13px] leading-relaxed mt-3 transition-colors ${
                    !consentChecked ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Plumber, electrician, delivery, repair
                </p>

                {/* Step Indicator */}
                <div
                  className={`
                    flex items-center gap-1.5 mt-5 pt-4 border-t transition-colors duration-300
                    ${
                      !consentChecked
                        ? 'border-gray-100'
                        : selectedRole === 'client'
                        ? 'border-red-200/60'
                        : 'border-gray-100 group-hover:border-red-100'
                    }
                  `}
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-300 ${
                      !consentChecked
                        ? 'text-gray-300'
                        : selectedRole === 'client'
                        ? 'text-[#C8102E]'
                        : 'text-gray-400 group-hover:text-[#C8102E]'
                    }`}
                  />
                  <span
                    className={`text-[11px] sm:text-xs font-medium transition-colors ${
                      !consentChecked
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  >
                    Next: Choose service
                    <ArrowRight className="w-3 h-3 inline mx-1 -mt-0.5" />
                    Submit request
                  </span>
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div
                className={`h-1 transition-all duration-500 ${
                  !consentChecked
                    ? 'bg-transparent'
                    : selectedRole === 'client'
                    ? 'bg-gradient-to-r from-[#C8102E] to-[#E8334A]'
                    : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#C8102E]/20 group-hover:to-[#C8102E]/40'
                }`}
              />

              {/* Selected Checkmark */}
              {selectedRole === 'client' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-16 h-16 bg-[#C8102E]/10 rounded-full flex items-center justify-center animate-ping" />
                </div>
              )}

              {/* Disabled overlay lock indicator */}
              {!consentChecked && (
                <div className="absolute bottom-3 right-3 opacity-40">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </button>

            {/* ---- CARD 2: SERVICE PROVIDER ---- */}
            <button
              type="button"
              onClick={() => handleSelect('provider')}
              disabled={isTransitioning}
              aria-label="Select Service Provider role — I provide services"
              className={`
                group relative w-full text-left rounded-[20px] border-2 
                transition-all duration-300 ease-out overflow-hidden
                focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30
                ${
                  !consentChecked && !isTransitioning
                    ? 'border-gray-200/60 bg-gray-50/80 opacity-60 cursor-not-allowed'
                    : selectedRole === 'provider'
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-white shadow-2xl shadow-green-200/40 scale-[1.02]'
                    : selectedRole === 'client'
                    ? 'border-gray-200 bg-white/80 opacity-50 scale-[0.97] pointer-events-none'
                    : 'border-gray-200/80 bg-white hover:border-green-400/60 hover:shadow-xl hover:shadow-green-100/30 hover:-translate-y-1.5 active:scale-[0.98]'
                }
              `}
            >
              {/* Professional Badge */}
              <div className="absolute top-3.5 right-3.5 z-10">
                <span
                  className={`
                    inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold
                    shadow-sm transition-all duration-300
                    ${
                      !consentChecked
                        ? 'bg-gray-200 text-gray-400'
                        : selectedRole === 'provider'
                        ? 'bg-green-600 text-white shadow-green-200'
                        : 'bg-green-100/80 text-green-700 group-hover:bg-green-600 group-hover:text-white group-hover:shadow-green-200'
                    }
                  `}
                >
                  <BadgeCheck className="w-3 h-3" />
                  For professionals
                </span>
              </div>

              <div className="p-6 sm:p-7 pt-14 sm:pt-14">
                {/* Icon Container */}
                <div
                  className={`
                    w-[56px] h-[56px] rounded-2xl flex items-center justify-center mb-5
                    transition-all duration-300
                    ${
                      !consentChecked
                        ? 'bg-gray-200'
                        : selectedRole === 'provider'
                        ? 'bg-green-600 shadow-lg shadow-green-300/50'
                        : 'bg-green-100/80 group-hover:bg-green-600 group-hover:shadow-lg group-hover:shadow-green-300/40'
                    }
                  `}
                >
                  <Wrench
                    className={`w-7 h-7 transition-colors duration-300 ${
                      !consentChecked
                        ? 'text-gray-400'
                        : selectedRole === 'provider'
                        ? 'text-white'
                        : 'text-green-600 group-hover:text-white'
                    }`}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h2
                  className={`text-xl sm:text-[22px] font-extrabold leading-tight transition-colors ${
                    !consentChecked ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  I provide services
                </h2>
                <p
                  className={`text-[14px] font-semibold mt-1 transition-colors ${
                    !consentChecked ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  म सेवा प्रदान गर्छु
                </p>

                {/* Description */}
                <p
                  className={`text-[13px] leading-relaxed mt-3 transition-colors ${
                    !consentChecked ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Work, earn &amp; get verified jobs
                </p>

                {/* Step Indicator */}
                <div
                  className={`
                    flex items-center gap-1.5 mt-5 pt-4 border-t transition-colors duration-300
                    ${
                      !consentChecked
                        ? 'border-gray-100'
                        : selectedRole === 'provider'
                        ? 'border-green-200/60'
                        : 'border-gray-100 group-hover:border-green-100'
                    }
                  `}
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-300 ${
                      !consentChecked
                        ? 'text-gray-300'
                        : selectedRole === 'provider'
                        ? 'text-green-600'
                        : 'text-gray-400 group-hover:text-green-600'
                    }`}
                  />
                  <span
                    className={`text-[11px] sm:text-xs font-medium transition-colors ${
                      !consentChecked
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  >
                    Next: Submit details
                    <ArrowRight className="w-3 h-3 inline mx-1 -mt-0.5" />
                    Admin verification
                  </span>
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div
                className={`h-1 transition-all duration-500 ${
                  !consentChecked
                    ? 'bg-transparent'
                    : selectedRole === 'provider'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-green-400/20 group-hover:to-green-500/40'
                }`}
              />

              {/* Selected Checkmark */}
              {selectedRole === 'provider' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center animate-ping" />
                </div>
              )}

              {/* Disabled overlay lock indicator */}
              {!consentChecked && (
                <div className="absolute bottom-3 right-3 opacity-40">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </button>
          </div>

          {/* ======================== */}
          {/* TRUST INDICATORS         */}
          {/* ======================== */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5 text-gray-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium">Free to use</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-medium">Secure &amp; private</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[11px] font-medium">Trusted by locals</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Jhapa &amp; beyond</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================== */}
      {/* FOOTER: TERMS & PRIVACY */}
      {/* ======================== */}
      <footer className="relative z-10 text-center px-4 py-6 border-t border-gray-100/80 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs sm:text-[13px] text-gray-500">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={handleTermsClick}
              className="text-[#C8102E] hover:text-[#a00d24] font-semibold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
            >
              Terms of Service
            </button>
            {' & '}
            <button
              type="button"
              onClick={handlePrivacyClick}
              className="text-[#C8102E] hover:text-[#a00d24] font-semibold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
            >
              Privacy Policy
            </button>
          </p>
        </div>
        <p className="text-[11px] text-gray-400 font-medium">
          जारी राखेर, तपाईं हाम्रो{' '}
          <button
            type="button"
            onClick={handleTermsClick}
            className="text-gray-500 hover:text-[#C8102E] underline underline-offset-2 transition-colors"
          >
            सेवा सर्तहरू
          </button>
          {' र '}
          <button
            type="button"
            onClick={handlePrivacyClick}
            className="text-gray-500 hover:text-[#C8102E] underline underline-offset-2 transition-colors"
          >
            गोपनीयता नीति
          </button>
          मा सहमत हुनुहुन्छ
        </p>
      </footer>

      {/* Inline keyframe styles for shake and fadeIn animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ========================
// UTILITY EXPORTS
// ========================

/** Check if user has previously selected a role */
export const getSavedRole = (): 'client' | 'provider' | null => {
  try {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === 'client' || saved === 'provider') return saved;
  } catch {
    // localStorage not available
  }
  return null;
};

/** Clear saved role (e.g., on logout) */
export const clearSavedRole = (): void => {
  try {
    localStorage.removeItem(ROLE_STORAGE_KEY);
  } catch {
    // Silently fail
  }
};

/** Set admin bypass flag (admin users skip role selection) */
export const setAdminBypass = (enabled: boolean): void => {
  try {
    if (enabled) {
      sessionStorage.setItem(ADMIN_BYPASS_KEY, '1');
    } else {
      sessionStorage.removeItem(ADMIN_BYPASS_KEY);
    }
  } catch {
    // Silently fail
  }
};

export default RoleSelection;
