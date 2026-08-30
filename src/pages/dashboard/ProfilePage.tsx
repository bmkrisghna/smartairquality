import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Heart, Activity, Upload, Save, Lock, Trash2, Camera } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface FormValues {
  full_name: string;
  age: number;
  gender: string;
  asthma: boolean;
  copd: boolean;
  heart_disease: boolean;
  allergies: boolean;
  pregnancy: boolean;
  sensitivity: string;
  emergency_name: string;
  emergency_phone: string;
}

export const ProfilePage = () => {
  const { notify } = useToast();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        age: profile.age || 0,
        gender: profile.gender || '',
        asthma: profile.asthma,
        copd: profile.copd,
        heart_disease: profile.heart_disease,
        allergies: profile.allergies,
        pregnancy: profile.pregnancy,
        sensitivity: profile.sensitivity,
        emergency_name: profile.emergency_name || '',
        emergency_phone: profile.emergency_phone || '',
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, reset]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      notify('Image must be under 2MB', 'warning');
      return;
    }
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) {
      notify('Upload failed: ' + upErr.message, 'error');
      return;
    }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(pub.publicUrl);
    await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('user_id', user.id);
    refreshProfile();
    notify('Profile photo updated', 'success');
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        age: Number(data.age) || 0,
        gender: data.gender,
        asthma: data.asthma,
        copd: data.copd,
        heart_disease: data.heart_disease,
        allergies: data.allergies,
        pregnancy: data.pregnancy,
        sensitivity: data.sensitivity,
        emergency_name: data.emergency_name,
        emergency_phone: data.emergency_phone,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      notify(error.message, 'error');
    } else {
      refreshProfile();
      notify('Profile saved successfully', 'success');
    }
  };

  const changePassword = async () => {
    if (newPwd.length < 6) { notify('Password must be at least 6 characters', 'warning'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) { notify(error.message, 'error'); return; }
    notify('Password updated', 'success');
    setShowPwdChange(false);
    setNewPwd('');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await supabase.from('profiles').delete().eq('user_id', user.id);
    await supabase.from('user_settings').delete().eq('user_id', user.id);
    const { error } = await supabase.auth.admin?.deleteUser(user.id) || {};
    if (error) {
      notify('Account deletion requires admin access. Please contact support.', 'warning');
    } else {
      notify('Account deleted', 'info');
      signOut();
    }
  };

  const conditions = [
    { key: 'asthma' as const, label: 'Asthma' },
    { key: 'copd' as const, label: 'COPD' },
    { key: 'heart_disease' as const, label: 'Heart Disease' },
    { key: 'allergies' as const, label: 'Allergies' },
    { key: 'pregnancy' as const, label: 'Pregnancy' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Profile</h2>
        <p className="text-muted text-sm">Manage your personal and health information</p>
      </div>

      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[rgb(var(--surface-2))] border border-app flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 brand-gradient rounded-full flex items-center justify-center cursor-pointer shadow-lg">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-semibold text-lg" style={{ color: 'rgb(var(--text))' }}>{profile?.full_name || 'User'}</p>
            <p className="text-sm text-muted">{user?.email}</p>
            <p className="text-xs text-muted mt-1">Click the camera icon to upload a photo</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal info */}
        <Card title="Personal Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" icon={<User className="w-4 h-4" />} error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Email" value={user?.email || ''} disabled icon={<Mail className="w-4 h-4" />} />
            <Input label="Age" type="number" error={errors.age?.message} {...register('age', { valueAsNumber: true })} />
            <Select label="Gender" {...register('gender')}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not">Prefer not to say</option>
            </Select>
          </div>
        </Card>

        {/* Health profile */}
        <Card title="Health Profile" subtitle="Used to generate personalized advisories">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2 text-soft">Pre-existing conditions</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {conditions.map((c) => (
                  <label key={c.key} className="flex items-center gap-2.5 p-3 rounded-xl bg-[rgb(var(--surface-2))] cursor-pointer hover:border-brand-500 border border-transparent transition-colors">
                    <input type="checkbox" {...register(c.key)} className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm text-soft">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-soft">Sensitivity level</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'moderate', 'high', 'extreme'] as const).map((s) => (
                  <label key={s} className="flex items-center justify-center p-2.5 rounded-xl bg-[rgb(var(--surface-2))] cursor-pointer capitalize text-sm border border-transparent has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/5 transition-colors">
                    <input type="radio" value={s} {...register('sensitivity')} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency contact */}
        <Card title="Emergency Contact">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Contact Name" icon={<User className="w-4 h-4" />} {...register('emergency_name')} />
            <Input label="Contact Phone" icon={<Phone className="w-4 h-4" />} {...register('emergency_phone')} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Password change */}
      <Card title="Security">
        {!showPwdChange ? (
          <Button variant="outline" onClick={() => setShowPwdChange(true)}>
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={changePassword}>Update Password</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowPwdChange(false); setNewPwd(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete account */}
      <Card title="Danger Zone">
        {!showDelete ? (
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-soft">Are you sure? This will permanently delete your account and all associated data. This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={deleteAccount}>Yes, delete my account</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
