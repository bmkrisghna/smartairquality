import { motion } from 'framer-motion';
import { aqiColor, aqiLabel, aqiDescription } from '@/lib/aqi';

interface Props {
  aqi: number;
  city?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { ring: 80, stroke: 6, font: 'text-2xl', label: 'text-xs' },
  md: { ring: 120, stroke: 8, font: 'text-4xl', label: 'text-sm' },
  lg: { ring: 180, stroke: 10, font: 'text-6xl', label: 'text-base' },
};

export const AqiGauge = ({ aqi, city, size = 'md' }: Props) => {
  const cfg = sizes[size];
  const radius = (cfg.ring - cfg.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(aqi / 300, 1);
  const offset = circumference * (1 - pct);
  const color = aqiColor(aqi);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: cfg.ring, height: cfg.ring }}>
        <svg width={cfg.ring} height={cfg.ring} className="-rotate-90">
          <circle
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={radius}
            fill="none"
            strokeWidth={cfg.stroke}
            className="stroke-[rgb(var(--surface-2))]"
          />
          <motion.circle
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`font-bold ${cfg.font}`}
            style={{ color }}
          >
            {aqi}
          </motion.span>
          <span className={`${cfg.label} text-muted font-medium`}>AQI</span>
        </div>
      </div>
      <div className="text-center">
        <span className="font-semibold text-sm" style={{ color }}>{aqiLabel(aqi)}</span>
        {city && <p className="text-xs text-muted mt-0.5">{city}</p>}
        <p className="text-xs text-muted mt-1 max-w-[200px]">{aqiDescription(aqi)}</p>
      </div>
    </div>
  );
};
