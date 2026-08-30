import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { aqiColor } from '@/lib/aqi';

const tooltipStyle = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '0.75rem',
  fontSize: '0.75rem',
  color: 'rgb(var(--text))',
};

interface SeriesPoint { [k: string]: string | number }

export const HourlyChart = ({ data }: { data: SeriesPoint[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d65f3" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#1d65f3" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} />
      <Area type="monotone" dataKey="aqi" stroke="#1d65f3" strokeWidth={2} fill="url(#aqiGrad)" />
    </AreaChart>
  </ResponsiveContainer>
);

export const DailyChart = ({ data }: { data: SeriesPoint[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} />
      <Line type="monotone" dataKey="aqi" stroke="#1d65f3" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export const PollutantChart = ({ data }: { data: SeriesPoint[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      <Bar dataKey="pm25" fill="#1d65f3" radius={[3, 3, 0, 0]} />
      <Bar dataKey="pm10" fill="#14c8a8" radius={[3, 3, 0, 0]} />
      <Bar dataKey="no2" fill="#f59e0b" radius={[3, 3, 0, 0]} />
      <Bar dataKey="o3" fill="#a855f7" radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const PredictionChart = ({ data }: { data: SeriesPoint[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14c8a8" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#14c8a8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
      <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} />
      <Area type="monotone" dataKey="aqi" stroke="#14c8a8" strokeWidth={2} fill="url(#predGrad)" />
    </AreaChart>
  </ResponsiveContainer>
);

export const ExposureChart = ({ data }: { data: SeriesPoint[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} />
      <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
        {data.map((d, i) => (
          <rect key={i} fill={aqiColor(Number(d.aqi))} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
