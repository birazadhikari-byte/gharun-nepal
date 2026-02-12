import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle, ArrowRight, Lock, Key } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { upsertProfile } from '@/lib/database';

interface AdminSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

type SetupStep = 'secret' | 'ready' | 'creating' | 'signing-in' | 'setting-profile' | 'success' | 'error' | 'already-exists';

// Environment variables बाट admin credentials लिने
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_NAME = import.meta.env.VITE_ADMIN_NAME;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

const AdminSetup: React.FC<AdminSetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<SetupStep>('secret');
  const [inputSecret, setInputSecret] = useState('');
  const [secretError, setSecretError] = useState('');
  const [statusMessages, setStatusMessages] = useState<Array<{ text: string; type: 'info' | 'success' | 'error' | 'warning' }>>([]);
  const [errorDetail, setErrorDetail] = useState('');
  const hasStarted = useRef(false);

  // Check if environment variables are set
  useEffect(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME || !ADMIN_SECRET) {
      setStep('error');
      setErrorDetail('Admin setup is not configured. Please contact system administrator.');
    }
  }, []);

  const addMessage = (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setStatusMessages(prev => [...prev, { text, type }]);
  };

  // Clear the setup URL parameter immediately
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('setup')) {
      const secret = url.searchParams.get('setup');
      url.searchParams.delete('setup');
      window.history.replaceState({}, '', url.pathname);
      
      // If secret matches, proceed
      if (secret === ADMIN_SECRET) {
        setStep('ready');
      }
    }
  }, []);

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSecret === ADMIN_SECRET) {
      setStep('ready');
      setSecretError('');
    } else {
      setSecretError('Invalid secret key');
    }
  };

  const runSetup = async () => {
    if (hasStarted.current) return;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
      setStep('error');
      addMessage('Admin configuration missing!', 'error');
      return;
    }

    hasStarted.current = true;
    setStep('creating');
    setStatusMessages([]);
    addMessage('Starting admin account setup...', 'info');

    try {
      // Step 1: Try to sign in first
      addMessage(`Checking if ${ADMIN_EMAIL} already exists...`, 'info');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (!signInError && signInData.user) {
        // Account already exists and works
        addMessage('Admin account verified!', 'success');
        
        setStep('setting-profile');
        addMessage('Updating admin profile...', 'info');
        try {
          await upsertProfile({
            id: signInData.user.id,
            full_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: 'admin',
          });
          addMessage('Admin profile confirmed.', 'success');
        } catch (profileErr: any) {
          addMessage(`Profile note: ${profileErr.message}`, 'warning');
        }

        setStep('success');
        addMessage('Setup complete! Redirecting...', 'success');
        
        setTimeout(() => onComplete(), 2000);
        return;
      }

      // Step 2: Create new account
      addMessage('Creating new admin account...', 'info');
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
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setStep('already-exists');
          addMessage('Account exists but password may be different.', 'warning');
          addMessage('Use "Forgot Password" to reset or sign in with correct password.', 'info');
          return;
        }
        throw new Error(signUpError.message);
      }

      if (!signUpData.user) throw new Error('No user data returned');

      addMessage('Account created successfully!', 'success');

      // Step 3: Setup profile
      setStep('setting-profile');
      addMessage('Creating admin profile...', 'info');
      
      await upsertProfile({
        id: signUpData.user.id,
        full_name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'admin',
      });

      addMessage('Admin profile created!', 'success');
      setStep('success');
      
      setTimeout(() => onComplete(), 1500);

    } catch (err: any) {
      setStep('error');
      addMessage(`Setup failed: ${err.message}`, 'error');
      setErrorDetail(err.message);
    }
  };

  // Secret key input screen
  if (step === 'secret') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Setup Protected</h1>
              <p className="text-red-200 text-sm mt-1">Enter secret key to continue</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSecretSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Secret Key
                  </label>
                  <input
                    type="password"
                    value={inputSecret}
                    onChange={(e) => setInputSecret(e.target.value)}
                    placeholder="Enter secret key..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors"
                    autoFocus
                  />
                  {secretError && (
                    <p className="text-xs text-red-600 mt-2">{secretError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Account Setup</h1>
            <p className="text-blue-200 text-sm mt-1">Gharun Nepal - Secure Configuration</p>
          </div>

          <div className="p-8">
            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">⚠️ Secure Setup</p>
                <p className="text-xs text-amber-600 mt-1">
                  This is a one-time setup page. Admin credentials are stored securely in environment variables.
                </p>
              </div>
            </div>

            {/* Status Area */}
            <div className="flex items-center gap-3 mb-6">
              {step === 'ready' && <Shield className="w-8 h-8 text-blue-500" />}
              {(step === 'creating' || step === 'signing-in' || step === 'setting-profile') && 
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />}
              {step === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
              {step === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
              {step === 'already-exists' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
              
              <div>
                <h2 className="font-semibold text-gray-900">
                  {step === 'ready' && 'Ready to Setup'}
                  {step === 'creating' && 'Creating Account...'}
                  {step === 'signing-in' && 'Signing In...'}
                  {step === 'setting-profile' && 'Setting Up Profile...'}
                  {step === 'success' && 'Setup Complete!'}
                  {step === 'error' && 'Setup Failed'}
                  {step === 'already-exists' && 'Account Already Exists'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
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
                    Setup Admin
                  </button>
                </>
              )}

              {step === 'success' && (
                <button
                  onClick={onComplete}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {(step === 'error' || step === 'already-exists') && (
                <button
                  onClick={onCancel}
                  className="w-full py-3 px-4 bg-gray-600 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
