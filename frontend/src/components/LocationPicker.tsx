import { useState, useCallback } from 'react';
import { MapPin, Navigation, ChevronDown } from 'lucide-react';

interface LocationData {
  latitude?: number;
  longitude?: number;
  address?: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
}

interface LocationPickerProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
}

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoError, setGeoError] = useState('');

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoState('error');
      return;
    }

    setGeoState('loading');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...value,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGeoState('success');
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Location access denied. Please enter your location manually.',
          2: 'Location unavailable. Please enter it manually.',
          3: 'Location request timed out.',
        };
        setGeoError(msgs[err.code] || 'Could not get location.');
        setGeoState('error');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, [value, onChange]);

  const handleManualField = (field: keyof LocationData, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const hasGps = value.latitude !== undefined && value.longitude !== undefined;
  const hasManual = value.state || value.district || value.village;

  return (
    <div className="space-y-4">
      {/* GPS detection */}
      <button
        type="button"
        onClick={detectLocation}
        disabled={geoState === 'loading'}
        className="w-full flex items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
          {geoState === 'loading' ? (
            <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          ) : hasGps ? (
            <Navigation className="w-4 h-4 text-green-400 fill-current" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold">
            {geoState === 'loading' ? 'Detecting location…' : 'Use my current location'}
          </p>
          {hasGps && (
            <p className="text-xs text-green-400 mt-0.5">
              ✓ GPS: {value.latitude!.toFixed(4)}, {value.longitude!.toFixed(4)}
            </p>
          )}
        </div>
      </button>

      {geoError && (
        <p className="text-amber-400/80 text-xs flex items-center gap-2">
          <span>⚠️</span> {geoError}
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700/50" />
        <span className="text-slate-500 text-xs">or enter manually</span>
        <div className="flex-1 h-px bg-slate-700/50" />
      </div>

      {/* Manual fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">State</label>
          <div className="relative">
            <select
              value={value.state || ''}
              onChange={(e) => handleManualField('state', e.target.value)}
              className="w-full appearance-none bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">District</label>
          <input
            type="text"
            placeholder="e.g., Ranchi"
            value={value.district || ''}
            onChange={(e) => handleManualField('district', e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Block</label>
          <input
            type="text"
            placeholder="Block name"
            value={value.block || ''}
            onChange={(e) => handleManualField('block', e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Village / Area</label>
          <input
            type="text"
            placeholder="Village name"
            value={value.village || ''}
            onChange={(e) => handleManualField('village', e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-500"
          />
        </div>
      </div>

      {/* Summary */}
      {(hasGps || hasManual) && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <MapPin className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-green-300 text-xs">
            {hasGps && `GPS coordinates captured. `}
            {[value.village, value.block, value.district, value.state]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
