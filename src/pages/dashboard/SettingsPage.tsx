import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Moon, Monitor, Bell, Mail, Globe, Shield, Lock,
  CheckCircle2, AlertTriangle, Info,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import type { UserSettings } from '@/lib/types';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
];

const themeOptions = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

export const SettingsPage = () => {
  const { notify } = useToast();
  const { user, settings, refreshSettings } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<UserSettings | null>(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const updateSetting = async (field: keyof UserSettings, value: string | boolean) => {
    if (!user || !local) return;
    setLocal({ ...local, [field]: value });
    setSaving(true);
    const { error } = await supabase
      .from('user_settings')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      notify(error.message, 'error');
    } else {
      refreshSettings();
      notify('Setting updated', 'success');
    }
  };

  const toggleSwitch = (checked: boolean, field: keyof UserSettings) => (
    <button
      onClick={() => updateSetting(field, !checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-[rgb(var(--border))]'}`}
    >
      <motion.span
        layout
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md ${checked ? 'left-[22px]' : 'left-0.5'}`}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  if (!local) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Settings</h2>
        <p className="text-muted text-sm">Customize your experience and preferences</p>
      </div>

      {/* Appearance */}
      <Card title="Appearance" subtitle="Choose how AirGuide looks">
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  updateSetting('theme', opt.value);
                }}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  active ? 'border-brand-500 bg-brand-500/5' : 'border-app hover:border-[rgb(var(--text-muted))]'
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? 'text-brand-500' : 'text-muted'}`} />
                <span className={`text-sm font-medium ${active ? 'text-brand-500' : 'text-soft'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notifications" subtitle="Manage how you receive alerts">
        <div className="space-y-1">
          {[
            { key: 'email_notifications' as const, label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
            { key: 'push_notifications' as const, label: 'Push Notifications', desc: 'Browser push notifications', icon: Bell },
            { key: 'aqi_alerts' as const, label: 'AQI Alerts', desc: 'Alert when air quality changes significantly', icon: AlertTriangle },
            { key: 'travel_alerts' as const, label: 'Travel Alerts', desc: 'Alert when travel conditions worsen', icon: Info },
          ].map((item) => {
            const Icon = item.icon;
            const checked = local[item.key] as boolean;
            return (
              <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgb(var(--surface-2))] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--surface-2))] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-soft" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                {toggleSwitch(checked, item.key)}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Language */}
      <Card title="Language" subtitle="Select your preferred language">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {languages.map((lang) => {
            const active = local.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => updateSetting('language', lang.code)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                  active ? 'border-brand-500 bg-brand-500/5' : 'border-app hover:border-[rgb(var(--text-muted))]'
                }`}
              >
                <Globe className={`w-4 h-4 ${active ? 'text-brand-500' : 'text-muted'}`} />
                <span className={`text-sm ${active ? 'text-brand-500 font-medium' : 'text-soft'}`}>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Privacy */}
      <Card title="Privacy" subtitle="Your data and privacy">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgb(var(--surface-2))]">
            <Lock className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>Data Encryption</p>
              <p className="text-xs text-muted">Your data is encrypted in transit and at rest.</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgb(var(--surface-2))]">
            <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>No Third-Party Sharing</p>
              <p className="text-xs text-muted">We never share your health data with third parties.</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgb(var(--surface-2))]">
            <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>Account Deletion</p>
              <p className="text-xs text-muted">Delete your account anytime from the Profile page.</p>
            </div>
          </div>
        </div>
      </Card>

      {saving && (
        <p className="text-xs text-muted text-center">Saving...</p>
      )}
    </div>
  );
};
