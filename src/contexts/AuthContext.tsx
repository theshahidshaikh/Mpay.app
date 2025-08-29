import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthUser extends User {
  role: string;
  full_name: string;
  city?: string;
  email?: string;
  state?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("1. AuthProvider useEffect fired. Setting up listener...");
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("2. Initial session fetched.", session);
      setSession(session);
       if (session) {
        console.log("--- DEBUG: COPY THIS TOKEN ---");
        console.log(session.access_token);
        console.log("--- END DEBUG ---");
      }
      if (session?.user) {
        console.log("3. Initial user found. Fetching profile...");
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`4. onAuthStateChange fired. Event: ${event}`);
        setSession(session);
        if (session?.user) {
          console.log("5. User session changed. Fetching profile...");
          fetchUserProfile(session.user.id);
        } else {
          console.log("5b. No user session. Clearing user.");
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log("AuthProvider unmounting. Unsubscribing.");
      subscription.unsubscribe();
    }
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log("6. Inside fetchUserProfile for user:", userId);
    try {
      // 1. Check for an admin profile first
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('role, full_name, city, state')
        .eq('id', userId)
        .single();

      if (adminProfile) {
        console.log("7b. Admin profile found:", adminProfile);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser({ ...authUser, ...adminProfile } as AuthUser);
        return; // Found admin, so we are done
      }

      // If the error is anything other than "not found", it's a real problem.
      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }
      console.log("7c. No admin profile found. Checking regular 'profiles' table...");

      // 2. If not an admin, check the regular profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, city, state') // Added state
        .eq('id', userId)
        .single();

      if (error) throw error;

      console.log("8. Regular profile found:", data);
      const { data: { user: authUserForProfile } } = await supabase.auth.getUser();
      setUser({ ...authUserForProfile, ...data } as AuthUser);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic user if profile not found
      const { data: { user: fallbackUser } } = await supabase.auth.getUser();
      if (fallbackUser) setUser(fallbackUser as AuthUser);
    } finally {
      console.log("9. fetchUserProfile finished. Setting loading to false.");
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('User creation failed');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          role: userData.role,
          full_name: userData.full_name,
          phone: userData.phone,
        });

      if (profileError) throw profileError;

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error creating account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
