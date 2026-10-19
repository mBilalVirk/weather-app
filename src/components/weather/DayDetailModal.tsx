import React, { useEffect } from 'react';
import {
  X,
  Sunrise,
  Sunset,
  Droplets,
  Wind,
  Sun,
  Compass,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { getWeatherInfo, getWeatherIcon } from '../../utils/weatherCodes';
import {
  formatTemperature,
  formatWindSpeed,
  formatPrecipitation,
  getWindDirectionCompass,
  getUvCategory,
} from '../../utils/units';
import { getDayName, formatDate, formatTime } from '../../utils/dateTime';

export const DayDetailModal: React.FC = () => {
  const { selectedDay, setSelectedDay, weatherData, unitPreferences } = useWeather();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedDay(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedDay]);

  if (!selectedDay || !weatherData) return null;

  const dayName = getDayName(selectedDay.date, weatherData.timezone);
  const dateStr = formatDate(selectedDay.date, weatherData.timezone, 'full');
  const weatherInfo = getWeatherInfo(selectedDay.weatherCode);
  const Icon = getWeatherIcon(selectedDay.weatherCode, true);
  const uvInfo = getUvCategory(selectedDay.uvIndexMax);

  // Filter hours that fall on selectedDay date (matching YYYY-MM-DD prefix)
  const dayHours = weatherData.hourly.filter((h) => h.time.startsWith(selectedDay.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-detail-title"
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedDay(null)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <h3 id="day-detail-title" className="text-xl sm:text-2xl font-bold text-white">
              {dayName} Forecast
            </h3>
            <p className="text-sm text-slate-400">{dateStr}</p>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-200 border border-slate-700">
              <span>{weatherInfo.label}</span>
              <span>•</span>
              <span className="text-slate-400">{weatherInfo.description}</span>
            </div>
          </div>
        </div>

        {/* Temperature overview banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 mb-6 text-center">
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
              <ArrowUp className="h-3 w-3 text-rose-400" />
              <span>Max Temp</span>
            </div>
            <div className="text-xl font-bold text-rose-400">
              {formatTemperature(selectedDay.tempMax, unitPreferences.temperature)}
            </div>
            <div className="text-[10px] text-slate-500">
              Feels {formatTemperature(selectedDay.apparentTempMax, unitPreferences.temperature)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
              <ArrowDown className="h-3 w-3 text-sky-400" />
              <span>Min Temp</span>
            </div>
            <div className="text-xl font-bold text-sky-400">
              {formatTemperature(selectedDay.tempMin, unitPreferences.temperature)}
            </div>
            <div className="text-[10px] text-slate-500">
              Feels {formatTemperature(selectedDay.apparentTempMin, unitPreferences.temperature)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
              <Droplets className="h-3 w-3 text-cyan-400" />
              <span>Precipitation</span>
            </div>
            <div className="text-xl font-bold text-cyan-400">
              {selectedDay.precipitationProbabilityMax}%
            </div>
            <div className="text-[10px] text-slate-500">
              {formatPrecipitation(selectedDay.precipitationSum, unitPreferences.precipitation)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1">
              <Wind className="h-3 w-3 text-indigo-400" />
              <span>Max Wind</span>
            </div>
            <div className="text-xl font-bold text-indigo-400">
              {formatWindSpeed(selectedDay.windSpeedMax, unitPreferences.windSpeed)}
            </div>
            <div className="text-[10px] text-slate-500">
              {getWindDirectionCompass(selectedDay.windDirectionDominant)}
            </div>
          </div>
        </div>

        {/* Sun & UV Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Sun Schedule
            </span>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                <Sunrise className="h-4 w-4 text-amber-400" /> Sunrise
              </span>
              <span className="font-mono font-medium text-white">
                {formatTime(selectedDay.sunrise, weatherData.timezone, unitPreferences.timeFormat === '12h')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                <Sunset className="h-4 w-4 text-orange-400" /> Sunset
              </span>
              <span className="font-mono font-medium text-white">
                {formatTime(selectedDay.sunset, weatherData.timezone, unitPreferences.timeFormat === '12h')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Peak UV Index
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">
                {selectedDay.uvIndexMax.toFixed(1)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${uvInfo.bgClass} ${uvInfo.textColor}`}>
                {uvInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">{uvInfo.advice}</p>
          </div>
        </div>

        {/* Hourly Breakdown for this Day (if available) */}
        {dayHours.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Hourly Breakdown for {dayName}</span>
            </h4>

            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {dayHours.map((h, i) => {
                const HIcon = getWeatherIcon(h.weatherCode, h.isDay);
                return (
                  <div
                    key={`${h.time}-${i}`}
                    className="flex flex-col items-center min-w-[70px] p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center"
                  >
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatTime(h.time, weatherData.timezone, unitPreferences.timeFormat === '12h')}
                    </span>
                    <HIcon className="h-5 w-5 my-2 text-sky-400" />
                    <span className="text-xs font-bold text-white">
                      {formatTemperature(h.temperature, unitPreferences.temperature)}
                    </span>
                    <span className="text-[10px] text-sky-400 mt-1">
                      {h.precipitationProbability}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
