import type { Profile } from '@/lib/types';
import { aqiCategory } from '@/lib/aqi';

export interface Advisory {
  icon: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const generateAdvisories = (aqi: number, profile: Partial<Profile> | null): Advisory[] => {
  const cat = aqiCategory(aqi);
  const advisories: Advisory[] = [];
  const sensitive = profile?.asthma || profile?.copd || profile?.heart_disease || profile?.pregnancy || profile?.sensitivity === 'high' || profile?.sensitivity === 'extreme';

  if (cat === 'good') {
    advisories.push({ icon: 'check', title: 'Safe for outdoor activity', description: 'Air quality is good. Enjoy outdoor activities normally.', severity: 'low' });
  } else if (cat === 'moderate') {
    advisories.push({ icon: 'info', title: 'Caution for sensitive groups', description: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.', severity: 'low' });
  } else if (cat === 'unhealthy-sensitive') {
    advisories.push({ icon: 'wind', title: 'Sensitive groups should limit outdoor exertion', description: 'People with respiratory or heart conditions should reduce prolonged outdoor activity.', severity: 'medium' });
  } else if (cat === 'unhealthy') {
    advisories.push({ icon: 'alert', title: 'Avoid prolonged outdoor exertion', description: 'Everyone may experience health effects. Limit outdoor activity.', severity: 'high' });
  } else if (cat === 'very-unhealthy') {
    advisories.push({ icon: 'shield', title: 'Avoid all outdoor activity', description: 'Health alert: serious health effects possible. Stay indoors.', severity: 'critical' });
  } else {
    advisories.push({ icon: 'shield', title: 'Emergency conditions', description: 'Hazardous air quality. Remain indoors with windows closed.', severity: 'critical' });
  }

  if (sensitive && cat !== 'good') {
    advisories.push({ icon: 'mask', title: 'Wear N95 mask outdoors', description: 'A properly fitted N95 mask reduces exposure to fine particulates.', severity: 'high' });
  }

  if (profile?.asthma && aqi > 100) {
    advisories.push({ icon: 'heart', title: 'Keep inhaler accessible', description: 'Have your rescue inhaler nearby. Watch for wheezing or shortness of breath.', severity: 'high' });
  }

  if (profile?.copd && aqi > 75) {
    advisories.push({ icon: 'lungs', title: 'Minimize outdoor exposure', description: 'COPD increases risk. Stay indoors and use air purification if available.', severity: 'high' });
  }

  if (profile?.heart_disease && aqi > 100) {
    advisories.push({ icon: 'heart', title: 'Avoid strenuous activity', description: 'Air pollution can strain the cardiovascular system. Rest and stay hydrated.', severity: 'high' });
  }

  if (profile?.pregnancy && aqi > 100) {
    advisories.push({ icon: 'baby', title: 'Limit outdoor exposure', description: 'Pregnancy increases sensitivity to pollutants. Stay indoors when possible.', severity: 'high' });
  }

  if (profile?.allergies && aqi > 75) {
    advisories.push({ icon: 'leaf', title: 'Allergy precaution', description: 'Pollution can worsen allergy symptoms. Consider antihistamines and limit exposure.', severity: 'medium' });
  }

  if (aqi > 150) {
    advisories.push({ icon: 'home', title: 'Keep windows closed', description: 'Seal indoor spaces and run HEPA air purifiers to maintain clean indoor air.', severity: 'high' });
  }

  if (aqi > 200) {
    advisories.push({ icon: 'clock', title: 'Delay non-essential travel', description: 'Postpone outdoor trips until conditions improve. Check the prediction timeline.', severity: 'critical' });
  }

  return advisories;
};

export interface RouteSegment {
  name: string;
  aqi: number;
  distanceKm: number;
  durationMin: number;
  polluted: boolean;
}

export interface RouteAnalysis {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  averageExposure: number;
  peakExposure: number;
  recommendedDeparture: string;
  recommendedDepartureHour: number;
  healthierAlternative: string;
  exposureGrams: number;
}

export const analyzeRoute = (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  seed: number,
): RouteAnalysis => {
  const distance = Math.sqrt(Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2)) * 111;
  const totalDistance = Math.max(1, distance * 1.3);
  const totalDuration = Math.round(totalDistance * 2.5);
  const segCount = 4;
  const segDist = totalDistance / segCount;
  const segDur = totalDuration / segCount;
  const segments: RouteSegment[] = [];

  for (let i = 0; i < segCount; i++) {
    const segSeed = seed + i * 17;
    const rand = (Math.sin(segSeed) + 1) / 2;
    const baseAqi = 80 + rand * 100;
    const hotspots = i === 1 || i === 2;
    const aqi = Math.round(hotspots ? baseAqi + 60 : baseAqi);
    segments.push({
      name: `Segment ${i + 1}`,
      aqi,
      distanceKm: Math.round(segDist * 10) / 10,
      durationMin: Math.round(segDur),
      polluted: aqi > 150,
    });
  }

  const averageExposure = Math.round(segments.reduce((s, x) => s + x.aqi, 0) / segments.length);
  const peakExposure = Math.max(...segments.map((s) => s.aqi));
  const exposureGrams = Math.round((averageExposure * totalDistance * 0.0006) * 1000) / 1000;

  // Find the hour with lowest predicted AQI in next 12 hours
  let bestHour = 0;
  let bestAqi = 999;
  for (let h = 0; h <= 12; h++) {
    const hourOfDay = (new Date().getHours() + h) % 24;
    const diurnal = Math.sin((hourOfDay - 6) * Math.PI / 12);
    const predicted = Math.round(averageExposure * (1 + diurnal * 0.2));
    if (predicted < bestAqi) {
      bestAqi = predicted;
      bestHour = h;
    }
  }

  const recommendedDeparture = bestHour === 0 ? 'Now' : new Date(Date.now() + bestHour * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const healthierAlternative = peakExposure > 150
    ? 'Consider an alternate route through less congested residential roads to avoid the identified pollution hotspots.'
    : 'Current route is acceptable. Standard precautions apply.';

  return {
    segments,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration,
    averageExposure,
    peakExposure,
    recommendedDeparture,
    recommendedDepartureHour: bestHour,
    healthierAlternative,
    exposureGrams,
  };
};
