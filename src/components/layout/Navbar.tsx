import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Menu, X, LayoutDashboard, LogIn, UserPlus, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

interface Props {
  onNavigate?: () => void;
}

export const Navbar = ({ onNavigate }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
    onNavigate?.();
  };

  const links = [
    { label: 'Features', path: '/#features' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Benefits', path: '/#benefits' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 glass-strong">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg brand-text hidden sm:block">AirGuide</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => handleNav(l.path)}
              className="px-3 py-2 text-sm text-soft hover:text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--surface-2))] transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate('/app/notifications')}
                className="relative p-2 rounded-lg hover:bg-[rgb(var(--surface-2))] transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" style={{ color: 'rgb(var(--text-soft))' }} />
              </button>
              <Button size="sm" onClick={() => navigate('/app')}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button size="sm" variant="outline" onClick={() => signOut()}>
                <LogIn className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                <LogIn className="w-4 h-4" />
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                <UserPlus className="w-4 h-4" />
                Register
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-[rgb(var(--surface-2))] transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-app overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => handleNav(l.path)}
                  className="block w-full text-left px-3 py-2 text-sm text-soft hover:text-[rgb(var(--text))] rounded-lg hover:bg-[rgb(var(--surface-2))] transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <div className="pt-2 border-t border-app space-y-2">
                {user ? (
                  <>
                    <Button size="sm" fullWidth onClick={() => { handleNav('/app'); }}>
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                    <Button size="sm" variant="outline" fullWidth onClick={() => { signOut(); navigate('/'); }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" fullWidth onClick={() => handleNav('/login')}>
                      Login
                    </Button>
                    <Button size="sm" fullWidth onClick={() => handleNav('/register')}>
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
