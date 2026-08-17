export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  age: number;
  gender: string;
  asthma: boolean;
  copd: boolean;
  heart_disease: boolean;
  allergies: boolean;
  pregnancy: boolean;
  sensitivity: 'low' | 'moderate' | 'high' | 'extreme';
  emergency_name: string;
  emergency_phone: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  push_notifications: boolean;
  aqi_alerts: boolean;
  travel_alerts: boolean;
  language: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  read: boolean;
  created_at: string;
}

export interface Pollutants {
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  so2: number;
  o3: number;
}

export interface AqiReading {
  id: string;
  city: string;
  lat: number;
  lng: number;
  aqi: number;
  pollutants: Pollutants;
  recorded_at: string;
}

export interface TravelReport {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  duration_min: number;
  exposure_aqi: number;
  advisory: string;
  route_data: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type AqiCategory = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
