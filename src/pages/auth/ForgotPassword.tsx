import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Wind, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      notify(error, 'error');
    } else {
      setSent(true);
      notify('Password reset link sent to your email', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl brand-text">AirGuide</span>
        </Link>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'rgb(var(--text))' }}>Check your email</h2>
            <p className="text-muted mb-6">We sent a password reset link to <strong style={{ color: 'rgb(var(--text))' }}>{email}</strong></p>
            <Link to="/login">
              <Button variant="outline" fullWidth>
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Forgot password?</h2>
            <p className="text-muted mb-6">Enter your email and we'll send you a reset link</p>
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
            <Link to="/login" className="block text-center text-sm text-muted mt-6 hover:text-brand-500 transition-colors">
              ← Back to login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
