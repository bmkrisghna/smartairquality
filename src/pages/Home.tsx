import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wind, MapPin, Brain, Route, Bell, Shield, Activity, BarChart3,
  ArrowRight, Check, Sparkles, TrendingUp, Heart, Eye,
  Smartphone, Globe, Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { AqiGauge } from '@/components/ui/AqiGauge';
import { useAuth } from '@/context/AuthContext';
import { getCityAqi, aqiColor, aqiLabel } from '@/lib/aqi';

const features = [
  { icon: MapPin, title: 'Live AQI Map', desc: 'Real-time air quality monitoring with interactive heatmap and pollution hotspots across major cities.' },
  { icon: Brain, title: 'AI Predictions', desc: 'ML-powered AQI forecasting up to 6 hours ahead with confidence scores and pollutant breakdowns.' },
  { icon: Route, title: 'Healthier Routes', desc: 'Plan travel with pollution exposure estimates and recommendations for the safest departure time.' },
  { icon: Heart, title: 'Health Advisory', desc: 'Personalized recommendations based on your health profile — asthma, COPD, allergies, and more.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Get notified when air quality changes in your area or when travel conditions become risky.' },
  { icon: BarChart3, title: 'Detailed Reports', desc: 'Downloadable PDF reports covering AQI history, exposure, and health summaries.' },
];

const steps = [
  { icon: Smartphone, title: 'Create your profile', desc: 'Sign up and set up your health profile in under two minutes.' },
  { icon: Activity, title: 'Get your AQI', desc: 'See real-time air quality for your location with AI-powered predictions.' },
  { icon: Shield, title: 'Stay protected', desc: 'Receive personalized advisories and healthier route recommendations.' },
];

const benefits = [
  'Reduce pollution exposure by up to 40%',
  'Plan outdoor activities at the safest times',
  'Protect sensitive family members',
  'Make data-driven travel decisions',
  'Track air quality trends over time',
  'Get alerts before conditions worsen',
];

const cities = [
  { name: 'New Delhi', lat: 28.61, lng: 77.21 },
  { name: 'Mumbai', lat: 19.08, lng: 72.88 },
  { name: 'Bengaluru', lat: 12.97, lng: 77.59 },
  { name: 'Chennai', lat: 13.08, lng: 80.27 },
];

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveAqi, setLiveAqi] = useState(0);
  const [city, setCity] = useState(cities[0]);

  useEffect(() => {
    setLiveAqi(getCityAqi(city.name, city.lat, city.lng));
    const id = setInterval(() => {
      setLiveAqi((a) => Math.max(10, Math.min(300, a + Math.round((Math.random() - 0.5) * 10))));
    }, 5000);
    return () => clearInterval(id);
  }, [city]);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 brand-gradient rounded-full blur-3xl opacity-20 animate-float-slow" />
          <div className="absolute top-40 right-10 w-96 h-96 accent-500 rounded-full blur-3xl opacity-15 animate-float-slower" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 brand-400 rounded-full blur-3xl opacity-10 animate-float-slow" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-app text-sm text-soft mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              AI-Powered Air Quality Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6" style={{ color: 'rgb(var(--text))' }}>
              Know your air.<br />
              <span className="brand-text">Protect your health.</span>
            </h1>
            <p className="text-lg text-soft mb-8 max-w-lg">
              Real-time AQI monitoring, AI predictions up to 6 hours ahead, and personalized health advisories — all in one beautiful platform.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <Button size="lg" onClick={() => navigate('/app')}>
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/register')}>
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> No credit card</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Free forever</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2-min setup</div>
            </div>
          </motion.div>

          {/* Live AQI Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-strong rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted">Live Air Quality</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  <select
                    value={city.name}
                    onChange={(e) => {
                      const c = cities.find((x) => x.name === e.target.value);
                      if (c) setCity(c);
                    }}
                    className="bg-transparent font-semibold text-lg focus:outline-none cursor-pointer"
                    style={{ color: 'rgb(var(--text))' }}
                  >
                    {cities.map((c) => <option key={c.name} value={c.name} className="bg-[rgb(var(--surface))]">{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="flex justify-center py-4">
              <AqiGauge aqi={liveAqi} city={city.name} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'PM2.5', value: Math.round(liveAqi * 0.45) },
                { label: 'PM10', value: Math.round(liveAqi * 0.7) },
                { label: 'NO₂', value: Math.round(liveAqi * 0.3) },
              ].map((p) => (
                <div key={p.label} className="bg-[rgb(var(--surface-2))] rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">{p.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'rgb(var(--text))' }}>{p.value}</p>
                  <p className="text-[10px] text-muted">μg/m³</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-brand-500 font-semibold text-sm mb-2">FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text))' }}>Everything you need to breathe safe</h2>
            <p className="text-soft">Comprehensive tools to monitor, predict, and act on air quality data.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'rgb(var(--text))' }}>{f.title}</h3>
                  <p className="text-sm text-soft">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-brand-500 font-semibold text-sm mb-2">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text))' }}>Get started in 3 simple steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="card p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm text-brand-500 font-bold mb-2">STEP {i + 1}</div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'rgb(var(--text))' }}>{s.title}</h3>
                    <p className="text-sm text-soft">{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[rgb(var(--surface))] border border-app items-center justify-center text-xs text-muted flex">
                      →
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-500 font-semibold text-sm mb-2">BENEFITS</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--text))' }}>Why thousands trust AirGuide</h2>
            <p className="text-soft mb-6">From daily commuters to sensitive individuals, AirGuide helps everyone make smarter decisions about the air they breathe.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-sm text-soft">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: TrendingUp, label: 'Predictions', value: '6h', sub: 'ahead' },
              { icon: Globe, label: 'Cities', value: '16+', sub: 'monitored' },
              { icon: Zap, label: 'Updates', value: '5s', sub: 'live refresh' },
              { icon: Eye, label: 'Pollutants', value: '6', sub: 'tracked' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-5 text-center">
                  <Icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold brand-text">{s.value}</p>
                  <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>{s.label}</p>
                  <p className="text-xs text-muted">{s.sub}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="brand-gradient rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Wind className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start breathing smarter today</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Join AirGuide for free and get personalized air quality insights in seconds.</p>
              {user ? (
                <Button size="lg" variant="secondary" onClick={() => navigate('/app')}>
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
