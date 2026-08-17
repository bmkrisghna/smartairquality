import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Wind, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) { notify('Password must be at least 6 characters', 'warning'); return; }
    if (pwd !== confirm) { notify('Passwords do not match', 'error'); return; }
    setLoading(true);
    const { error } = await updatePassword(pwd);
    setLoading(false);
    if (error) {
      notify(error, 'error');
    } else {
      notify('Password updated successfully', 'success');
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl brand-text">AirGuide</span>
        </Link>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Set new password</h2>
          <p className="text-muted mb-6">Enter your new password below</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-9 text-muted hover:text-soft">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label="Confirm Password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Update Password
            </Button>
          </form>
          <Link to="/login" className="block text-center text-sm text-muted mt-6 hover:text-brand-500 transition-colors">
            ← Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
