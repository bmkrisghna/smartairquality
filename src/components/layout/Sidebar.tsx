import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, Brain, Route, FileText, Bell, User, Settings,
  LogOut, ChevronLeft, ChevronRight, Wind, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menu = [
  { label: 'Home', path: '/app', icon: Home, end: true },
  { label: 'Map', path: '/app/map', icon: Map },
  { label: 'Prediction', path: '/app/prediction', icon: Brain },
  { label: 'Travel Planner', path: '/app/travel', icon: Route },
  { label: 'Reports', path: '/app/reports', icon: FileText },
  { label: 'Notifications', path: '/app/notifications', icon: Bell },
  { label: 'Profile', path: '/app/profile', icon: User },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: Props) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const width = collapsed ? 'w-20' : 'w-64';

  const content = (
    <>
      {/* Logo */}
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-5'} border-b border-app`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
            <Wind className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg brand-text">AirGuide</span>}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'brand-gradient text-white shadow-lg shadow-brand-500/20'
                    : 'text-soft hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-2))]'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 rounded-md glass-strong text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-app p-3 space-y-2">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-[rgb(var(--surface-2))] border border-app flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-muted" />
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'rgb(var(--text))' }}>{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted truncate">View profile</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col ${width} bg-[rgb(var(--surface))] border-r border-app fixed left-0 top-0 bottom-0 z-30 transition-all duration-300`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full brand-gradient text-white flex items-center justify-center shadow-lg z-40"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        {content}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-[rgb(var(--surface))] border-r border-app z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-[rgb(var(--surface-2))]"
              >
                <X className="w-5 h-5" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
