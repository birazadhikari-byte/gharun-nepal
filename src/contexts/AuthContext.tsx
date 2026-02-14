import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { supabase } from '@/lib/supabase';

import {
  fetchProfile,
  upsertProfile,
  sendWelcomeEmail,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  requestEmailVerification,
  verifyEmailCode,
} from '@/lib/database';

/* =====================================================
   TYPES
===================================================== */

export type PublicRole = 'client' | 'provider';

export interface GharunUser {
  id: string;
  name?: string;
  email?: string;
  role?: PublicRole;
}

interface AuthContextType {
  user: GharunUser | null;
  loading: boolean;

  signOut: () => Promise<void>;

  requestPasswordReset: (email: string) => Promise<any>;
  verifyResetCode: (email: string, code: string) => Promise<any>;
  confirmPasswordReset: (
    email: string,
    resetToken: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;

  requestEmailVerification: (email: string) => Promise<any>;
  verifyEmailCode: (email: string, code: string) => Promise<any>;
}

/* =====================================================
   CONTEXT
===================================================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};

/* =====================================================
   PROVIDER
===================================================== */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<GharunUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD SESSION + PROFILE
  ===================================================== */

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name,
          role: profile?.role || 'client',
        });
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name,
            role: profile?.role || 'client',
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     SIGN OUT
  ===================================================== */

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  /* =====================================================
     PASSWORD RESET FLOW
  ===================================================== */

  const handleRequestPasswordReset = useCallback(async (email: string) => {
    return await requestPasswordReset(email);
  }, []);

  const handleVerifyResetCode = useCallback(
    async (email: string, code: string) => {
      return await verifyResetCode(email, code);
    },
    []
  );

  const confirmPasswordReset = useCallback(
    async (email: string, resetToken: string, newPassword: string) => {
      try {
        const result = await resetPassword(email, resetToken, newPassword);

        if (result?.success) {
          return { success: true };
        }

        return { success: false, error: 'Reset failed.' };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Password reset failed.',
        };
      }
    },
    []
  );

  /* =====================================================
     EMAIL VERIFICATION
  ===================================================== */

  const handleRequestEmailVerification = useCallback(async (email: string) => {
    return await requestEmailVerification(email);
  }, []);

  const handleVerifyEmailCode = useCallback(
    async (email: string, code: string) => {
      return await verifyEmailCode(email, code);
    },
    []
  );

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value: AuthContextType = {
    user,
    loading,
    signOut,

    requestPasswordReset: handleRequestPasswordReset,
    verifyResetCode: handleVerifyResetCode,
    confirmPasswordReset,

    requestEmailVerification: handleRequestEmailVerification,
    verifyEmailCode: handleVerifyEmailCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};