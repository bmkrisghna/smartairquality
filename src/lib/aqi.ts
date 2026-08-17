import type { AqiCategory, Pollutants } from '@/lib/types';

export interface PredictionPoint {
  time: string;
  aqi: number;
  confidence: number;
  pollutants: Pollutants;
}

export interface PredictionResult {
  points: PredictionPoint[];
  currentAqi: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
}

const seedRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const aqiCategory = (aqi: number): AqiCategory => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

export const aqiColor = (aqi: number): string => {
  const c = aqiCategory(aqi);
  switch (c) {
    case 'good': return '#22c55e';
    case 'moderate': return '#84cc16';
    case 'unhealthy-sensitive': return '#f59e0b';
    case 'unhealthy': return '#f97316';
    case 'very-unhealthy': return '#ef4444';
    case 'hazardous': return '#a21caf';
  }
};

export const aqiLabel = (aqi: number): string => {
  const c = aqiCategory(aqi);
  switch (c) {
    case 'good': return 'Good';
    case 'moderate': return 'Moderate';
    case 'unhealthy-sensitive': return 'Unhealthy for Sensitive';
    case 'unhealthy': return 'Unhealthy';
    case 'very-unhealthy': return 'Very Unhealthy';
    case 'hazardous': return 'Hazardous';
  }
};

export const aqiDescription = (aqi: number): string => {
  const c = aqiCategory(aqi);
  switch (c) {
    case 'good': return 'Air quality is satisfactory and poses little or no risk.';
    case 'moderate': return 'Acceptable, but unusually sensitive people should limit prolonged exertion.';
    case 'unhealthy-sensitive': return 'Sensitive groups may experience health effects. The general public is less likely to be affected.';
    case 'unhealthy': return 'Everyone may begin to experience health effects; sensitive groups face more serious effects.';
    case 'very-unhealthy': return 'Health alert: everyone may experience more serious health effects.';
    case 'hazardous': return 'Emergency conditions. The entire population is more likely to be affected.';
  }
};

export const aqiToPollutants = (aqi: number, seed: number): Pollutants => {
  const rand = seedRand(seed);
  const factor = aqi / 100;
  return {
    pm25: clamp(Math.round(aqi * 0.45 + rand() * 12), 0, 600),
    pm10: clamp(Math.round(aqi * 0.7 + rand() * 20), 0, 600),
    no2: clamp(Math.round(40 * factor + rand() * 10), 0, 200),
    co: clamp(Math.round(1.2 * factor + rand() * 0.4), 0, 30),
    so2: clamp(Math.round(15 * factor + rand() * 5), 0, 100),
    o3: clamp(Math.round(50 * factor + rand() * 15), 0, 200),
  };
};

export const pollutantsToAqi = (p: Pollutants): number => {
  const pm25Sub = p.pm25 <= 12 ? p.pm25 * 4.16 : p.pm25 <= 35.4 ? 50 + (p.pm25 - 12) * 2.1 : p.pm25 <= 55.4 ? 100 + (p.pm25 - 35.4) * 2.45 : 150 + (p.pm25 - 55.4) * 3.2;
  const pm10Sub = p.pm10 <= 54 ? p.pm10 * 0.93 : p.pm10 <= 154 ? 50 + (p.pm10 - 54) * 0.5 : 100 + (p.pm10 - 154) * 0.96;
  const no2Sub = p.no2 <= 53 ? p.no2 * 0.94 : p.no2 <= 100 ? 50 + (p.no2 - 53) * 1.06 : 100 + (p.no2 - 100) * 1.5;
  const coSub = p.co <= 4.4 ? p.co * 11.36 : p.co <= 9.4 ? 50 + (p.co - 4.4) * 10 : 100 + (p.co - 9.4) * 20;
  const so2Sub = p.so2 <= 35 ? p.so2 * 1.43 : p.so2 <= 75 ? 50 + (p.so2 - 35) * 1.25 : 100 + (p.so2 - 75) * 2.5;
  const o3Sub = p.o3 <= 54 ? p.o3 * 0.93 : p.o3 <= 70 ? 50 + (p.o3 - 54) * 3.12 : 100 + (p.o3 - 70) * 2.5;
  return Math.round(clamp(Math.max(pm25Sub, pm10Sub, no2Sub, coSub, so2Sub, o3Sub), 0, 500));
};

export const predictAqi = (
  currentAqi: number,
  hoursAhead: number,
  seed: number,
): PredictionPoint => {
  const rand = seedRand(seed + hoursAhead * 7);
  const hourOfDay = new Date().getHours() + hoursAhead;
  const diurnal = Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.18;
  const trend = Math.sin(seed / 5) * 0.1;
  const noise = (rand() - 0.5) * 0.08;
  const factor = 1 + diurnal + trend + noise;
  const predicted = clamp(Math.round(currentAqi * factor), 1, 500);
  const confidence = clamp(Math.round(96 - hoursAhead * 4 + rand() * 4), 60, 98);
  const time = new Date(Date.now() + hoursAhead * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    time,
    aqi: predicted,
    confidence,
    pollutants: aqiToPollutants(predicted, seed + hoursAhead * 13),
  };
};

export const generatePrediction = (currentAqi: number, seed: number): PredictionResult => {
  const horizons = [0, 0.5, 1, 3, 6];
  const points = horizons.map((h) => predictAqi(currentAqi, h, seed));
  const trend = points[points.length - 1].aqi > currentAqi + 5 ? 'rising' : points[points.length - 1].aqi < currentAqi - 5 ? 'falling' : 'stable';
  const avgConfidence = Math.round(points.reduce((s, p) => s + p.confidence, 0) / points.length);
  return { points, currentAqi, trend, confidence: avgConfidence };
};

export const generateHistoricalSeries = (days: number, seed: number) => {
  const rand = seedRand(seed + days);
  const out: { date: string; aqi: number; pm25: number; pm10: number; no2: number; o3: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const base = 70 + Math.sin(i / 3) * 30 + (rand() - 0.5) * 40;
    const aqi = clamp(Math.round(base), 10, 300);
    out.push({
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      aqi,
      pm25: Math.round(aqi * 0.45),
      pm10: Math.round(aqi * 0.7),
      no2: Math.round(aqi * 0.3),
      o3: Math.round(aqi * 0.4),
    });
  }
  return out;
};

export const generateHourlySeries = (seed: number) => {
  const rand = seedRand(seed + 99);
  const out: { hour: string; aqi: number }[] = [];
  for (let h = 23; h >= 0; h--) {
    const d = new Date(Date.now() - h * 3600 * 1000);
    const diurnal = Math.sin((d.getHours() - 6) * Math.PI / 12);
    const aqi = clamp(Math.round(80 + diurnal * 50 + (rand() - 0.5) * 25), 10, 280);
    out.push({ hour: d.toLocaleTimeString([], { hour: '2-digit' }), aqi });
  }
  return out;
};

export const getCityAqi = (city: string, lat: number, lng: number): number => {
  const seed = Math.abs(Math.round((lat + 90) * 1000 + (lng + 180) * 100 + city.length * 7));
  const rand = seedRand(seed);
  return clamp(Math.round(60 + rand() * 120), 10, 320);
};
