import React from 'react';
import {
  Settings,
  Thermometer,
  Wind,
  Droplets,
  Clock,
  Gauge,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  Star,
  MapPin,
  Check,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import {
  TemperatureUnit,
  WindSpeedUnit,
  PrecipitationUnit,
  PressureUnit,
  TimeFormat,
  AppTheme,
} from '../../types/weather';

export const SettingsView: React.FC = () => {
  const {
    unitPreferences,
    updateUnitPreferences,
    theme,
    setTheme,
    favorites,
    removeFavorite,
    selectLocation,
    clearRecentSearches,
    recentSearches,
  } = useWeather();

  const handleReset = () => {
    updateUnitPreferences({
      temperature: 'celsius',
      windSpeed: 'kmh',
      precipitation: 'mm',
      pressure: 'hPa',
      timeFormat: '12h',
    });
    setTheme('dark');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
            <Settings className="h-5 w-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Preferences & Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize measurement standards, time formatting, and saved meteorological locations.
        </p>
      </div>

      {/* Measurement Units Bento */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>Units of Measurement</span>
        </h2>

        {/* 1. Temperature */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Thermometer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">Temperature Scale</div>
              <div className="text-xs text-slate-400">Celsius (°C) or Fahrenheit (°F)</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 self-start sm:self-auto">
            {(['celsius', 'fahrenheit'] as TemperatureUnit[]).map((u) => (
              <button
                key={u}
                onClick={() => updateUnitPreferences({ temperature: u })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  unitPreferences.temperature === u
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {u === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Wind Speed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">Wind Velocity</div>
              <div className="text-xs text-slate-400">Select preferred wind speed unit</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 overflow-x-auto self-start sm:self-auto">
            {(
              [
                { id: 'kmh', label: 'km/h' },
                { id: 'mph', label: 'mph' },
                { id: 'ms', label: 'm/s' },
                { id: 'knots', label: 'knots' },
              ] as { id: WindSpeedUnit; label: string }[]
            ).map((w) => (
              <button
                key={w.id}
                onClick={() => updateUnitPreferences({ windSpeed: w.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  unitPreferences.windSpeed === w.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Precipitation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">Precipitation Volume</div>
              <div className="text-xs text-slate-400">Rainfall depth measurement</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 self-start sm:self-auto">
            {(
              [
                { id: 'mm', label: 'Millimeters (mm)' },
                { id: 'inch', label: 'Inches (in)' },
              ] as { id: PrecipitationUnit; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => updateUnitPreferences({ precipitation: p.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  unitPreferences.precipitation === p.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Time Format */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">Clock Format</div>
              <div className="text-xs text-slate-400">12-hour (AM/PM) or 24-hour military time</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 self-start sm:self-auto">
            {(['12h', '24h'] as TimeFormat[]).map((t) => (
              <button
                key={t}
                onClick={() => updateUnitPreferences({ timeFormat: t })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  unitPreferences.timeFormat === t
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t} Clock
              </button>
            ))}
          </div>
        </div>

        {/* 5. Pressure */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">Atmospheric Pressure</div>
              <div className="text-xs text-slate-400">Barometric standard</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 self-start sm:self-auto">
            {(
              [
                { id: 'hPa', label: 'Hectopascals (hPa)' },
                { id: 'inHg', label: 'Inches of Mercury (inHg)' },
              ] as { id: PressureUnit; label: string }[]
            ).map((pr) => (
              <button
                key={pr.id}
                onClick={() => updateUnitPreferences({ pressure: pr.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  unitPreferences.pressure === pr.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Appearance */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>Appearance</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System Default', icon: Settings },
            ] as { id: AppTheme; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500/50 text-white'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="font-semibold text-sm">{t.label}</span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Favorites Manager */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>Saved Favorite Places</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{favorites.length} saved</span>
        </div>

        {favorites.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No favorite locations saved yet.</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/70 transition-colors"
              >
                <button
                  onClick={() => selectLocation(fav)}
                  className="flex items-center gap-2.5 text-left flex-1"
                >
                  <MapPin className="h-4 w-4 text-sky-400" />
                  <div>
                    <span className="font-semibold text-sm text-slate-100">{fav.name}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {[fav.admin1, fav.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset & Storage management */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="h-4 w-4 text-sky-400" />
          <span>Reset All Units to Defaults</span>
        </button>

        {recentSearches.length > 0 && (
          <button
            onClick={clearRecentSearches}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear Search History ({recentSearches.length})
          </button>
        )}
      </div>
    </div>
  );
};
