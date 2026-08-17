import { useRef, useEffect, useState } from 'react';
import { useGoogleMaps } from '@/lib/google-maps';
import type { RouteInfo, RoutePoint } from '@/lib/route-analysis';

interface Props {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  routes: RouteInfo[];
  selectedRouteIndex: number | null;
  showTraffic: boolean;
  onMapReady?: (map: google.maps.Map) => void;
}

const ROUTE_COLORS = ['#1d65f3', '#f59e0b', '#a21caf'];
const ROUTE_WIDTH_NORMAL = 5;
const ROUTE_WIDTH_SELECTED = 8;

const BLUE_DOT: google.maps.SymbolIcon = {
  path: 0, // CIRCLE
  scale: 8,
  fillColor: '#1d65f3',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
};

export const GoogleMapsView = ({
  origin,
  destination,
  routes,
  selectedRouteIndex,
  showTraffic,
  onMapReady,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const trafficRef = useRef<google.maps.TrafficLayer | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<RoutePoint | null>(null);
  const { loaded, error } = useGoogleMaps();

  // Init map
  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center: { lat: 20.59, lng: 78.96 },
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      gestureHandling: 'greedy',
    });
    mapRef.current = map;
    onMapReady?.(map);

    // Request user's current GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: RoutePoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        () => {
          // Geolocation denied or unavailable — silently skip
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, [loaded, onMapReady]);

  // Blue marker for current GPS location
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        icon: BLUE_DOT,
        title: 'Your location',
      });
    }
  }, [userLocation, loaded]);

  // Traffic layer
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    if (showTraffic) {
      if (!trafficRef.current) {
        trafficRef.current = new google.maps.TrafficLayer();
      }
      trafficRef.current.setMap(mapRef.current);
    } else {
      trafficRef.current?.setMap(null);
    }
  }, [showTraffic, loaded]);

  // Markers
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (origin) {
      const marker = new google.maps.Marker({
        position: origin,
        map: mapRef.current,
        label: { text: 'A', color: '#fff', fontSize: '11px' },
        title: 'Origin',
      });
      markersRef.current.push(marker);
    }

    if (destination) {
      const marker = new google.maps.Marker({
        position: destination,
        map: mapRef.current,
        label: { text: 'B', color: '#fff', fontSize: '11px' },
        title: 'Destination',
      });
      markersRef.current.push(marker);
    }
  }, [origin, destination, loaded]);

  // Route polylines
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (routes.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    routes.forEach((route) => {
      const isSelected = selectedRouteIndex === null
        ? route.isRecommended
        : route.index === selectedRouteIndex;

      const color = route.isRecommended && selectedRouteIndex === null
        ? '#14c8a8'
        : ROUTE_COLORS[route.index % ROUTE_COLORS.length];

      const polyline = new google.maps.Polyline({
        path: route.path,
        strokeColor: color,
        strokeWeight: isSelected ? ROUTE_WIDTH_SELECTED : ROUTE_WIDTH_NORMAL,
        strokeOpacity: isSelected ? 0.9 : 0.5,
        map: mapRef.current,
      });
      polylinesRef.current.push(polyline);

      route.path.forEach((p) => bounds.extend(p));
    });

    if (origin) bounds.extend(origin);
    if (destination) bounds.extend(destination);
    mapRef.current.fitBounds(bounds, 60);
  }, [routes, selectedRouteIndex, origin, destination, loaded]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl border border-app bg-[rgb(var(--surface-2))] p-8 text-center">
        <div>
          <p className="text-sm font-medium text-red-500 mb-1">Map unavailable</p>
          <p className="text-xs text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl border border-app bg-[rgb(var(--surface-2))]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />;
};
