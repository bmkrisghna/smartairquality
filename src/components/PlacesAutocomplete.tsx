import { useRef, useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useGoogleMaps } from '@/lib/google-maps';

export interface PlaceResult {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  label: string;
  value: string;
  onSelect: (place: PlaceResult) => void;
  onClear?: () => void;
  placeholder?: string;
}

export const PlacesAutocomplete = ({ label, value, onSelect, onClear, placeholder }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onSelectRef = useRef(onSelect);
  const [text, setText] = useState(value);
  const { loaded } = useGoogleMaps();

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (!loaded || !inputRef.current) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
    });
    autocompleteRef.current = ac;

    google.maps.event.addListener(ac, 'place_changed', () => {
      const place = ac.getPlace();
      if (place.geometry?.location) {
        const name = place.formatted_address || place.name || inputRef.current?.value || '';
        onSelectRef.current({
          placeId: place.place_id || '',
          name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [loaded]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1.5 text-soft">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[rgb(var(--surface-2))] border border-app text-[rgb(var(--text))] placeholder:text-muted text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
        {text && onClear && (
          <button
            onClick={() => { setText(''); onClear(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[rgb(var(--text))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
