import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation, MapPin, Clock, Route as RouteIcon, Wind,
  Activity, AlertTriangle, CheckCircle2, Sparkles, Loader2,
  TrendingDown, Gauge, ArrowRight, Layers, Thermometer, Droplets,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlacesAutocomplete, type PlaceResult } from '@/components/PlacesAutocomplete';
import { GoogleMapsView } from '@/components/GoogleMapsView';
import { useGoogleMaps } from '@/lib/google-maps';
import { aqiColor, aqiLabel } from '@/lib/aqi';
import {
  analyzeRouteEnvironment,
  pickBestRoute,
  type RouteInfo,
  type RoutePoint,
} from '@/lib/route-analysis';

export const MapPage = () => {
  const { loaded } = useGoogleMaps();
  const [origin, setOrigin] = useState<PlaceResult | null>(null);
  const [destination, setDestination] = useState<PlaceResult | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOriginSelect = (place: PlaceResult) => setOrigin(place);
  const handleDestinationSelect = (place: PlaceResult) => setDestination(place);

  const handleFindRoutes = useCallback(async () => {
    if (!origin || !destination) return;
    if (typeof google === 'undefined' || !google.maps) return;

    setLoading(true);
    setError(null);
    setRoutes([]);
    setSelectedRouteIndex(null);

    try {
      const directionsService = new google.maps.directions.DirectionsService();

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        },
        (result, status) => {
          if (status !== 'OK' || !result || result.routes.length === 0) {
            setError('No routes found between these locations.');
            setLoading(false);
            return;
          }

          (async () => {
            const allRoutes: RouteInfo[] = await Promise.all(
              result.routes.map(async (route, index) => {
                const leg = route.legs[0];
                const path: RoutePoint[] = route.overview_path.map((p) => ({
                  lat: p.lat,
                  lng: p.lng,
                }));

                const env = await analyzeRouteEnvironment(path);

                return {
                  index,
                  summary: `Route ${index + 1}`,
                  distanceText: leg.distance.text,
                  durationText: leg.duration.text,
                  distanceMeters: leg.distance.value,
                  durationSeconds: leg.duration.value,
                  path,
                  averageAqi: env.averageAqi,
                  exposureScore: env.exposureScore,
                  temperature: env.temperature,
                  humidity: env.humidity,
                  windSpeed: env.windSpeed,
                  pm25: env.pm25,
                  pm10: env.pm10,
                  isRecommended: false,
                } as RouteInfo;
              }),
            );

            const ranked = pickBestRoute(allRoutes);
            setRoutes(ranked);
            setLoading(false);
          })();
        },
      );
    } catch {
      setError('Failed to fetch routes. Please try again.');
      setLoading(false);
    }
  }, [origin, destination]);

  const originPoint: RoutePoint | null = origin
    ? { lat: origin.lat, lng: origin.lng }
    : null;
  const destPoint: RoutePoint | null = destination
    ? { lat: destination.lat, lng: destination.lng }
    : null;

  const recommendedRoute = routes.find((r) => r.isRecommended);
  const selectedRoute = selectedRouteIndex !== null
    ? routes.find((r) => r.index === selectedRouteIndex)
    : recommendedRoute;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgb(var(--text))' }}>
          Route Planner & Air Quality
        </h2>
        <p className="text-muted text-sm">
          Find the healthiest route. We compare travel time and air quality exposure for every option.
        </p>
      </div>

      {/* Search inputs */}
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <PlacesAutocomplete
            label="Source"
            value={origin?.name || ''}
            onSelect={handleOriginSelect}
            onClear={() => setOrigin(null)}
            placeholder="Enter starting point..."
          />
          <PlacesAutocomplete
            label="Destination"
            value={destination?.name || ''}
            onSelect={handleDestinationSelect}
            onClear={() => setDestination(null)}
            placeholder="Enter destination..."
          />
        </div>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleFindRoutes}
            loading={loading}
            size="lg"
            disabled={!loaded || !origin || !destination}
          >
            <Navigation className="w-4 h-4" />
            Find Routes
          </Button>
          <button
            onClick={() => setShowTraffic((s) => !s)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-all ${
              showTraffic
                ? 'border-brand-500 bg-brand-500/5 text-brand-500'
                : 'border-app text-soft hover:bg-[rgb(var(--surface-2))]'
            }`}
          >
            <Layers className="w-4 h-4" />
            Traffic Layer
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        )}
      </Card>

      {/* Map */}
      <Card noPadding className="overflow-hidden">
        <div style={{ height: '500px' }}>
          <GoogleMapsView
            origin={originPoint}
            destination={destPoint}
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            showTraffic={showTraffic}
          />
        </div>
      </Card>

      {/* Route results */}
      {routes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Recommended route banner */}
          {recommendedRoute && (
            <div className="card p-4 border-accent-500/30 bg-accent-500/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                  Recommended: {recommendedRoute.summary}
                </p>
                <p className="text-xs text-muted">
                  Best balance of travel time and air quality exposure
                </p>
              </div>
            </div>
          )}

          {/* Route cards */}
          <div className="grid gap-4">
            {routes.map((route) => {
              const isSelected = selectedRouteIndex === null
                ? route.isRecommended
                : route.index === selectedRouteIndex;
              const color = route.isRecommended && selectedRouteIndex === null
                ? '#14c8a8'
                : ['#1d65f3', '#f59e0b', '#a21caf'][route.index % 3];

              return (
                <button
                  key={route.index}
                  onClick={() => setSelectedRouteIndex(route.index)}
                  className={`card p-4 text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-brand-500'
                      : 'hover:bg-[rgb(var(--surface-2))]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: color + '20' }}
                    >
                      <RouteIcon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                        {route.summary}
                        {route.isRecommended && (
                          <span className="ml-2 text-xs text-accent-500 font-medium">
                            Best Route
                          </span>
                        )}
                      </p>
                    </div>
                    {route.isRecommended && (
                      <CheckCircle2 className="w-5 h-5 text-accent-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <RouteIcon className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-xs text-muted">Distance</p>
                        <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>
                          {route.distanceText}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-xs text-muted">Travel Time</p>
                        <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>
                          {route.durationText}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-xs text-muted">Avg AQI</p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: aqiColor(route.averageAqi) }}
                        >
                          {route.averageAqi} ({aqiLabel(route.averageAqi)})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-xs text-muted">Exposure</p>
                        <p
                          className="text-sm font-bold"
                          style={{
                            color: route.exposureScore > 150
                              ? '#ef4444'
                              : route.exposureScore > 100
                                ? '#f59e0b'
                                : '#22c55e',
                          }}
                        >
                          {route.exposureScore}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected route detail */}
          {selectedRoute && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              <Card title="Route Details" subtitle={selectedRoute.summary}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <RouteIcon className="w-4 h-4" /> Distance
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {selectedRoute.distanceText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Duration
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {selectedRoute.durationText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Wind className="w-4 h-4" /> Average AQI
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: aqiColor(selectedRoute.averageAqi) }}
                    >
                      {selectedRoute.averageAqi} — {aqiLabel(selectedRoute.averageAqi)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Exposure Score
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: selectedRoute.exposureScore > 150
                          ? '#ef4444'
                          : selectedRoute.exposureScore > 100
                            ? '#f59e0b'
                            : '#22c55e',
                      }}
                    >
                      {selectedRoute.exposureScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Thermometer className="w-4 h-4" /> Temperature
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {selectedRoute.temperature}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Droplets className="w-4 h-4" /> Humidity
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {selectedRoute.humidity}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Wind className="w-4 h-4" /> PM2.5
                    </span>
                    <span className="text-sm font-semibold" style={{ color: aqiColor(selectedRoute.pm25 * 2) }}>
                      {selectedRoute.pm25} µg/m³
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--surface-2))]">
                    <span className="text-sm text-muted flex items-center gap-2">
                      <Wind className="w-4 h-4" /> PM10
                    </span>
                    <span className="text-sm font-semibold" style={{ color: aqiColor(selectedRoute.pm10) }}>
                      {selectedRoute.pm10} µg/m³
                    </span>
                  </div>
                </div>
              </Card>

              <Card title="Health Advisory" subtitle="Based on route exposure">
                <div className="space-y-3">
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: aqiColor(selectedRoute.averageAqi) + '15',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: aqiColor(selectedRoute.averageAqi) + '25' }}
                    >
                      <Wind
                        className="w-5 h-5"
                        style={{ color: aqiColor(selectedRoute.averageAqi) }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                        {aqiLabel(selectedRoute.averageAqi)} Air Quality
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {selectedRoute.averageAqi <= 50
                          ? 'Safe for all outdoor activities.'
                          : selectedRoute.averageAqi <= 100
                            ? 'Acceptable for most. Sensitive groups should limit prolonged exertion.'
                            : selectedRoute.averageAqi <= 150
                              ? 'Sensitive groups may experience symptoms. Consider wearing a mask.'
                              : 'Everyone may be affected. Wear an N95 mask and keep windows closed.'}
                      </p>
                    </div>
                  </div>

                  {selectedRoute.isRecommended && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent-500/5">
                      <TrendingDown className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>
                          Lowest overall exposure
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          This route optimizes both travel time and air quality.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-500/5">
                    <ArrowRight className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>
                        Tip
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Keep windows closed and recirculate air while driving on high-AQI routes.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {routes.length === 0 && !loading && !error && (
        <Card>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-sm text-soft mb-1">
              Enter a source and destination above to find routes.
            </p>
            <p className="text-xs text-muted">
              We'll show distance, travel time, average AQI, and exposure for each route.
            </p>
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
            <p className="text-sm text-muted">Analyzing routes and air quality...</p>
          </div>
        </Card>
      )}
    </div>
  );
};
