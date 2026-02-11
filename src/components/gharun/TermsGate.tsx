import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, FileText, Lock, CheckCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { checkTermsAcceptance, recordTermsAcceptance, fetchTermsVersionConfig, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '@/lib/database';


interface TermsGateProps {
  children: React.ReactNode;
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
  onLogout?: () => void;
}

/**
 * TermsGate — Mandatory Terms of Service & Privacy Policy acceptance gate.
 * 
 * Wraps authenticated views. If the user has NOT accepted the current
 * terms/privacy versions, they see a full-screen acceptance screen
 * and CANNOT proceed until they accept.
 * 
 * - Checks on mount and when user changes
 * - Records acceptance to the database with timestamp
 * - Only re-prompts when terms_version or privacy_version changes
 * - Role-independent: applies equally to client and provider
 */
const TermsGate: React.FC<TermsGateProps> = ({
  children,
  onNavigateTerms,
  onNavigatePrivacy,
  onLogout,
}) => {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [shakeConsent, setShakeConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const consentRef = useRef<HTMLDivElement>(null);

  // Check terms acceptance on mount / user change
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!user?.id) {
        setChecking(false);
        setHasAccepted(false);
        return;
      }
      setChecking(true);
      try {
        const accepted = await checkTermsAcceptance(user.id);
        if (!cancelled) {
          setHasAccepted(accepted);
        }
      } catch {
        if (!cancelled) setHasAccepted(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Clear error when checkbox is toggled
  useEffect(() => {
    if (consentChecked) {
      setConsentError(false);
      setSaveError('');
    }
  }, [consentChecked]);

  const triggerConsentError = useCallback(() => {
    setConsentError(true);
    setShakeConsent(true);
    consentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setShakeConsent(false), 600);
  }, []);

  const handleAccept = useCallback(async () => {
    if (!consentChecked) {
      triggerConsentError();
      return;
    }
    if (!user?.id) return;

    setSaving(true);
    setSaveError('');
    try {
      const result = await recordTermsAcceptance(user.id, user.role || 'client');
      if (result) {
        setSaveSuccess(true);
        setTimeout(() => {
          setHasAccepted(true);
        }, 800);
      } else {
        setSaveError('Failed to save acceptance. Please try again. / स्वीकृति सुरक्षित गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [consentChecked, user, triggerConsentError]);

  const handleConsentToggle = useCallback(() => {
    setConsentChecked(prev => !prev);
  }, []);

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verifying terms acceptance...</p>
          <p className="text-gray-400 text-xs mt-0.5">सर्त स्वीकृति प्रमाणित गर्दै...</p>
        </div>
      </div>
    );
  }

  // Already accepted — render children
  if (hasAccepted) {
    return <>{children}</>;
  }

  // Not accepted — show full-screen gate
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C8102E]/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-[72px] h-[72px] bg-gradient-to-br from-[#C8102E] to-[#9B0B22] rounded-[22px] shadow-xl shadow-red-200/40 mb-5 ring-4 ring-white">
              <Shield className="w-9 h-9 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">सेवा सर्तहरू र गोपनीयता नीति</p>
            <p className="text-xs text-gray-400 mt-2">
              Please review and accept before continuing
            </p>
            <p className="text-xs text-gray-400">
              कृपया जारी राख्नु अघि समीक्षा गरी स्वीकार गर्नुहोस्
            </p>
          </div>

          {/* User info badge */}
          {user && (
            <div className="flex items-center justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${
                user.role === 'provider' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Lock className="w-3.5 h-3.5" />
                {user.role === 'provider' ? 'Service Provider' : 'Client'} — {user.name || user.email}
              </div>
            </div>
          )}

          {/* Legal documents links */}
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={onNavigateTerms}
              className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#C8102E]/50 hover:bg-red-50/30 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                <FileText className="w-5 h-5 text-[#C8102E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Terms of Service</p>
                <p className="text-xs text-gray-500">सेवा सर्तहरू</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#C8102E] transition-colors flex-shrink-0" />
            </button>

            <button
              type="button"
              onClick={onNavigatePrivacy}
              className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#C8102E]/50 hover:bg-red-50/30 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Privacy Policy</p>
                <p className="text-xs text-gray-500">गोपनीयता नीति</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#C8102E] transition-colors flex-shrink-0" />
            </button>
          </div>

          {/* Version info */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
              Terms {CURRENT_TERMS_VERSION}
            </span>
            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
              Privacy {CURRENT_PRIVACY_VERSION}
            </span>
          </div>

          {/* Consent checkbox */}
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
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Label Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm text-gray-800 font-medium leading-relaxed">
                    By signing in, you agree to our{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onNavigateTerms?.(); }}
                      className="text-[#C8102E] hover:text-[#a00d24] font-bold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
                    >
                      Terms of Service
                    </button>
                    {' and '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onNavigatePrivacy?.(); }}
                      className="text-[#C8102E] hover:text-[#a00d24] font-bold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
                    >
                      Privacy Policy
                    </button>
                    .
                  </p>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 leading-relaxed">
                    साइन इन गरेर, तपाईं हाम्रो{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onNavigateTerms?.(); }}
                      className="text-gray-600 hover:text-[#C8102E] font-semibold underline underline-offset-2 transition-colors"
                    >
                      सेवा सर्तहरू
                    </button>
                    {' र '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onNavigatePrivacy?.(); }}
                      className="text-gray-600 hover:text-[#C8102E] font-semibold underline underline-offset-2 transition-colors"
                    >
                      गोपनीयता नीति
                    </button>
                    मा सहमत हुनुहुन्छ।
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
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-red-700">
                    You must agree to the Terms of Service and Privacy Policy to continue.
                  </p>
                  <p className="text-[12px] text-red-600 mt-0.5">
                    जारी राख्न तपाईंले सेवा सर्तहरू र गोपनीयता नीतिमा सहमत हुनुपर्छ।
                  </p>
                </div>
              </div>
            )}

            {/* Save Error */}
            {saveError && (
              <div className="mt-3 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-700">{saveError}</p>
              </div>
            )}
          </div>

          {/* Success state */}
          {saveSuccess ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm font-bold text-green-700">Terms Accepted!</p>
              <p className="text-xs text-green-600 mt-0.5">सर्तहरू स्वीकार गरियो!</p>
              <p className="text-xs text-gray-400 mt-2">Redirecting... / रिडाइरेक्ट गर्दै...</p>
            </div>
          ) : (
            <>
              {/* Accept button */}
              <button
                type="button"
                onClick={handleAccept}
                disabled={saving}
                className={`
                  w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${
                    consentChecked
                      ? 'bg-[#C8102E] text-white hover:bg-[#A00D24] shadow-lg shadow-red-200/40'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                  disabled:opacity-60
                `}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving... / सुरक्षित गर्दै...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    I Agree & Continue / म सहमत छु र जारी राख्छु
                  </>
                )}
              </button>

              {/* Sign out option */}
              {onLogout && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    Sign out instead / साइन आउट गर्नुहोस्
                  </button>
                </div>
              )}
            </>
          )}

          {/* Legal note */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400">
              Your acceptance is recorded securely with timestamp for legal compliance.
            </p>
            <p className="text-[10px] text-gray-400">
              कानुनी अनुपालनको लागि तपाईंको स्वीकृति टाइमस्ट्याम्पसहित सुरक्षित रूपमा रेकर्ड गरिन्छ।
            </p>
          </div>
        </div>
      </div>

      {/* Inline keyframe styles */}
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

export default TermsGate;
