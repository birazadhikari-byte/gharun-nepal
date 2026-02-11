import React, { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const ChangePasswordPanel: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'updating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const strength = useMemo<PasswordStrength>(() => ({
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword),
  }), [newPassword]);

  const allStrengthMet = strength.minLength && strength.hasUppercase && strength.hasNumber && strength.hasSpecial;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && allStrengthMet && passwordsMatch && status !== 'verifying' && status !== 'updating';

  const strengthScore = [strength.minLength, strength.hasUppercase, strength.hasNumber, strength.hasSpecial].filter(Boolean).length;
  const strengthLabel = strengthScore === 0 ? '' : strengthScore <= 1 ? 'Weak' : strengthScore <= 2 ? 'Fair' : strengthScore <= 3 ? 'Good' : 'Strong';
  const strengthColor = strengthScore <= 1 ? 'bg-red-500' : strengthScore <= 2 ? 'bg-orange-500' : strengthScore <= 3 ? 'bg-yellow-500' : 'bg-green-500';

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user?.email) return;

    setErrorMessage('');
    setSuccessMessage('');

    // Step 1: Verify current password by re-authenticating
    setStatus('verifying');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setStatus('error');
        setErrorMessage('Current password is incorrect. Please try again.');
        return;
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Failed to verify current password. Please try again.');
      return;
    }

    // Step 2: Check new password is not same as current
    if (newPassword === currentPassword) {
      setStatus('error');
      setErrorMessage('New password must be different from your current password.');
      return;
    }

    // Step 3: Update password
    setStatus('updating');
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setStatus('error');
        setErrorMessage(updateError.message || 'Failed to update password. Please try again.');
        return;
      }

      setStatus('success');
      setSuccessMessage('Password updated successfully! Your new password is now active.');
      resetForm();

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const StrengthCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  return (
    <div className="max-w-2xl">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Change Password</h2>
              <p className="text-sm text-purple-200">Update your admin account password</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Current Account Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
            </div>
          </div>

          {/* Success Message */}
          {status === 'success' && successMessage && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Password Changed</p>
                <p className="text-xs text-green-600 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 animate-in fade-in duration-300">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
                  placeholder="Enter your current password"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  autoComplete="current-password"
                  disabled={status === 'verifying' || status === 'updating'}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a strong new password"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  autoComplete="new-password"
                  disabled={status === 'verifying' || status === 'updating'}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Bar */}
              {newPassword.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${i < strengthScore ? strengthColor : 'bg-gray-100'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${
                      strengthScore <= 1 ? 'text-red-600' : strengthScore <= 2 ? 'text-orange-600' : strengthScore <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <StrengthCheck met={strength.minLength} label="At least 8 characters" />
                    <StrengthCheck met={strength.hasUppercase} label="One uppercase letter" />
                    <StrengthCheck met={strength.hasNumber} label="One number" />
                    <StrengthCheck met={strength.hasSpecial} label="One special character" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                  autoComplete="new-password"
                  disabled={status === 'verifying' || status === 'updating'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'verifying' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying Current Password...
                  </>
                ) : status === 'updating' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
              {(currentPassword || newPassword || confirmPassword) && status !== 'verifying' && status !== 'updating' && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Security Tips</p>
                <ul className="text-xs text-amber-700 mt-1.5 space-y-1">
                  <li>Use a unique password not used on other sites.</li>
                  <li>Avoid using personal information like your name or birthdate.</li>
                  <li>Consider using a password manager to generate and store passwords.</li>
                  <li>After changing your password, you may need to sign in again on other devices.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPanel;
