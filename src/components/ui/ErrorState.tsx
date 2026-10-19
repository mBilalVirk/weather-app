import React from 'react';
import { AlertTriangle, RefreshCw, MapPin } from 'lucide-react';
import { DEFAULT_LOCATIONS } from '../../constants/defaultLocations';
import { LocationItem } from '../../types/weather';

interface ErrorStateProps {
  message?: string | null;
  onRetry: () => void;
  onSelectFallback?: (loc: LocationItem) => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onSelectFallback,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900/80 border border-rose-500/30 text-center shadow-2xl">
      <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-400 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">Unable to Load Weather Data</h3>
      <p className="text-sm text-slate-400 mb-6">
        {message || 'A network error or rate limit occurred while reaching Open-Meteo services.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>

      {onSelectFallback && (
        <div className="pt-6 border-t border-slate-800 text-left">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Or select a preset city:
          </p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_LOCATIONS.slice(0, 4).map((loc) => (
              <button
                key={loc.id}
                onClick={() => onSelectFallback(loc)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="h-3 w-3 text-sky-400" />
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
