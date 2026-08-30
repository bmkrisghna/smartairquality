import type { ChatMessageRow, Profile } from '@/lib/types';
import { aqiCategory, aqiLabel, aqiDescription, aqiColor } from '@/lib/aqi';
import { generateAdvisories } from '@/lib/advisory';

interface ChatContext {
  currentAqi: number;
  city: string;
  profile: Partial<Profile> | null;
}

const intents: { keywords: string[]; respond: (ctx: ChatContext) => string }[] = [
  {
    keywords: ['aqi', 'air quality', 'quality', 'current', 'pollution level'],
    respond: (c) => `The current AQI in ${c.city} is ${c.currentAqi}, classified as "${aqiLabel(c.currentAqi)}". ${aqiDescription(c.currentAqi)}`,
  },
  {
    keywords: ['mask', 'n95', 'wear'],
    respond: (c) => {
      const cat = aqiCategory(c.currentAqi);
      if (cat === 'good') return 'Air quality is good right now — no mask needed for outdoor activity.';
      if (cat === 'moderate') return 'A mask is optional. Sensitive groups may want an N95 during prolonged outdoor activity.';
      return 'Yes — wear a properly fitted N95 mask outdoors. The current AQI is ' + c.currentAqi + ' (' + aqiLabel(c.currentAqi) + '). Fine particulates can penetrate surgical masks, so N95 or better is recommended.';
    },
  },
  {
    keywords: ['exercise', 'run', 'running', 'jogging', 'workout', 'outdoor'],
    respond: (c) => {
      const cat = aqiCategory(c.currentAqi);
      if (cat === 'good') return 'Great conditions for outdoor exercise. Enjoy your workout!';
      if (cat === 'moderate') return 'Moderate air quality. Sensitive groups should keep outdoor exertion short.';
      if (cat === 'unhealthy-sensitive') return 'Sensitive groups should move exercise indoors. Others should reduce intensity and duration.';
      return 'Avoid outdoor exercise right now. Consider indoor alternatives until AQI improves. Check the prediction page for when conditions clear.';
    },
  },
  {
    keywords: ['travel', 'route', 'commute', 'drive', 'trip'],
    respond: (c) => {
      const cat = aqiCategory(c.currentAqi);
      if (cat === 'good' || cat === 'moderate') return 'Travel conditions are acceptable. Use the Travel Planner to find the healthiest route and best departure time.';
      return 'Consider delaying non-essential travel. Open the Travel Planner to see pollution hotspots along your route and the recommended departure time.';
    },
  },
  {
    keywords: ['window', 'indoor', 'home', 'ventilation'],
    respond: (c) => {
      if (c.currentAqi > 150) return 'Keep windows closed and run a HEPA air purifier. The current AQI is ' + c.currentAqi + '.';
      return 'Air quality is acceptable for ventilation. You can open windows to refresh indoor air.';
    },
  },
  {
    keywords: ['health', 'asthma', 'copd', 'heart', 'sensitive', 'pregnancy', 'allergy', 'allergies'],
    respond: (c) => {
      const adv = generateAdvisories(c.currentAqi, c.profile);
      const personal = adv.filter((a) => a.title.includes('inhaler') || a.title.includes('COPD') || a.title.includes('cardiovascular') || a.title.includes('pregnancy') || a.title.includes('allergy'));
      if (personal.length) return 'Based on your health profile: ' + personal.map((a) => a.title + ' — ' + a.description).join(' ');
      return 'No specific health precautions flagged for your profile at this AQI. General advice: ' + aqiDescription(c.currentAqi);
    },
  },
  {
    keywords: ['safe', 'safety', 'danger', 'risk', 'hazard'],
    respond: (c) => `Current risk level: ${aqiLabel(c.currentAqi)}. ${aqiDescription(c.currentAqi)} The AQI color code is ${aqiColor(c.currentAqi)}.`,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'what can you do'],
    respond: (c) => `Hi! I'm AirGuide, your air quality assistant. I can help with AQI readings, health advice, travel recommendations, and safety tips. The current AQI in ${c.city} is ${c.currentAqi}. Ask me about masks, exercise, travel, or your health profile.`,
  },
];

export const generateChatResponse = (message: string, ctx: ChatContext): string => {
  const lower = message.toLowerCase();
  for (const intent of intents) {
    if (intent.keywords.some((k) => lower.includes(k))) {
      return intent.respond(ctx);
    }
  }
  // Fallback: try to extract a number and treat as AQI query
  if (ctx.currentAqi) {
    return `I can help with AQI, health advice, travel, masks, exercise, and safety. The current AQI in ${ctx.city} is ${ctx.currentAqi} (${aqiLabel(ctx.currentAqi)}). Try asking "Should I wear a mask?" or "Is it safe to exercise?"`;
  }
  return 'I can help with AQI, health advice, travel, and safety. Try asking about the current air quality or whether it is safe to exercise.';
};

export const buildChatContext = (currentAqi: number, city: string, profile: Partial<Profile> | null): ChatContext => ({
  currentAqi,
  city,
  profile,
});

export type { ChatMessageRow };
