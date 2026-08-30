import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, TrendingUp, TrendingDown, Minus, Gauge, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AqiGauge } from '@/components/ui/AqiGauge';
import { PredictionChart } from '@/components/charts/Charts';
import { useAuth } from '@/context/AuthContext';
import { getCityAqi, generatePrediction, aqiColor, aqiLabel, aqiToPollutants } from '@/lib/aqi';
import { generateAdvisories } from '@/lib/advisory';
import { CheckCircle2, AlertTriangle, Wind, Heart, Home, Clock as ClockIcon, Leaf, Baby } from 'lucide-react';

const horizons = [
  { label: 'Current', hours: 0 },
  { label: '30 min', hours: 0.5 },
  { label: '1 hour', hours: 1 },
  { label: '3 hours', hours: 3 },
  { label: '6 hours', hours: 6 },
];

const advisoryIcons: Record<string, typeof Wind> = {
  check: CheckCircle2,
  info: Wind,
  wind: Wind,
  alert: AlertTriangle,
  shield: Home,
  mask: Wind,
  heart: Heart,
  lungs: Activity,
  baby: Baby,
  leaf: Leaf,
  home: Home,
  clock: ClockIcon,
};

export const PredictionPage = () => {
  const { profile } = useAuth();
  const [seed, setSeed] = useState(0);
  const [prediction, setPrediction] = useState(generatePrediction(100, 1));
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const s = Math.round(Date.now() / 3600000);
    setSeed(s);
    const baseAqi = getCityAqi('New Delhi', 28.61, 77.21);
    setPrediction(generatePrediction(baseAqi, s));
  }, []);

  const activePoint = prediction.points[activeIdx];
  const advisories = generateAdvisories(activePoint.aqi, profile);
  const chartData = prediction.points.map((p, i) => ({ time: i === 0 ? 'Now' : p.time, aqi: p.aqi, confidence: p.confidence }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>AI Prediction</h2>
        <p className="text-muted text-sm">ML-powered AQI forecasting with confidence scores and pollutant breakdowns</p>
      </div>

      {/* Horizon selector */}
      <div className="flex flex-wrap gap-2">
        {horizons.map((h, i) => (
          <button
            key={h.label}
            onClick={() => setActiveIdx(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeIdx === i
                ? 'brand-gradient text-white shadow-lg shadow-brand-500/20'
                : 'bg-[rgb(var(--surface))] border border-app text-soft hover:bg-[rgb(var(--surface-2))]'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main prediction card */}
        <Card title="Predicted AQI" subtitle={activeIdx === 0 ? 'Current reading' : `In ${horizons[activeIdx].label}`}>
          <div className="flex justify-center py-2">
            <AqiGauge aqi={activePoint.aqi} city="New Delhi" size="md" />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Gauge className="w-4 h-4 text-brand-500" />
            <span className="text-sm text-soft">Confidence: <strong style={{ color: 'rgb(var(--text))' }}>{activePoint.confidence}%</strong></span>
          </div>
        </Card>

        {/* Trend */}
        <Card title="Trend" subtitle="Next 6 hours">
          <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              prediction.trend === 'rising' ? 'bg-red-500/10' : prediction.trend === 'falling' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}>
              {prediction.trend === 'rising' ? <TrendingUp className="w-8 h-8 text-red-500" /> : prediction.trend === 'falling' ? <TrendingDown className="w-8 h-8 text-emerald-500" /> : <Minus className="w-8 h-8 text-amber-500" />}
            </div>
            <p className="text-lg font-semibold capitalize" style={{ color: 'rgb(var(--text))' }}>{prediction.trend}</p>
            <p className="text-sm text-muted text-center">
              {prediction.trend === 'rising' ? 'AQI is expected to increase. Take precautions.' : prediction.trend === 'falling' ? 'Air quality is improving. Good time for outdoor activity.' : 'Conditions are stable.'}
            </p>
          </div>
        </Card>

        {/* Confidence */}
        <Card title="Model Confidence" subtitle="Prediction reliability">
          <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
            <div className="relative w-24 h-24">
              <svg width="96" height="96" className="-rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" className="stroke-[rgb(var(--surface-2))]" />
                <motion.circle
                  cx="48" cy="48" r="40" fill="none" stroke="#14c8a8" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={251.3}
                  initial={{ strokeDashoffset: 251.3 }}
                  animate={{ strokeDashoffset: 251.3 * (1 - prediction.confidence / 100) }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: 'rgb(var(--text))' }}>{prediction.confidence}%</span>
              </div>
            </div>
            <p className="text-sm text-muted text-center">Average confidence across all horizons</p>
          </div>
        </Card>
      </div>

      {/* Prediction chart */}
      <Card title="Prediction Trend" subtitle="AQI forecast for the next 6 hours">
        <PredictionChart data={chartData} />
      </Card>

      {/* Pollutant levels */}
      <Card title="Pollutant Levels" subtitle={`Predicted for ${horizons[activeIdx].label}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(activePoint.pollutants).map(([key, value]) => {
            const label = key === 'pm25' ? 'PM2.5' : key === 'pm10' ? 'PM10' : key === 'no2' ? 'NO₂' : key === 'co' ? 'CO' : key === 'so2' ? 'SO₂' : 'Ozone';
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="bg-[rgb(var(--surface-2))] rounded-xl p-4 text-center"
              >
                <p className="text-xs text-muted mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text))' }}>{value}</p>
                <p className="text-[10px] text-muted">μg/m³</p>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Health advisories */}
      <Card title="Personalized Health Advisory" subtitle="Based on your health profile and predicted AQI">
        <div className="grid sm:grid-cols-2 gap-3">
          {advisories.map((a, i) => {
            const Icon = advisoryIcons[a.icon] || AlertTriangle;
            const color = a.severity === 'low' ? 'text-emerald-500' : a.severity === 'medium' ? 'text-amber-500' : a.severity === 'high' ? 'text-orange-500' : 'text-red-500';
            const bg = a.severity === 'low' ? 'bg-emerald-500/5' : a.severity === 'medium' ? 'bg-amber-500/5' : a.severity === 'high' ? 'bg-orange-500/5' : 'bg-red-500/5';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl ${bg} border border-app flex items-start gap-3`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
                <div>
                  <p className="font-medium text-sm" style={{ color: 'rgb(var(--text))' }}>{a.title}</p>
                  <p className="text-xs text-muted mt-0.5">{a.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
