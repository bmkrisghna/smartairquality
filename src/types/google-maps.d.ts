// Minimal Google Maps JS API type declarations
// (avoids requiring @types/google.maps which isn't installed)

declare global {
  interface Window {
    google?: typeof google;
    __googleMapsLoader?: Promise<void> | undefined;
    __gmapsInit?: () => void;
    gm_authFailure?: () => void;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(
          el: Element,
          opts?: {
            center?: LatLngLiteral;
            zoom?: number;
            mapTypeId?: string;
            disableDefaultUI?: boolean;
            zoomControl?: boolean;
            gestureHandling?: string;
          },
        );
        setCenter(latLng: LatLngLiteral): void;
        setZoom(zoom: number): void;
        setMapTypeId(typeId: string): void;
        fitBounds(bounds: LatLngBounds, padding?: number): void;
        getBounds(): LatLngBounds | null;
      }

      class Marker {
        constructor(opts?: {
          position?: LatLngLiteral;
          map?: Map | null;
          title?: string;
          label?: string | { text: string; color?: string; fontSize?: string };
          icon?: string | Icon | SymbolIcon;
        });
        setMap(map: Map | null): void;
      }

      class InfoWindow {
        constructor(opts?: { content?: string });
        open(map?: Map, marker?: Marker): void;
        close(): void;
      }

      class Polyline {
        constructor(opts?: {
          path?: LatLngLiteral[];
          strokeColor?: string;
          strokeWeight?: number;
          strokeOpacity?: number;
          map?: Map | null;
          icons?: { icon: { path: string; scale?: number; strokeColor?: string; strokeWeight?: number }; offset?: string }[];
        });
        setMap(map: Map | null): void;
        setOptions(opts: Record<string, unknown>): void;
      }

      class LatLngBounds {
        constructor();
        extend(latLng: LatLngLiteral): LatLngBounds;
      }

      class TrafficLayer {
        constructor(opts?: { map?: Map | null });
        setMap(map: Map | null): void;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface Icon {
        path: string;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
        anchor?: { x: number; y: number };
      }
      interface SymbolIcon {
        path: number;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
        anchor?: { x: number; y: number };
      }

      namespace places {
        class Autocomplete {
          constructor(
            input: HTMLInputElement,
            opts?: { types?: string[]; componentRestrictions?: { country: string | string[] } },
          );
          addListener(event: string, handler: () => void): void;
          getPlace(): {
            place_id?: string;
            formatted_address?: string;
            name?: string;
            geometry?: { location?: LatLng; viewport?: LatLngBounds };
          };
        }
        interface LatLng {
          lat(): number;
          lng(): number;
        }
        class AutocompleteService {
          getPlacePredictions(
            req: { input: string; types?: string[] },
            cb: (results: AutocompletePrediction[] | null, status: string) => void,
          ): void;
        }
        interface AutocompletePrediction {
          place_id: string;
          description: string;
        }
        class PlacesService {
          constructor(map: Map);
          getDetails(
            req: { placeId: string },
            cb: (result: { geometry?: { location?: LatLng } } | null, status: string) => void,
          ): void;
        }
      }

      namespace directions {
        class DirectionsService {
          route(
            req: {
              origin: string | LatLngLiteral;
              destination: string | LatLngLiteral;
              travelMode: string;
              provideRouteAlternatives?: boolean;
            },
            cb: (result: DirectionsResult | null, status: string) => void,
          ): void;
        }
        class DirectionsRenderer {
          constructor(opts?: { map?: Map | null; suppressMarkers?: boolean });
          setMap(map: Map | null): void;
          setDirections(result: DirectionsResult): void;
          setOptions(opts: Record<string, unknown>): void;
        }
        interface DirectionsResult {
          routes: DirectionsRoute[];
        }
        interface DirectionsRoute {
          legs: DirectionsLeg[];
          overview_path: LatLngLiteral[];
        }
        interface DirectionsLeg {
          distance: { text: string; value: number };
          duration: { text: string; value: number };
          start_location: LatLngLiteral;
          end_location: LatLngLiteral;
          steps: DirectionsStep[];
        }
        interface DirectionsStep {
          distance: { text: string; value: number };
          duration: { text: string; value: number };
          start_location: LatLngLiteral;
          end_location: LatLngLiteral;
        }
      }

      namespace geometry {
        namespace encoding {
          function decodePath(encoded: string): LatLngLiteral[];
        }
        namespace spherical {
          function computeDistanceBetween(a: LatLngLiteral, b: LatLngLiteral): number;
        }
      }

      const MapTypeId: { ROADMAP: string; SATELLITE: string; HYBRID: string; TERRAIN: string };
    const SymbolPath: { CIRCLE: number; BACKWARD_CLOSED_ARROW: number; FORWARD_CLOSED_ARROW: number };
      const TravelMode: { DRIVING: string; WALKING: string; BICYCLING: string; TRANSIT: string };
      const PlacesServicesStatus: { OK: string };
      const DirectionsStatus: { OK: string };
      const event: {
        addListener(instance: unknown, event: string, handler: () => void): void;
        clearInstanceListeners(instance: unknown): void;
        removeListener(listener: unknown): void;
      };
    }
  }
}

export {};
