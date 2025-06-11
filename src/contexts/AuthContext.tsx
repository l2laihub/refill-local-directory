import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  login: (email_param: string, password_param: string) => Promise<void>;
  signup: (email_param: string, password_param: string, referralCode?: string) => Promise<void>; // Added referralCode
  logout: () => Promise<void>;
  // TODO: Add methods for password reset, social login, etc.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false); // Ensure loading is false after auth state change
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email_param: string, password_param: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email_param, password: password_param });
    if (error) throw error;
    // Session state will be updated by onAuthStateChange listener
    // setIsLoading(false); // Handled by listener
  };

  const signup = async (email_param: string, password_param: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      // Note: supabase.auth.signUp now returns { data: { user, session, ... }, error }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email_param,
        password: password_param,
      });

      if (signUpError) throw signUpError;

      // Access user from the data object
      const newUser = data.user;

      if (newUser && referralCode) {
        // Call the stored procedure to process the referral
        // This happens after successful user creation in auth.users table.
        // The trigger on auth.users should assign a referral code to the new user first.
        const { error: rpcError } = await supabase.rpc('process_signup_referral', {
          p_referred_user_id: newUser.id,
          p_referral_code_input: referralCode,
        });

        if (rpcError) {
          // Log the error but don't necessarily fail the whole signup
          // as the user is already created. This could be a non-critical error.
          console.error('Error processing referral code:', rpcError);
        }
      }
      // Session state will be updated by onAuthStateChange listener
      // User will need to confirm email
    } finally {
      // Ensure isLoading is reset, especially if an error occurs before onAuthStateChange fires.
      // The onAuthStateChange listener also sets isLoading to false.
      // This ensures it's reset even if the signup flow errors out early.
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Session state will be updated by onAuthStateChange listener
    // setIsLoading(false); // Handled by listener
  };
  
  const value = {
    session,
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};