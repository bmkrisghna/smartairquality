import { useState, useEffect } from 'react';

let loaderPromise: Promise<void> | undefined;

const LOAD_TIMEOUT_MS = 15000;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Not in browser environment'));
  }

  if (typeof google !== 'undefined' && google.maps) {
    return Promise.resolve();
  }

  if (window.__googleMapsLoader) return window.__googleMapsLoader;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  if (!apiKey) {
    return Promise.reject(
      new Error('VITE_GOOGLE_MAPS_API_KEY is not set. Add it to your .env file.'),
    );
  }

  loaderPromise = new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      delete (window as unknown as Record<string, unknown>).__gmapsInit;
      delete (window as unknown as Record<string, unknown>).gm_authFailure;
      window.__googleMapsLoader = undefined;
      loaderPromise = undefined;
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      script.remove();
      reject(new Error(message));
    };

    const succeed = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    // Google calls this global on auth failure (bad key, billing disabled, referer blocked)
    (window as unknown as Record<string, unknown>).gm_authFailure = () => {
      fail(
        'Google Maps authentication failed. Check that your API key is valid, billing is enabled, and the Maps JavaScript API + Places API are turned on.',
      );
    };

    (window as unknown as Record<string, unknown>).__gmapsInit = () => {
      if (typeof google !== 'undefined' && google.maps) {
        succeed();
      } else {
        fail('Google Maps script loaded but the API was not initialized.');
      }
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=__gmapsInit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      fail('Failed to load the Google Maps script. Check your network connection.');
    };
    document.head.appendChild(script);

    // Guard against the script loading but never calling the callback
    // (happens when Google returns an error page instead of the API)
    setTimeout(() => {
      if (!settled) {
        if (typeof google !== 'undefined' && google.maps) {
          succeed();
        } else {
          fail(
            'Google Maps took too long to load. Verify your API key has Maps JavaScript API and Places API enabled with billing activated.',
          );
        }
      }
    }, LOAD_TIMEOUT_MS);
  });

  window.__googleMapsLoader = loaderPromise;
  return loaderPromise;
}

export function useGoogleMaps(): { loaded: boolean; error: string | null } {
  const [loaded, setLoaded] = useState(
    typeof google !== 'undefined' && !!google.maps,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) return;
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [loaded]);

  return { loaded, error };
}
