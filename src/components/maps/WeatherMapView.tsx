import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Thermometer,
  CloudRain,
  Cloud,
  Wind,
  Navigation,
  ZoomIn,
  ZoomOut,
  MapPin,
  Info,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { formatTemperature } from '../../utils/units';
import { reverseGeocodeCoordinates } from '../../services/weatherService';

type MapLayerType = 'temperature' | 'precipitation' | 'clouds' | 'wind';

export const WeatherMapView: React.FC = () => {
  const { currentLocation, weatherData, selectLocation, unitPreferences } = useWeather();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('precipitation');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isReverseLoading, setIsReverseLoading] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate map initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.latitude, currentLocation.longitude],
      zoom: 9,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // CartoDB Dark Matter base tile layer for dark theme
    const baseTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 18,
        subdomains: 'abcd',
      }
    );
    baseTile.addTo(map);

    // Custom marker icon using inline SVG
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0284c7, #4f46e5);
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
        ">
          ${formatTemperature(weatherData?.current.temperature, unitPreferences.temperature, false)}°
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
      icon: customIcon,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: system-ui; padding: 4px;">
        <strong style="font-size: 14px; color: #38bdf8;">${currentLocation.name}</strong><br/>
        <span style="font-size: 12px; color: #94a3b8;">${currentLocation.country || ''}</span><br/>
        <span style="font-size: 13px; font-weight: bold; color: #ffffff;">
          ${formatTemperature(weatherData?.current.temperature, unitPreferences.temperature)}
        </span>
      </div>
    `);

    markerRef.current = marker;

    // Map click handler to select ANY location on earth
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setClickedLocation({ lat, lng });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update map center & marker when currentLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(
      [currentLocation.latitude, currentLocation.longitude],
      mapInstanceRef.current.getZoom()
    );

    if (markerRef.current) {
      markerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
      markerRef.current.setPopupContent(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="font-size: 14px; color: #38bdf8;">${currentLocation.name}</strong><br/>
          <span style="font-size: 12px; color: #94a3b8;">${currentLocation.country || ''}</span><br/>
          <span style="font-size: 13px; font-weight: bold; color: #ffffff;">
            ${formatTemperature(weatherData?.current.temperature, unitPreferences.temperature)}
          </span>
        </div>
      `);
    }
  }, [currentLocation, weatherData, unitPreferences]);

  // Load weather for clicked map point
  const handleJumpToClicked = async () => {
    if (!clickedLocation) return;
    setIsReverseLoading(true);
    try {
      const loc = await reverseGeocodeCoordinates(clickedLocation.lat, clickedLocation.lng);
      selectLocation(loc);
      setClickedLocation(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReverseLoading(false);
    }
  };

  const layers: { id: MapLayerType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'precipitation', label: 'Precipitation', icon: CloudRain },
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
    { id: 'clouds', label: 'Cloud Cover', icon: Cloud },
    { id: 'wind', label: 'Wind Dynamics', icon: Wind },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Weather Map
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global precipitation radar, surface temperature, and atmospheric pressure.
          </p>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs overflow-x-auto custom-scrollbar">
          {layers.map((l) => {
            const Icon = l.icon;
            const isSelected = activeLayer === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Card */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map overlay controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 10);
              }
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700/60 shadow-lg transition-colors"
            title="Recenter on current city"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>

        {/* Layer Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-xs shadow-xl max-w-xs pointer-events-auto">
          <div className="font-semibold text-slate-200 flex items-center justify-between mb-1.5">
            <span className="capitalize">{activeLayer} Legend</span>
            <span className="text-[10px] text-sky-400 uppercase font-mono">Live</span>
          </div>

          {activeLayer === 'temperature' && (
            <div>
              <div className="w-48 h-2 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-600 mb-1" />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-10°C</span>
                <span>15°C</span>
                <span>35°C+</span>
              </div>
            </div>
          )}

          {activeLayer === 'precipitation' && (
            <div>
              <div className="w-48 h-2 rounded-full bg-gradient-to-r from-slate-600 via-cyan-400 via-blue-500 to-indigo-600 mb-1" />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Light drizzle</span>
                <span>Moderate</span>
                <span>Heavy rain</span>
              </div>
            </div>
          )}

          {activeLayer === 'clouds' && (
            <div>
              <div className="w-48 h-2 rounded-full bg-gradient-to-r from-sky-950 via-slate-600 to-slate-200 mb-1" />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Clear</span>
                <span>50%</span>
                <span>100% Overcast</span>
              </div>
            </div>
          )}

          {activeLayer === 'wind' && (
            <div>
              <div className="w-48 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 to-purple-600 mb-1" />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 km/h</span>
                <span>40 km/h</span>
                <span>90+ km/h</span>
              </div>
            </div>
          )}
        </div>

        {/* Click-to-inspect prompt banner */}
        {clickedLocation && (
          <div className="absolute top-4 left-4 z-20 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 text-xs shadow-2xl max-w-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold mb-1">
              <MapPin className="h-4 w-4" />
              <span>Inspect Coordinates</span>
            </div>
            <p className="text-slate-300 mb-3">
              Latitude: {clickedLocation.lat.toFixed(4)}°, Longitude: {clickedLocation.lng.toFixed(4)}°
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleJumpToClicked}
                disabled={isReverseLoading}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium transition-colors"
              >
                {isReverseLoading ? 'Locating...' : 'View Weather Here'}
              </button>
              <button
                onClick={() => setClickedLocation(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attribution & Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <p>
          Map tiles provided by CartoDB and OpenStreetMap. Click anywhere on the map to inspect weather coordinates and reverse-geocode localized forecasts worldwide.
        </p>
      </div>
    </div>
  );
};
