import React, { useState, useRef, useCallback } from 'react';
import { X, Phone, Mail, Shield, ArrowLeft, CheckCircle2, Eye, EyeOff, User, Wrench, KeyRound, MailCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { recordTermsAcceptance, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '@/lib/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; role: string }) => void;
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
}

type AuthStep = 'role-select' | 'choose' | 'phone' | 'email' | 'otp' | 'success' | 'forgot-password' | 'reset-code' | 'new-password' | 'reset-success';
type UserRole = 'client' | 'provider';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onNavigateTerms, onNavigatePrivacy }) => {
  const { signInWithPhone, verifyOtp, signInWithEmail, signUpWithEmail, forgotPassword, verifyResetOtp, confirmPasswordReset } = useAuth();
  const [step, setStep] = useState<AuthStep>('role-select');
  const [role, setRole] = useState<UserRole>('client');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // ============ TERMS CONSENT STATE ============
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [shakeTerms, setShakeTerms] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('role-select'); setPhone(''); setEmail(''); setPassword('');
    setOtp(''); setName(''); setError(''); setLoading(false);
    setIsSignUp(false); setShowPassword(false); setRole('client');
    setResetEmail(''); setResetCode(''); setResetToken('');
    setNewPassword(''); setConfirmNewPassword(''); setResetMessage('');
    setTermsAccepted(false); setTermsError(false); setShakeTerms(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  // ============ TERMS VALIDATION ============
  const triggerTermsError = () => {
    setTermsError(true);
    setShakeTerms(true);
    termsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setShakeTerms(false), 600);
  };

  const validateTerms = (): boolean => {
    if (!termsAccepted) {
      triggerTermsError();
      return false;
    }
    return true;
  };

  const handleTermsToggle = () => {
    setTermsAccepted(prev => !prev);
    setTermsError(false);
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    // ENFORCE: Terms must be accepted before selecting role
    if (!validateTerms()) return;
    setRole(selectedRole);
    setStep('choose');
  };

  // Record terms acceptance after successful auth
  const recordTermsAfterAuth = async (userId: string, userRole: string) => {
    try {
      await recordTermsAcceptance(userId, userRole);
    } catch {
      // Non-blocking — terms gate will catch this on next load
    }
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) { setError('Please enter a valid 10-digit phone number / कृपया मान्य १० अंकको फोन नम्बर हाल्नुहोस्'); return; }
    setError(''); setLoading(true);
    try {
      const result = await signInWithPhone(phone);
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.error || 'Failed to send OTP. Please try again or use email login. / OTP पठाउन असफल।');
      }
    } catch {
      setError('Failed to send OTP. Please try email login instead. / OTP पठाउन असफल।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setError('Please enter the OTP code / कृपया OTP कोड हाल्नुहोस्'); return; }
    setError(''); setLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result.success) {
        setStep('success');
        setTimeout(() => { onLogin({ name: phone, role }); handleClose(); }, 1500);
      } else {
        setError(result.error || 'Invalid OTP. Please try again. / अमान्य OTP।');
      }
    } catch {
      setError('Verification failed. Please try again. / प्रमाणीकरण असफल।');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email address / कृपया मान्य इमेल ठेगाना हाल्नुहोस्'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters / पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ'); return; }
    setError(''); setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) { setError('Please enter your full name / कृपया आफ्नो पूरा नाम हाल्नुहोस्'); setLoading(false); return; }
        const result = await signUpWithEmail(email, password, name, role);
        if (result.success) {
          setStep('success');
          setTimeout(() => { onLogin({ name, role }); handleClose(); }, 1500);
        } else {
          setError(result.error || 'Signup failed / साइन अप असफल');
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          setStep('success');
          setTimeout(() => { onLogin({ name: email.split('@')[0], role }); handleClose(); }, 1500);
        } else {
          setError(result.error || 'Login failed. Check your credentials. / लगइन असफल।');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed / प्रमाणीकरण असफल');
    } finally {
      setLoading(false);
    }
  };

  // ============ PRODUCTION: Password Reset Handlers ============

  const handleForgotPasswordRequest = async () => {
    if (!resetEmail.includes('@')) { setError('Please enter a valid email / कृपया मान्य इमेल हाल्नुहोस्'); return; }
    setError(''); setLoading(true);
    try {
      const result = await forgotPassword(resetEmail);
      if (result.success) {
        setResetMessage(result.message || 'Reset code sent to your email.');
        setStep('reset-code');
      } else {
        setError(result.error || 'Failed to send reset code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    if (resetCode.length < 6) { setError('Please enter the 6-digit code / कृपया ६ अंकको कोड हाल्नुहोस्'); return; }
    setError(''); setLoading(true);
    try {
      const result = await verifyResetOtp(resetEmail, resetCode);
      if (result.success && result.resetToken) {
        setResetToken(result.resetToken);
        setStep('new-password');
      } else {
        setError(result.error || 'Invalid or expired code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) { setError('Password must be at least 6 characters / पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match / पासवर्ड मेल खाँदैन'); return; }
    setError(''); setLoading(true);
    try {
      const result = await confirmPasswordReset(resetEmail, resetToken, newPassword);
      if (result.success) {
        setResetMessage(result.message || 'Password reset successfully!');
        setStep('reset-success');
      } else {
        setError(result.error || 'Password reset failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const getBackStep = (): AuthStep => {
    if (step === 'otp') return 'phone';
    if (step === 'phone' || step === 'email') return 'choose';
    if (step === 'choose') return 'role-select';
    if (step === 'forgot-password') return 'email';
    if (step === 'reset-code') return 'forgot-password';
    if (step === 'new-password') return 'reset-code';
    return 'role-select';
  };

  // ============ TERMS CONSENT CHECKBOX COMPONENT ============
  const TermsCheckbox = () => (
    <div
      ref={termsRef}
      className={`mt-4 transition-all duration-300 ${shakeTerms ? 'animate-shake-inline' : ''}`}
    >
      <div
        className={`
          rounded-xl border-2 px-3.5 py-3 transition-all duration-300 cursor-pointer
          ${
            termsError
              ? 'border-red-400 bg-red-50/80'
              : termsAccepted
              ? 'border-emerald-400 bg-emerald-50/60'
              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
          }
        `}
        onClick={handleTermsToggle}
        role="checkbox"
        aria-checked={termsAccepted}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleTermsToggle();
          }
        }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${
                  termsAccepted
                    ? 'bg-emerald-500 border-emerald-500'
                    : termsError
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-white'
                }
              `}
            >
              {termsAccepted && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed">
              By signing in, you agree to our{' '}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigateTerms?.(); }}
                className="text-[#C8102E] font-bold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
              >
                Terms of Service
              </button>
              {' and '}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigatePrivacy?.(); }}
                className="text-[#C8102E] font-bold underline underline-offset-2 decoration-[#C8102E]/30 hover:decoration-[#C8102E] transition-colors"
              >
                Privacy Policy
              </button>
              .
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 leading-relaxed">
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

          {/* Check icon */}
          {termsAccepted && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          )}
        </div>
      </div>

      {/* Error */}
      {termsError && (
        <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-red-700">
              Please agree to the Terms & Privacy Policy to continue.
            </p>
            <p className="text-[10px] text-red-600 mt-0.5">
              कृपया जारी राख्न सेवा सर्त र गोपनीयता नीतिमा सहमत हुनुहोस्।
            </p>
          </div>
        </div>
      )}

      {/* Inline shake animation */}
      <style>{`
        @keyframes shakeInline {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .animate-shake-inline {
          animation: shakeInline 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] px-6 py-5 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step !== 'role-select' && step !== 'success' && step !== 'reset-success' && (
                <button onClick={() => { setStep(getBackStep()); setError(''); setResetMessage(''); }} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Shield className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">{t.brand.en}</h2>
                <p className="text-xs text-white/80">{t.brand.np} - {t.motto.np}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Role Selection */}
          {step === 'role-select' && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-900">{t.auth.whoAreYou.en}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t.auth.whoAreYou.np}</p>
                <p className="text-xs text-gray-400 mt-1">{t.auth.selectRole.en} / {t.auth.selectRole.np}</p>
              </div>

              {/* ============ MANDATORY TERMS CHECKBOX ============ */}
              <TermsCheckbox />

              <button onClick={() => handleRoleSelect('client')}
                className={`w-full flex items-center gap-4 px-5 py-5 border-2 rounded-2xl transition-all group ${
                  termsAccepted
                    ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                    : 'border-gray-200/60 bg-gray-50/50 opacity-60 cursor-not-allowed'
                }`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  termsAccepted ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-200'
                }`}>
                  <User className={`w-7 h-7 ${termsAccepted ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-base font-bold ${termsAccepted ? 'text-gray-900' : 'text-gray-400'}`}>{t.auth.iAmClient.en}</p>
                  <p className={`text-xs ${termsAccepted ? 'text-gray-600' : 'text-gray-400'}`}>{t.auth.iAmClient.np}</p>
                  <p className={`text-[10px] mt-1 ${termsAccepted ? 'text-gray-400' : 'text-gray-300'}`}>{t.auth.clientDesc.en}</p>
                  <p className={`text-[10px] ${termsAccepted ? 'text-gray-400' : 'text-gray-300'}`}>{t.auth.clientDesc.np}</p>
                </div>
              </button>

              <button onClick={() => handleRoleSelect('provider')}
                className={`w-full flex items-center gap-4 px-5 py-5 border-2 rounded-2xl transition-all group ${
                  termsAccepted
                    ? 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
                    : 'border-gray-200/60 bg-gray-50/50 opacity-60 cursor-not-allowed'
                }`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  termsAccepted ? 'bg-green-100 group-hover:bg-green-200' : 'bg-gray-200'
                }`}>
                  <Wrench className={`w-7 h-7 ${termsAccepted ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-base font-bold ${termsAccepted ? 'text-gray-900' : 'text-gray-400'}`}>{t.auth.iAmProvider.en}</p>
                  <p className={`text-xs ${termsAccepted ? 'text-gray-600' : 'text-gray-400'}`}>{t.auth.iAmProvider.np}</p>
                  <p className={`text-[10px] mt-1 ${termsAccepted ? 'text-gray-400' : 'text-gray-300'}`}>{t.auth.providerDesc.en}</p>
                  <p className={`text-[10px] ${termsAccepted ? 'text-gray-400' : 'text-gray-300'}`}>{t.auth.providerDesc.np}</p>
                </div>
              </button>

              {/* Version info */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-[9px] text-gray-300 font-mono">Terms {CURRENT_TERMS_VERSION}</span>
                <span className="text-[9px] text-gray-300 font-mono">Privacy {CURRENT_PRIVACY_VERSION}</span>
              </div>
            </div>
          )}

          {/* Step 2: Choose auth method */}
          {step === 'choose' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {role === 'client' ? <User className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                  {role === 'client' ? `${t.auth.clientAccount.en} / ${t.auth.clientAccount.np}` : `${t.auth.providerAccount.en} / ${t.auth.providerAccount.np}`}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t.auth.signInSignUp.en}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.auth.signInSignUp.np}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.auth.chooseMethod.en} / {t.auth.chooseMethod.np}</p>
              </div>

              {/* Terms accepted badge */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-700">Terms & Privacy accepted</span>
                  <span className="text-[10px] text-emerald-600">/ सर्त स्वीकृत</span>
                </div>
              </div>

              <button onClick={() => setStep('phone')}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-[#C8102E] hover:bg-[#C8102E]/5 transition-all group">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{t.auth.continuePhone.en}</p>
                  <p className="text-xs text-gray-500">{t.auth.continuePhone.np}</p>
                  <p className="text-[10px] text-gray-400">{t.auth.otpViaSms.en} / {t.auth.otpViaSms.np}</p>
                </div>
              </button>

              <button onClick={() => { setStep('email'); setIsSignUp(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-[#C8102E] hover:bg-[#C8102E]/5 transition-all group">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{t.auth.continueEmail.en}</p>
                  <p className="text-xs text-gray-500">{t.auth.continueEmail.np}</p>
                  <p className="text-[10px] text-gray-400">{t.auth.emailPassword.en} / {t.auth.emailPassword.np}</p>
                </div>
              </button>
            </div>
          )}

          {/* Phone input */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{t.auth.enterPhone.en}</h3>
                <p className="text-sm text-gray-500">{t.auth.enterPhone.np}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.auth.sendOtp.en}</p>
                <p className="text-xs text-gray-400">{t.auth.sendOtp.np}</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600">+977</div>
                <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                  placeholder="98XXXXXXXX" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" autoFocus />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
              <button onClick={handleSendOtp} disabled={loading}
                className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending... / पठाउँदै...</> : `Send OTP / OTP पठाउनुहोस्`}
              </button>
              <p className="text-xs text-gray-400 text-center">{t.auth.smsCharges.en} / {t.auth.smsCharges.np}</p>
            </div>
          )}

          {/* Email input */}
          {step === 'email' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{isSignUp ? t.auth.createAccount.en : t.auth.signInEmail.en}</h3>
                <p className="text-sm text-gray-500">{isSignUp ? t.auth.createAccount.np : t.auth.signInEmail.np}</p>
              </div>
              {isSignUp && (
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder={`${t.auth.fullName.en} / ${t.auth.fullName.np}`} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" />
              )}
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" autoFocus />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={`${t.auth.password.en} / ${t.auth.password.np}`} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && role === 'provider' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs text-green-800">{t.auth.providerVerifyNote.en}</p>
                  <p className="text-xs text-green-700 mt-0.5">{t.auth.providerVerifyNote.np}</p>
                </div>
              )}
              {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
              <button onClick={handleEmailAuth} disabled={loading}
                className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {isSignUp ? 'Creating...' : 'Signing in...'}</>
                ) : (
                  isSignUp ? `${t.auth.createAccount.en} / ${t.auth.createAccount.np}` : `${t.nav.signIn.en} / ${t.nav.signIn.np}`
                )}
              </button>
              <div className="flex items-center justify-between">
                <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm text-[#C8102E] font-medium hover:underline">
                  {isSignUp ? `${t.auth.alreadyAccount.en}` : `${t.auth.noAccount.en}`}
                </button>
                {!isSignUp && (
                  <button onClick={() => { setResetEmail(email); setError(''); setStep('forgot-password'); }} className="text-sm text-gray-500 font-medium hover:text-[#C8102E] hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OTP verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{t.auth.verifyOtp.en}</h3>
                <p className="text-sm text-gray-500">{t.auth.verifyOtp.np}</p>
                <p className="text-xs text-gray-400 mt-1">{t.auth.enterCode.en} +977-{phone}</p>
              </div>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input key={i} type="text" maxLength={1} value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newOtp = otp.split(''); newOtp[i] = val; setOtp(newOtp.join('')); setError('');
                      if (val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                    }}
                    className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-[#C8102E] focus:outline-none transition-colors"
                    autoFocus={i === 0} />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-lg">{error}</p>}
              <button onClick={handleVerifyOtp} disabled={loading}
                className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</> : `Verify Code / कोड प्रमाणित गर्नुहोस्`}
              </button>
              <button onClick={handleSendOtp} className="w-full text-sm text-[#C8102E] font-medium hover:underline">{t.auth.resendOtp.en} / {t.auth.resendOtp.np}</button>
            </div>
          )}

          {/* ============ FORGOT PASSWORD: Step 1 - Enter Email ============ */}
          {step === 'forgot-password' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                <p className="text-sm text-gray-500">पासवर्ड रिसेट गर्नुहोस्</p>
                <p className="text-xs text-gray-400 mt-1">Enter your email to receive a 6-digit reset code</p>
                <p className="text-xs text-gray-400">रिसेट कोड प्राप्त गर्न आफ्नो इमेल हाल्नुहोस्</p>
              </div>
              <input type="email" value={resetEmail} onChange={(e) => { setResetEmail(e.target.value); setError(''); }}
                placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" autoFocus />
              {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
              <button onClick={handleForgotPasswordRequest} disabled={loading}
                className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending code...</> : 'Send Reset Code / रिसेट कोड पठाउनुहोस्'}
              </button>
              <p className="text-xs text-gray-400 text-center">Code expires in 10 minutes / कोड १० मिनेटमा समाप्त हुन्छ</p>
            </div>
          )}

          {/* ============ FORGOT PASSWORD: Step 2 - Enter Code ============ */}
          {step === 'reset-code' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MailCheck className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enter Reset Code</h3>
                <p className="text-sm text-gray-500">रिसेट कोड हाल्नुहोस्</p>
                {resetMessage && <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg mt-2">{resetMessage}</p>}
                <p className="text-xs text-gray-400 mt-1">Check your email: <strong>{resetEmail}</strong></p>
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input key={i} type="text" maxLength={1} value={resetCode[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newCode = resetCode.split(''); newCode[i] = val; setResetCode(newCode.join('')); setError('');
                      if (val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                    }}
                    className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-[#C8102E] focus:outline-none transition-colors"
                    autoFocus={i === 0} />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-lg">{error}</p>}
              <button onClick={handleVerifyResetCode} disabled={loading}
                className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</> : 'Verify Code / कोड प्रमाणित गर्नुहोस्'}
              </button>
              <button onClick={handleForgotPasswordRequest} disabled={loading} className="w-full text-sm text-[#C8102E] font-medium hover:underline">
                Resend Code / कोड पुन: पठाउनुहोस्
              </button>
            </div>
          )}

          {/* ============ FORGOT PASSWORD: Step 3 - New Password ============ */}
          {step === 'new-password' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Set New Password</h3>
                <p className="text-sm text-gray-500">नयाँ पासवर्ड सेट गर्नुहोस्</p>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="New password / नयाँ पासवर्ड" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors pr-10" autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => { setConfirmNewPassword(e.target.value); setError(''); }}
                placeholder="Confirm password / पासवर्ड पुष्टि गर्नुहोस्" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" />
              {newPassword && newPassword.length < 6 && (
                <p className="text-xs text-amber-600">Minimum 6 characters required / कम्तिमा ६ अक्षर आवश्यक</p>
              )}
              {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
              <button onClick={handleResetPassword} disabled={loading}
                className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resetting...</> : 'Reset Password / पासवर्ड रिसेट गर्नुहोस्'}
              </button>
            </div>
          )}

          {/* ============ FORGOT PASSWORD: Step 4 - Success ============ */}
          {step === 'reset-success' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Password Reset!</h3>
              <p className="text-sm text-gray-500">पासवर्ड सफलतापूर्वक रिसेट भयो!</p>
              {resetMessage && <p className="text-xs text-green-600">{resetMessage}</p>}
              <p className="text-xs text-gray-400">You can now sign in with your new password.</p>
              <p className="text-xs text-gray-400">अब नयाँ पासवर्डले साइन इन गर्नुहोस्।</p>
              <button onClick={() => { setStep('email'); setIsSignUp(false); setPassword(''); setError(''); setResetMessage(''); }}
                className="mt-4 px-6 py-2.5 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors">
                Sign In Now / अहिले साइन इन गर्नुहोस्
              </button>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t.auth.welcome.en}</h3>
              <p className="text-sm text-gray-500">{t.auth.welcome.np}</p>
              <p className="text-xs text-gray-400">{t.auth.redirecting.en}</p>
              <p className="text-xs text-gray-400">{t.auth.redirecting.np}</p>
              <div className="w-8 h-8 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
