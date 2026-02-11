import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { upsertProfile } from '@/lib/database';

interface AdminSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

type SetupStep = 'ready' | 'creating' | 'signing-in' | 'setting-profile' | 'success' | 'error' | 'already-exists';

const ADMIN_EMAIL = 'biraj@gharunepal.com';
const ADMIN_PASSWORD = 'anita$!1A';
const ADMIN_NAME = 'Biraj';

const AdminSetup: React.FC<AdminSetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<SetupStep>('ready');
  const [statusMessages, setStatusMessages] = useState<Array<{ text: string; type: 'info' | 'success' | 'error' | 'warning' }>>([]);
  const [errorDetail, setErrorDetail] = useState('');
  const hasStarted = useRef(false);

  const addMessage = (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setStatusMessages(prev => [...prev, { text, type }]);
  };

  // Clear the setup URL parameter immediately
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('setup')) {
      url.searchParams.delete('setup');
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  const runSetup = async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    setStep('creating');
    setStatusMessages([]);
    addMessage('Starting admin account setup...', 'info');

    try {
      // Step 1: Try to sign in first (account might already exist)
      addMessage(`Checking if ${ADMIN_EMAIL} already exists...`, 'info');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (!signInError && signInData.user) {
        // Account already exists and credentials work
        addMessage('Account already exists! Signing in...', 'success');
        
        // Ensure profile exists
        setStep('setting-profile');
        addMessage('Ensuring admin profile is set up...', 'info');
        try {
          await upsertProfile({
            id: signInData.user.id,
            full_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: 'admin',
          });
          addMessage('Admin profile confirmed.', 'success');
        } catch (profileErr: any) {
          addMessage(`Profile note: ${profileErr.message || 'Could not update profile, but login works.'}`, 'warning');
        }

        setStep('success');
        addMessage('Admin account is ready! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
          onComplete();
        }, 2000);
        return;
      }

      // Step 2: Account doesn't exist or wrong password - try to create it
      addMessage('Account not found. Creating new admin account...', 'info');
      setStep('creating');

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: ADMIN_NAME,
            role: 'admin',
          },
        },
      });

      if (signUpError) {
        // Check if it's a "user already registered" error
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setStep('already-exists');
          addMessage('Account already exists but password may be different.', 'warning');
          addMessage('Please use the admin login page at /?ops=gharun2026 to sign in.', 'info');
          addMessage('Or use "Forgot Password" to reset your password.', 'info');
          setErrorDetail('The admin account already exists. Use /?ops=gharun2026 to access the login page.');
          return;
        }
        throw new Error(signUpError.message);
      }

      if (!signUpData.user) {
        throw new Error('Signup returned no user data.');
      }

      addMessage(`Account created for ${ADMIN_EMAIL}!`, 'success');

      // Step 3: Check if we got a session (auto-confirmed)
      if (signUpData.session) {
        addMessage('Email auto-confirmed. Session active!', 'success');
        
        // Set up profile
        setStep('setting-profile');
        addMessage('Creating admin profile...', 'info');
        try {
          await upsertProfile({
            id: signUpData.user.id,
            full_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: 'admin',
          });
          addMessage('Admin profile created successfully.', 'success');
        } catch (profileErr: any) {
          addMessage(`Profile note: ${profileErr.message}`, 'warning');
        }

        setStep('success');
        addMessage('Setup complete! Redirecting to admin dashboard...', 'success');
        
        setTimeout(() => {
          onComplete();
        }, 2000);
        return;
      }

      // Step 4: No session - email confirmation might be required
      // Try signing in anyway (some configs auto-confirm)
      setStep('signing-in');
      addMessage('Attempting to sign in with new credentials...', 'info');

      // Small delay to allow any async confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (!retryError && retryData.user) {
        addMessage('Sign-in successful!', 'success');
        
        setStep('setting-profile');
        addMessage('Setting up admin profile...', 'info');
        try {
          await upsertProfile({
            id: retryData.user.id,
            full_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: 'admin',
          });
          addMessage('Admin profile created.', 'success');
        } catch (profileErr: any) {
          addMessage(`Profile note: ${profileErr.message}`, 'warning');
        }

        setStep('success');
        addMessage('Setup complete! Redirecting...', 'success');
        
        setTimeout(() => {
          onComplete();
        }, 2000);
        return;
      }

      // Email confirmation is required
      setStep('error');
      addMessage('Account created but email confirmation is required.', 'warning');
      addMessage(`Check ${ADMIN_EMAIL} inbox for a confirmation email.`, 'info');
      addMessage('After confirming, go to /?ops=gharun2026 to sign in.', 'info');
      setErrorDetail(
        'Email confirmation is enabled on this project. ' +
        'To fix this:\n\n' +
        '1. Check biraj@gharunepal.com inbox and click the confirmation link, OR\n' +
        '2. Go to Supabase Dashboard > Authentication > Settings and disable "Confirm email", OR\n' +
        '3. Go to Supabase Dashboard > Authentication > Users and manually confirm the email.\n\n' +
        'After confirming, use /?ops=gharun2026 to access the admin login.'
      );

    } catch (err: any) {
      setStep('error');
      addMessage(`Setup failed: ${err.message}`, 'error');
      setErrorDetail(err.message);
    }
  };

  const getStepIcon = (s: SetupStep) => {
    switch (s) {
      case 'ready': return <Shield className="w-8 h-8 text-blue-500" />;
      case 'creating':
      case 'signing-in':
      case 'setting-profile':
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error': return <XCircle className="w-8 h-8 text-red-500" />;
      case 'already-exists': return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    }
  };

  const getStepTitle = (s: SetupStep) => {
    switch (s) {
      case 'ready': return 'Admin Account Setup';
      case 'creating': return 'Creating Account...';
      case 'signing-in': return 'Signing In...';
      case 'setting-profile': return 'Setting Up Profile...';
      case 'success': return 'Setup Complete!';
      case 'error': return 'Setup Issue';
      case 'already-exists': return 'Account Already Exists';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">One-Time Admin Setup</h1>
            <p className="text-blue-200 text-sm mt-1">Gharun Nepal - Secure Account Creation</p>
          </div>

          <div className="p-8">
            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">One-Time Setup</p>
                <p className="text-xs text-amber-600 mt-1">
                  This will create the admin account for <strong>{ADMIN_EMAIL}</strong>. 
                  This page is only accessible via a secret URL and should only be used once.
                </p>
              </div>
            </div>

            {/* Status Area */}
            <div className="flex items-center gap-3 mb-6">
              {getStepIcon(step)}
              <div>
                <h2 className="font-semibold text-gray-900">{getStepTitle(step)}</h2>
                <p className="text-sm text-gray-500">
                  {step === 'ready' && 'Click the button below to create the admin account.'}
                  {step === 'creating' && 'Please wait while the account is being created...'}
                  {step === 'signing-in' && 'Attempting to sign in with the new credentials...'}
                  {step === 'setting-profile' && 'Configuring admin profile and permissions...'}
                  {step === 'success' && 'Everything is set up! Redirecting to dashboard...'}
                  {step === 'error' && 'There was an issue during setup. See details below.'}
                  {step === 'already-exists' && 'The admin account already exists.'}
                </p>
              </div>
            </div>

            {/* Log Messages */}
            {statusMessages.length > 0 && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {statusMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        msg.type === 'success' ? 'bg-green-500' :
                        msg.type === 'error' ? 'bg-red-500' :
                        msg.type === 'warning' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`} />
                      <p className={`text-xs font-mono ${
                        msg.type === 'success' ? 'text-green-700' :
                        msg.type === 'error' ? 'text-red-700' :
                        msg.type === 'warning' ? 'text-amber-700' :
                        'text-gray-600'
                      }`}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Detail */}
            {errorDetail && (step === 'error' || step === 'already-exists') && (
              <div className="bg-gray-900 rounded-xl p-4 mb-6">
                <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{errorDetail}</p>
              </div>
            )}

            {/* Account Details */}
            {step === 'ready' && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Email:</span>
                    <span className="text-xs font-mono text-gray-900">{ADMIN_EMAIL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Password:</span>
                    <span className="text-xs font-mono text-gray-900">{'*'.repeat(ADMIN_PASSWORD.length)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Role:</span>
                    <span className="text-xs font-mono text-gray-900">System Admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Name:</span>
                    <span className="text-xs font-mono text-gray-900">{ADMIN_NAME}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {step === 'ready' && (
                <>
                  <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runSetup}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Create Admin Account
                  </button>
                </>
              )}

              {(step === 'creating' || step === 'signing-in' || step === 'setting-profile') && (
                <div className="flex-1 py-3 px-4 bg-gray-100 text-gray-400 rounded-xl font-medium text-sm text-center cursor-not-allowed flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              )}

              {step === 'success' && (
                <button
                  onClick={onComplete}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {(step === 'error' || step === 'already-exists') && (
                <>
                  <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Go Home
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to admin login
                      window.location.href = '/?ops=gharun2026';
                    }}
                    className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Go to Admin Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          &copy; 2026 Gharun Nepal. This setup page is confidential.
        </p>
      </div>
    </div>
  );
};

export default AdminSetup;
