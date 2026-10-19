import React from 'react';
import { Cloud, ExternalLink, Heart, Globe, ShieldCheck } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const Footer: React.FC = () => {
  const { currentLocation, weatherData } = useWeather();

  return (
    <footer className="mt-16 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Attribution */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Cloud className="h-4 w-4 text-sky-400" />
              <span>SkyCast Meteorological Systems</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>
              Real-time atmospheric data provided by{' '}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline inline-flex items-center gap-0.5"
              >
                Open-Meteo API
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
          </div>

          {/* Location Coordinates & Attribution */}
          {currentLocation && (
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                <span>
                  {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
                </span>
              </div>
              <span>•</span>
              <span>{weatherData?.timezone || currentLocation.timezone || 'UTC'}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
          <p>© {new Date().getFullYear()} SkyCast. Built for accuracy and weather precision.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live API Sync Active
            </span>
            <span>Maps: © OpenStreetMap contributors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
