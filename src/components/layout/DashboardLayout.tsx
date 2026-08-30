import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();

  const titles: Record<string, string> = {
    '/app': 'Dashboard',
    '/app/map': 'Air Quality Map',
    '/app/prediction': 'AI Prediction',
    '/app/travel': 'Travel Planner',
    '/app/reports': 'Reports',
    '/app/notifications': 'Notifications',
    '/app/profile': 'Profile',
    '/app/settings': 'Settings',
  };

  const title = titles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-app">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Top bar */}
        <header className="h-16 glass-strong border-b border-app sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-[rgb(var(--surface-2))]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/notifications"
              className="relative p-2 rounded-lg hover:bg-[rgb(var(--surface-2))] transition-colors"
            >
              <Bell className="w-5 h-5 text-soft" />
            </Link>
            <Link to="/app/profile" className="w-9 h-9 rounded-full bg-[rgb(var(--surface-2))] border border-app flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-soft">
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};
