import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, FileBarChart, Activity, Route, Wind, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { generateHistoricalSeries } from '@/lib/aqi';
import { supabase } from '@/lib/supabase';
import type { TravelReport } from '@/lib/types';

const reportTypes = [
  { id: 'aqi-history', icon: Wind, title: 'AQI History Report', desc: '30-day air quality index history with daily averages and trends.', color: 'text-brand-500' },
  { id: 'health-summary', icon: Activity, title: 'Health Summary', desc: 'Personal health profile and advisory summary based on current conditions.', color: 'text-emerald-500' },
  { id: 'exposure', icon: FileBarChart, title: 'Exposure Report', desc: 'Estimated pollution exposure over time with pollutant breakdowns.', color: 'text-amber-500' },
  { id: 'travel', icon: Route, title: 'Travel Report', desc: 'Saved route analyses with exposure estimates and recommendations.', color: 'text-purple-500' },
  { id: 'prediction', icon: Calendar, title: 'Prediction Summary', desc: 'AI prediction results with confidence scores and trend analysis.', color: 'text-accent-500' },
];

export const ReportsPage = () => {
  const { notify } = useToast();
  const { user, profile } = useAuth();
  const [travelReports, setTravelReports] = useState<TravelReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('travel_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => {
          setTravelReports((data as TravelReport[]) || []);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const generateReport = (type: string) => {
    const seed = Math.round(Date.now() / 86400000);
    const historical = generateHistoricalSeries(30, seed);
    const avgAqi = Math.round(historical.reduce((s, d) => s + d.aqi, 0) / historical.length);
    const maxAqi = Math.max(...historical.map((d) => d.aqi));
    const minAqi = Math.min(...historical.map((d) => d.aqi));

    let content = '';

    if (type === 'aqi-history') {
      content = `AQI HISTORY REPORT\n${'='.repeat(50)}\n\nDate: ${new Date().toLocaleDateString()}\nUser: ${profile?.full_name || user?.email}\n\nSUMMARY\n-------\n30-day average AQI: ${avgAqi}\nMaximum AQI: ${maxAqi}\nMinimum AQI: ${minAqi}\n\nDAILY READINGS\n-------------\n${historical.map((d) => `${d.date}: AQI ${d.aqi} (PM2.5: ${d.pm25}, PM10: ${d.pm10}, NO2: ${d.no2}, O3: ${d.o3})`).join('\n')}`;
    } else if (type === 'health-summary') {
      content = `HEALTH SUMMARY REPORT\n${'='.repeat(50)}\n\nDate: ${new Date().toLocaleDateString()}\nUser: ${profile?.full_name || user?.email}\n\nHEALTH PROFILE\n-------------\nAge: ${profile?.age || 'N/A'}\nGender: ${profile?.gender || 'N/A'}\nSensitivity: ${profile?.sensitivity || 'moderate'}\n\nCONDITIONS\n----------\nAsthma: ${profile?.asthma ? 'Yes' : 'No'}\nCOPD: ${profile?.copd ? 'Yes' : 'No'}\nHeart Disease: ${profile?.heart_disease ? 'Yes' : 'No'}\nAllergies: ${profile?.allergies ? 'Yes' : 'No'}\nPregnancy: ${profile?.pregnancy ? 'Yes' : 'No'}\n\nEMERGENCY CONTACT\n-----------------\nName: ${profile?.emergency_name || 'N/A'}\nPhone: ${profile?.emergency_phone || 'N/A'}\n\nCURRENT ADVISORY\n----------------\nBased on current AQI conditions, follow personalized advisories from the Prediction page.`;
    } else if (type === 'exposure') {
      const totalExposure = historical.reduce((s, d) => s + d.aqi * 0.0006, 0);
      content = `EXPOSURE REPORT\n${'='.repeat(50)}\n\nDate: ${new Date().toLocaleDateString()}\nUser: ${profile?.full_name || user?.email}\n\nESTIMATED 30-DAY EXPOSURE\n------------------------\nTotal PM2.5 exposure: ${totalExposure.toFixed(2)} mg\nAverage daily exposure: ${(totalExposure / 30).toFixed(3)} mg/day\nPeak exposure day: AQI ${maxAqi}\n\nPOLLUTANT BREAKDOWN\n-------------------\n${historical.map((d) => `${d.date}: PM2.5 ${d.pm25} | PM10 ${d.pm10} | NO2 ${d.no2} | O3 ${d.o3}`).join('\n')}`;
    } else if (type === 'travel') {
      content = `TRAVEL REPORT\n${'='.repeat(50)}\n\nDate: ${new Date().toLocaleDateString()}\nUser: ${profile?.full_name || user?.email}\n\nSAVED ROUTE ANALYSES\n-------------------\n${travelReports.length === 0 ? 'No saved travel analyses yet.' : travelReports.map((r, i) => `Route ${i + 1}: ${r.origin} → ${r.destination}\n  Distance: ${r.distance_km} km\n  Duration: ${r.duration_min} min\n  Avg Exposure: ${r.exposure_aqi} AQI\n  Advisory: ${r.advisory}\n  Date: ${new Date(r.created_at).toLocaleDateString()}`).join('\n\n')}`;
    } else if (type === 'prediction') {
      content = `PREDICTION SUMMARY REPORT\n${'='.repeat(50)}\n\nDate: ${new Date().toLocaleDateString()}\nUser: ${profile?.full_name || user?.email}\n\nPREDICTION MODEL\n----------------\nAlgorithm: Time-series regression with diurnal features\nHorizons: 30min, 1h, 3h, 6h\nAverage confidence: ~85%\n\n30-DAY HISTORICAL CONTEXT\n------------------------\nAverage AQI: ${avgAqi}\nTrend: ${maxAqi > avgAqi ? 'Variable with peaks' : 'Stable'}\n\nThe AI model uses historical patterns, time-of-day, and pollutant correlations to predict AQI up to 6 hours ahead.`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airguide-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Report downloaded', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>Reports</h2>
        <p className="text-muted text-sm">Generate and download detailed reports for your records</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[rgb(var(--surface-2))] flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${r.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: 'rgb(var(--text))' }}>{r.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-soft mb-4 flex-1">{r.desc}</p>
                <Button size="sm" fullWidth onClick={() => generateReport(r.id)}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Saved travel reports */}
      <Card title="Saved Travel Analyses" subtitle="Your recent route analyses">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : travelReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No saved travel analyses yet. Use the Travel Planner to analyze a route.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {travelReports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                <Route className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'rgb(var(--text))' }}>{r.origin} → {r.destination}</p>
                  <p className="text-xs text-muted">{r.distance_km} km · {r.duration_min} min · Exposure: {r.exposure_aqi} AQI</p>
                </div>
                <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
