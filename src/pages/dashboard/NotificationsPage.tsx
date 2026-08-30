import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, BellOff, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/lib/types';

const typeConfig = {
  info: { icon: Info, color: 'text-brand-500', bg: 'bg-brand-500/10' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  danger: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export const NotificationsPage = () => {
  const { notify } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications((data as AppNotification[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    notify('All notifications marked as read', 'success');
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((n) => n.filter((x) => x.id !== id));
    notify('Notification deleted', 'info');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Notifications</h2>
          <p className="text-muted text-sm">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-soft font-medium">No notifications yet</p>
            <p className="text-sm text-muted mt-1">AQI alerts and travel advisories will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--border))]">
            {notifications.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-3 p-4 hover:bg-[rgb(var(--surface-2))] transition-colors ${!n.read ? 'bg-brand-500/5' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm" style={{ color: 'rgb(var(--text))' }}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-soft mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface))] text-muted hover:text-brand-500 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface))] text-muted hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
