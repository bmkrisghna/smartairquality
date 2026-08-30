import { aqiColor, aqiLabel } from '@/lib/aqi';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteEnvSample {
  temperature: number;
  humidity: number;
  windSpeed: number;
  aqi: number;
  pm25: number;
  pm10: number;
}

export interface RouteInfo {
  index: number;
  summary: string;
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
  path: RoutePoint[];
  averageAqi: number;
  exposureScore: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pm25: number;
  pm10: number;
  isRecommended: boolean;
}

interface OpenMeteoWeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
  };
}

interface OpenMeteoAirQualityResponse {
  current: {
    us_aqi: number;
    pm2_5: number;
    pm10: number;
  };
}

const fetchEnvForPoint = async (point: RoutePoint): Promise<RouteEnvSample | null> => {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${point.lat}&longitude=${point.lng}&current=us_aqi,pm2_5,pm10`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl),
    ]);

    if (!weatherRes.ok || !aqiRes.ok) return null;

    const weather = (await weatherRes.json()) as OpenMeteoWeatherResponse;
    const aqi = (await aqiRes.json()) as OpenMeteoAirQualityResponse;

    return {
      temperature: Math.round((weather.current.temperature_2m ?? 0) * 10) / 10,
      humidity: Math.round(weather.current.relative_humidity_2m ?? 0),
      windSpeed: Math.round((weather.current.wind_speed_10m ?? 0) * 10) / 10,
      aqi: Math.round(aqi.current.us_aqi ?? 0),
      pm25: Math.round((aqi.current.pm2_5 ?? 0) * 10) / 10,
      pm10: Math.round((aqi.current.pm10 ?? 0) * 10) / 10,
    };
  } catch {
    return null;
  }
};

export async function analyzeRouteEnvironment(path: RoutePoint[]): Promise<{
  averageAqi: number;
  exposureScore: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pm25: number;
  pm10: number;
}> {
  if (path.length === 0) {
    return { averageAqi: 0, exposureScore: 0, temperature: 0, humidity: 0, windSpeed: 0, pm25: 0, pm10: 0 };
  }

  const sampleCount = Math.min(path.length, 8);
  const samples: RouteEnvSample[] = [];

  const promises: Promise<void>[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.floor((i / sampleCount) * path.length);
    const point = path[idx];
    promises.push(
      fetchEnvForPoint(point).then((s) => {
        if (s) samples.push(s);
      }),
    );
  }
  await Promise.all(promises);

  if (samples.length === 0) {
    return { averageAqi: 0, exposureScore: 0, temperature: 0, humidity: 0, windSpeed: 0, pm25: 0, pm10: 0 };
  }

  const averageAqi = Math.round(samples.reduce((sum, s) => sum + s.aqi, 0) / samples.length);
  const temperature = Math.round((samples.reduce((sum, s) => sum + s.temperature, 0) / samples.length) * 10) / 10;
  const humidity = Math.round(samples.reduce((sum, s) => sum + s.humidity, 0) / samples.length);
  const windSpeed = Math.round((samples.reduce((sum, s) => sum + s.windSpeed, 0) / samples.length) * 10) / 10;
  const pm25 = Math.round((samples.reduce((sum, s) => sum + s.pm25, 0) / samples.length) * 10) / 10;
  const pm10 = Math.round((samples.reduce((sum, s) => sum + s.pm10, 0) / samples.length) * 10) / 10;

  // Exposure score: time-weighted average AQI (higher = worse exposure)
  const exposureScore = Math.round(averageAqi * 10) / 10;

  return { averageAqi, exposureScore, temperature, humidity, windSpeed, pm25, pm10 };
}

export function pickBestRoute(routes: RouteInfo[]): RouteInfo[] {
  if (routes.length === 0) return routes;

  const minDuration = Math.min(...routes.map((r) => r.durationSeconds));
  const minAqi = Math.min(...routes.map((r) => r.averageAqi));

  const scored = routes.map((r) => {
    // Lower score is better. Normalize each axis so the best route = 1.0.
    const timeScore = minDuration > 0 ? r.durationSeconds / minDuration : 1;
    const aqiScore = minAqi > 0 ? r.averageAqi / minAqi : 1;
    // 70% air quality, 30% travel time
    const combined = aqiScore * 0.7 + timeScore * 0.3;
    return { route: r, score: combined };
  });

  scored.sort((a, b) => a.score - b.score);
  const bestIndex = scored[0].route.index;

  return routes.map((r) => ({ ...r, isRecommended: r.index === bestIndex }));
}

export { aqiColor, aqiLabel };
