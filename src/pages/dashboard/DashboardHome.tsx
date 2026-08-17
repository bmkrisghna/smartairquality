import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Brain, Route, Bell, TrendingUp, Activity, Wind,
  ArrowRight, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AqiGauge } from '@/components/ui/AqiGauge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { HourlyChart, DailyChart } from '@/components/charts/Charts';
import { AqiCanvas } from '@/components/AqiCanvas';
import { useAuth } from '@/context/AuthContext';
import { getCityAqi, generateHourlySeries, generateHistoricalSeries, aqiLabel, aqiColor, aqiCategory } from '@/lib/aqi';
import { generateAdvisories } from '@/lib/advisory';

export const DashboardHome = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [aqi, setAqi] = useState(0);
  const [hourly, setHourly] = useState<{ hour: string; aqi: number }[]>([]);
  const [daily, setDaily] = useState<{ date: string; aqi: number }[]>([]);

  useEffect(() => {
    const seed = Math.round(Date.now() / 86400000);
    const a = getCityAqi('New Delhi', 28.61, 77.21);
    setAqi(a);
    setHourly(generateHourlySeries(seed));
    setDaily(generateHistoricalSeries(30, seed));
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const advisories = generateAdvisories(aqi, profile);
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const quickActions = [
    { icon: MapPin, label: 'View Map', path: '/app/map', color: 'text-brand-500' },
    { icon: Brain, label: 'Predictions', path: '/app/prediction', color: 'text-accent-500' },
    { icon: Route, label: 'Plan Travel', path: '/app/travel', color: 'text-amber-500' },
    { icon: Activity, label: 'Reports', path: '/app/reports', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text))' }}>Welcome back, {firstName}!</h2>
          <p className="text-muted text-sm mt-1">Here's your air quality overview for today</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-app">
          <Clock className="w-4 h-4 text-brand-500" />
          <span className="text-sm text-soft">{new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* Animated AQI hero banner */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AqiCanvas aqi={aqi} city="New Delhi" className="h-64 sm:h-72" />
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(a.path)}
              className="card p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgb(var(--surface-2))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ color: 'rgb(var(--text))' }}>{a.label}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* AQI Gauge */}
        {loading ? <CardSkeleton /> : (
          <Card title="Current AQI" subtitle="New Delhi">
            <div className="flex justify-center py-2">
              <AqiGauge aqi={aqi} city="New Delhi" size="md" />
            </div>
          </Card>
        )}

        {/* Health Advisory preview */}
        {loading ? <CardSkeleton /> : (
          <Card title="Health Advisory" subtitle="Based on your profile" className="lg:col-span-2">
            <div className="space-y-2.5">
              {advisories.slice(0, 4).map((a, i) => {
                const Icon = a.severity === 'low' ? CheckCircle2 : a.severity === 'critical' ? AlertTriangle : Activity;
                const color = a.severity === 'low' ? 'text-emerald-500' : a.severity === 'medium' ? 'text-amber-500' : a.severity === 'high' ? 'text-orange-500' : 'text-red-500';
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'rgb(var(--text))' }}>{a.title}</p>
                      <p className="text-xs text-muted mt-0.5">{a.description}</p>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => navigate('/app/prediction')} className="text-sm text-brand-500 hover:underline flex items-center gap-1 pt-1">
                View all advisories <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card title="24-Hour Trend" subtitle="Hourly AQI readings">
              <HourlyChart data={hourly} />
            </Card>
            <Card title="30-Day History" subtitle="Daily average AQI">
              <DailyChart data={daily} />
            </Card>
          </>
        )}
      </div>

      {/* Pollutant breakdown */}
      {loading ? <CardSkeleton /> : (
        <Card title="Pollutant Levels" subtitle="Current readings">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'PM2.5', value: Math.round(aqi * 0.45), unit: 'μg/m³', max: 60 },
              { label: 'PM10', value: Math.round(aqi * 0.7), unit: 'μg/m³', max: 100 },
              { label: 'NO₂', value: Math.round(aqi * 0.3), unit: 'ppb', max: 100 },
              { label: 'CO', value: (aqi * 0.012).toFixed(1), unit: 'ppm', max: 10 },
              { label: 'SO₂', value: Math.round(aqi * 0.15), unit: 'ppb', max: 50 },
              { label: 'Ozone', value: Math.round(aqi * 0.4), unit: 'ppb', max: 100 },
            ].map((p) => {
              const pct = Math.min((Number(p.value) / p.max) * 100, 100);
              const color = pct < 33 ? '#22c55e' : pct < 66 ? '#f59e0b' : '#ef4444';
              return (
                <div key={p.label} className="bg-[rgb(var(--surface-2))] rounded-xl p-3">
                  <p className="text-xs text-muted">{p.label}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: 'rgb(var(--text))' }}>{p.value}</p>
                  <p className="text-[10px] text-muted mb-2">{p.unit}</p>
                  <div className="h-1.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
