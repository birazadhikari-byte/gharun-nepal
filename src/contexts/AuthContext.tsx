import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { upsertProfile, fetchProfile, sendWelcomeEmail, requestPasswordReset, verifyResetCode, resetPassword as dbResetPassword, requestEmailVerification, verifyEmailCode } from '@/lib/database';

// Public roles visible to users
export type PublicRole = 'client' | 'provider';

// Internal roles - NEVER exposed to public users
export type InternalRole = 'system' | 'core' | 'control' | 'ops';

// All roles (internal use only)
export type UserRole = PublicRole | InternalRole;

// Legacy compatibility - 'admin' maps to internal roles
const LEGACY_ADMIN_ROLE = 'admin';

// Check if a role is internal (elevated access)
export const isInternalRole = (role: string): boolean => {
  return ['system', 'core', 'control', 'ops', 'admin'].includes(role);
};

// Check if a role has full system authority
export const isSystemRole = (role: string): boolean => {
  return ['system', 'admin'].includes(role);
};

// Check if a role has operational access
export const hasOperationalAccess = (role: string): boolean => {
  return ['system', 'core', 'control', 'ops', 'admin'].includes(role);
};

// Get the effective internal role level (for access control)
export const getAccessLevel = (role: string): number => {
  switch (role) {
    case 'system': return 4;
    case 'admin': return 4; // Legacy compatibility
    case 'core': return 3;
    case 'control': return 2;
    case 'ops': return 1;
    case 'provider': return 0;
    case 'client': return 0;
    default: return -1;
  }
};

export interface GharunUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  emailVerified?: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: GharunUser | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string, role: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<GharunUser>) => void;
  // PRODUCTION: Password reset flow
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyResetOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  confirmPasswordReset: (email: string, resetToken: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  // PRODUCTION: Email verification
  sendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmEmailVerification: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithPhone: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  signOut: async () => {},
  updateUserProfile: () => {},
  forgotPassword: async () => ({ success: false }),
  verifyResetOtp: async () => ({ success: false }),
  confirmPasswordReset: async () => ({ success: false }),
  sendVerificationEmail: async () => ({ success: false }),
  confirmEmailVerification: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

// Map legacy 'admin' role to internal role
const resolveRole = (role: string): UserRole => {
  if (role === LEGACY_ADMIN_ROLE) return 'system';
  if (['system', 'core', 'control', 'ops', 'client', 'provider'].includes(role)) {
    return role as UserRole;
  }
  return 'client'; // Default fallback
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GharunUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildUserFromProfile = (profile: any, session: any): GharunUser => ({
    id: profile.id,
    name: profile.full_name,
    email: profile.email || session?.user?.email,
    phone: profile.phone || session?.user?.phone,
    role: resolveRole(profile.role),
    isVerified: profile.is_verified,
    emailVerified: profile.email_verified || false,
    avatarUrl: profile.avatar_url,
  });

  useEffect(() => {
  let mounted = true;

  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);

        if (!mounted) return;

        if (profile) {
          setUser(buildUserFromProfile(profile, session));
        } else {
          const metaRole = session.user.user_metadata?.role;
          const isInternalEmail = session.user.email?.endsWith('@gharunepal.com');
          const resolvedRole = metaRole ? resolveRole(metaRole) : (isInternalEmail ? 'system' : 'client');

          const newProfile = {
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            phone: session.user.phone,
            role: resolvedRole === 'system' ? 'admin' : resolvedRole,
          };

          await upsertProfile(newProfile);

          if (!mounted) return;

          setUser({
            id: session.user.id,
            name: newProfile.full_name,
            email: session.user.email,
            phone: session.user.phone,
            role: resolvedRole,
            isVerified: isInternalRole(resolvedRole),
            emailVerified: false,
          });
        }
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  initAuth();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!mounted) return;

    if (event === 'SIGNED_OUT') {
      setUser(null);
    } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      const profile = await fetchProfile(session.user.id);

      if (!mounted) return;

      if (profile) {
        setUser(buildUserFromProfile(profile, session));
      }
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+977${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+977${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token, type: 'sms' });
      if (error) return { success: false, error: error.message };
      if (data.user) return { success: true };
      return { success: false, error: 'Verification failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed' };
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && data.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile) {
          setUser(buildUserFromProfile(profile, data));
        }
        return { success: true };
      }

      // For @gharunepal.com emails, auto-bootstrap admin account
      if (email.endsWith('@gharunepal.com') && error) {
        const isInvalidLogin = error.message.includes('Invalid login') || error.message.includes('invalid') || error.message.includes('Invalid Refresh Token');

        if (isInvalidLogin) {
          const signupResult = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: email.split('@')[0] || 'Gharun Team', role: 'admin' } }
          });

          if (signupResult.error) {
            if (signupResult.error.message.includes('already registered') || signupResult.error.message.includes('already exists')) {
              return { success: false, error: 'Invalid credentials. Use "Forgot Password" to reset.' };
            }
            return { success: false, error: 'Access denied.' };
          }

          if (signupResult.data.user) {
            const adminName = email.split('@')[0] || 'Gharun Team';
            try {
              await upsertProfile({ id: signupResult.data.user.id, full_name: adminName, email, role: 'admin' });
            } catch {}

            if (signupResult.data.session) {
              setUser({ id: signupResult.data.user.id, name: adminName, email, role: 'system', isVerified: true, emailVerified: true });
              return { success: true };
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            const retryResult = await supabase.auth.signInWithPassword({ email, password });
            if (!retryResult.error && retryResult.data.user) {
              const profile = await fetchProfile(retryResult.data.user.id);
              if (profile) {
                setUser(buildUserFromProfile(profile, retryResult.data));
              } else {
                setUser({ id: retryResult.data.user.id, name: adminName, email, role: 'system', isVerified: true, emailVerified: true });
              }
              return { success: true };
            }

            return { success: false, error: 'Account created. Please check your email to confirm, then sign in again.' };
          }
        }
      }

      return { success: false, error: error?.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string, role: string) => {
    try {
      // SECURITY: Block internal role signup from public
      if (isInternalRole(role)) {
        return { success: false, error: 'Invalid role selection.' };
      }
      
      const safeRole: PublicRole = role === 'provider' ? 'provider' : 'client';
      
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, role: safeRole } }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await upsertProfile({ id: data.user.id, full_name: name, email, role: safeRole });
        setUser({
          id: data.user.id, name, email,
          role: safeRole,
          isVerified: false,
          emailVerified: false,
        });
        // PRODUCTION: Send welcome email (non-blocking)
        sendWelcomeEmail(email, name).catch(() => {});
        return { success: true };
      }
      return { success: false, error: 'Signup failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateUserProfile = useCallback((updates: Partial<GharunUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // ============ PRODUCTION: Password Reset Flow ============

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const result = await requestPasswordReset(email);
      return {
        success: true,
        message: result?.message || 'If an account exists, a reset code has been sent.',
      };
    } catch (err: any) {
      // Rate limit or other errors
      return { success: false, error: err.message || 'Failed to send reset code.' };
    }
  }, []);

  const verifyResetOtp = useCallback(async (email: string, code: string) => {
    try {
      const result = await verifyResetCode(email, code);
      if (result?.success && result?.resetToken) {
        return { success: true, resetToken: result.resetToken };
      }
      return { success: false, error: result?.message || 'Invalid code.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' };
    }
  }, []);

  const confirmPasswordReset = useCallback(async (email: string, resetToken: string, newPassword: string) => {
    try {
      const result = await dbResetPassword(email, resetToken, newPassword);
      if (result?.success) {
        return { success: true, message: result.message || 'Password reset successfully!' };
      }
      return { success: false, error: result?.message || 'Reset failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed.' };
    }
  }, []);

  // ============ PRODUCTION: Email Verification Flow ============

  const sendVerificationEmail = useCallback(async (email: string) => {
    try {
      const result = await requestEmailVerification(email);
      return { success: result?.success || false, error: result?.success ? undefined : 'Failed to send verification email.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send verification email.' };
    }
  }, []);

  const confirmEmailVerification = useCallback(async (email: string, code: string) => {
    try {
      const result = await verifyEmailCode(email, code);
      if (result?.verified) {
        // Update local user state
        setUser(prev => prev ? { ...prev, emailVerified: true } : null);
        return { success: true };
      }
      return { success: false, error: 'Verification failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, signInWithPhone, verifyOtp, signInWithEmail, signUpWithEmail, signOut, updateUserProfile,
      forgotPassword, verifyResetOtp, confirmPasswordReset,
      sendVerificationEmail, confirmEmailVerification,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
