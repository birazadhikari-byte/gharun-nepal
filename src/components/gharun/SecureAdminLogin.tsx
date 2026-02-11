import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth, isInternalRole } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface SecureAdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type ViewMode = 'login' | 'forgot-password' | 'reset-sent';

const SecureAdminLogin: React.FC<SecureAdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { signInWithEmail, user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // If already logged in with internal role, redirect to dashboard
  useEffect(() => {
    if (user && isInternalRole(user.role)) {
      onSuccess();
    }
  }, [user, onSuccess]);

  // Lock timer countdown
  useEffect(() => {
    if (lockTimer > 0) {
      const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockTimer === 0 && locked) {
      setLocked(false);
    }
  }, [lockTimer, locked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (locked) return;

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      setError('Invalid credentials');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        // Success will be handled by the useEffect watching user state
        setAttempts(0);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLocked(true);
          setLockTimer(300); // 5 minute lockout
          setError('Too many failed attempts. Account locked for 5 minutes.');
        } else if (newAttempts >= 3) {
          setLocked(true);
          setLockTimer(60); // 1 minute lockout
          setError(`Too many failed attempts. Please wait ${60} seconds.`);
        } else {
          setError(result.error || 'Invalid credentials. Access denied.');
        }
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }

    // Only allow @gharunepal.com emails for password reset
    if (!resetEmail.endsWith('@gharunepal.com')) {
      setResetError('Password reset is only available for @gharunepal.com accounts.');
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/?ops=gharun2026`,
      });

      if (error) {
        setResetError(error.message);
      } else {
        setViewMode('reset-sent');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  // URL cleanup is handled by AppLayout - no need to duplicate here

  // Forgot Password View
  if (viewMode === 'forgot-password') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => { setViewMode('login'); setResetError(''); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Reset Password</h1>
              <p className="text-blue-200 text-sm mt-1">We'll send a reset link to your email</p>
            </div>

            {/* Form */}
            <form onSubmit={handleForgotPassword} className="p-8 space-y-5">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-800 font-medium">Password Reset</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Enter your @gharunepal.com email address. We'll send a password reset link.
                  </p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                  placeholder="your-name@gharunepal.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {/* Error */}
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 font-medium">{resetError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            &copy; 2026 Gharun Nepal. All access is monitored and logged.
          </p>
        </div>
      </div>
    );
  }

  // Reset Email Sent View
  if (viewMode === 'reset-sent') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Reset Link Sent!</h1>
              <p className="text-green-200 text-sm mt-1">Check your email inbox</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-medium">Email Sent Successfully</p>
                  <p className="text-xs text-green-600 mt-1">
                    A password reset link has been sent to <strong>{resetEmail}</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Next Steps:</h3>
                <ol className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    Check your email inbox (and spam folder)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    Click the password reset link in the email
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    Set your new password
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                    Return here and sign in with your new password
                  </li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Go Home
                </button>
                <button
                  onClick={() => { setViewMode('login'); setResetEmail(''); setResetError(''); }}
                  className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Back to Login
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            &copy; 2026 Gharun Nepal. All access is monitored and logged.
          </p>
        </div>
      </div>
    );
  }

  // Login View (default)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Secure Access</h1>
            <p className="text-gray-400 text-sm mt-1">Authorized personnel only</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Security warning */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-800 font-medium">This is a restricted area.</p>
                <p className="text-xs text-amber-600 mt-0.5">Unauthorized access attempts are logged and monitored.</p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:outline-none transition-colors"
                disabled={locked}
                autoFocus
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:outline-none transition-colors pr-10"
                  disabled={locked}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setViewMode('forgot-password');
                  setResetEmail(email || '');
                  setError('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700 font-medium">{error}</p>
                {locked && lockTimer > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Retry in: {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : locked ? (
                'Account Locked'
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Authenticate
                </>
              )}
            </button>

            {/* Attempt counter */}
            {attempts > 0 && !locked && (
              <p className="text-xs text-center text-gray-400">
                {5 - attempts} attempts remaining before lockout
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          &copy; 2026 Gharun Nepal. All access is monitored and logged.
        </p>
      </div>
    </div>
  );
};

export default SecureAdminLogin;
