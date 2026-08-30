import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserSettings } from '@/lib/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  settings: UserSettings | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const emptyProfile = (userId: string): Profile => ({
  id: '',
  user_id: userId,
  full_name: '',
  avatar_url: '',
  age: 0,
  gender: '',
  asthma: false,
  copd: false,
  heart_disease: false,
  allergies: false,
  pregnancy: false,
  sensitivity: 'moderate',
  emergency_name: '',
  emergency_phone: '',
});

const emptySettings = (userId: string): UserSettings => ({
  id: '',
  user_id: userId,
  theme: 'system',
  email_notifications: true,
  push_notifications: true,
  aqi_alerts: true,
  travel_alerts: true,
  language: 'en',
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    if (data) {
      setProfile(data as Profile);
    } else {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ user_id: uid })
        .select()
        .single();
      setProfile((created as Profile) || emptyProfile(uid));
    }
  };

  const loadSettings = async (uid: string) => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    if (data) {
      setSettings(data as UserSettings);
    } else {
      const { data: created } = await supabase
        .from('user_settings')
        .insert({ user_id: uid })
        .select()
        .single();
      setSettings((created as UserSettings) || emptySettings(uid));
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const refreshSettings = async () => {
    if (user) await loadSettings(user.id);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        Promise.all([loadProfile(data.session.user.id), loadSettings(data.session.user.id)]).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await Promise.all([loadProfile(newSession.user.id), loadSettings(newSession.user.id)]);
        } else {
          setProfile(null);
          setSettings(null);
        }
        if (mounted) setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({ user_id: data.user.id, full_name: fullName });
      await supabase.from('user_settings').insert({ user_id: data.user.id });
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
  },
});
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSettings(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? error.message : null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? error.message : null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        settings,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
