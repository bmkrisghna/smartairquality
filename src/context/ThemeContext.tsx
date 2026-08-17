import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { settings, user, refreshSettings } = useAuth();
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>(getSystemTheme());

  // Load theme from settings or localStorage
  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || 'system';
    setThemeState(settings?.theme || stored);
  }, [settings?.theme]);

  // Apply theme
  useEffect(() => {
    const r = theme === 'system' ? getSystemTheme() : theme;
    setResolved(r);
    document.documentElement.classList.toggle('dark', r === 'dark');
  }, [theme]);

  // Watch system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        const r = getSystemTheme();
        setResolved(r);
        document.documentElement.classList.toggle('dark', r === 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    if (user && settings) {
      supabaseUpdate(t);
    }
  };

  const supabaseUpdate = async (t: Theme) => {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase
      .from('user_settings')
      .update({ theme: t, updated_at: new Date().toISOString() })
      .eq('user_id', user!.id)
      .select()
      .single();
    if (data) refreshSettings();
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
