import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Wind, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface FormValues {
  fullName: string;
  email: string;
  password: string;
  agree: boolean;
}

export const Register = () => {
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const onGoogleSignUp = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleLoading(false);
      notify(error, 'error');
    }
  };

  const password = watch('password', '');

  const strength = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['#ef4444', '#ef4444', '#f59e0b', '#f59e0b', '#22c55e', '#22c55e'];

  const onSubmit = async (data: FormValues) => {
    if (!data.agree) {
      notify('Please accept the terms to continue', 'warning');
      return;
    }
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);
    if (error) {
      notify(error, 'error');
    } else {
      notify('Account created! Welcome to AirGuide.', 'success');
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-app flex">
      <div className="hidden lg:flex flex-1 bg-soft relative overflow-hidden border-r border-app">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-72 h-72 brand-gradient rounded-full blur-3xl animate-float-slow opacity-30" />
          <div className="absolute bottom-20 left-20 w-96 h-96 accent-500 rounded-full blur-3xl animate-float-slower opacity-20" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 brand-gradient rounded-xl flex items-center justify-center">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl brand-text">AirGuide</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4" style={{ color: 'rgb(var(--text))' }}>
            Join thousands<br />breathing easier.
          </h1>
          <p className="text-soft text-lg max-w-md mb-8">
            Create your free account and get personalized air quality insights in seconds.
          </p>
          <div className="space-y-3">
            {['Free forever — no credit card', 'Set up your health profile in 2 minutes', 'Get AI predictions and advisories'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-soft">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-brand-500" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl brand-text">AirGuide</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Create account</h2>
          <p className="text-muted mb-6">Start your journey to cleaner air</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              icon={<User className="w-4 h-4" />}
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-9 text-muted hover:text-soft transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{ background: i < strength ? strengthColors[strength] : 'rgb(var(--border))' }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted">{strengthLabels[strength]}</p>
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-soft cursor-pointer">
              <input type="checkbox" {...register('agree')} className="mt-0.5 accent-brand-500" />
              <span>I agree to the <a href="#" className="text-brand-500 hover:underline">Terms</a> and <a href="#" className="text-brand-500 hover:underline">Privacy Policy</a></span>
            </label>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-app text-muted">or sign up with</span>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={onGoogleSignUp}
            loading={googleLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
