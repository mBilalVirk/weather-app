import React from 'react';
import {
  MapPin,
  Star,
  Wind,
  Droplets,
  CloudRain,
  Clock,
  Compass,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import {
  getWeatherInfo,
  getWeatherIcon,
} from '../../utils/weatherCodes';
import {
  formatTemperature,
  formatWindSpeed,
  getWindDirectionCompass,
} from '../../utils/units';
import { formatTime, formatDate } from '../../utils/dateTime';

export const CurrentWeatherHero: React.FC = () => {
  const {
    currentLocation,
    weatherData,
    unitPreferences,
    isFavorite,
    toggleFavorite,
    theme,
  } = useWeather();

  if (!weatherData) return null;

  const current = weatherData.current;
  const todayForecast = weatherData.daily[0];
  const weatherInfo = getWeatherInfo(current.weatherCode);
  const WeatherIconComponent = getWeatherIcon(current.weatherCode, current.isDay);
  const isFav = isFavorite(currentLocation.id);

  const localTimeStr = formatTime(
    current.time,
    weatherData.timezone,
    unitPreferences.timeFormat === '12h'
  );
  const localDateStr = formatDate(current.time, weatherData.timezone, 'medium');

  // Dynamic hero gradient according to day/night & weather category
  const gradientClass =
    theme === 'dark' || document.documentElement.classList.contains('dark')
      ? weatherInfo.gradientDark
      : weatherInfo.gradientLight;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-br ${gradientClass} border border-white/10 dark:border-slate-800 shadow-2xl backdrop-blur-2xl transition-all duration-500`}
    >
      {/* Decorative background weather glow */}
      <div
        className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: weatherInfo.accentColor }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full gap-8">
        {/* Top bar: Location details + Time & Favorite action */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
                <MapPin className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {currentLocation.name}
              </h1>
              <button
                type="button"
                onClick={() => toggleFavorite(currentLocation)}
                className="p-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-slate-800/80 text-slate-400 hover:text-amber-400 transition-colors"
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`h-5 w-5 ${
                    isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
              <span>{[currentLocation.admin1, currentLocation.country].filter(Boolean).join(', ')}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs uppercase tracking-wider font-mono text-slate-500">
                {current.isDay ? 'Daytime' : 'Night'}
              </span>
            </p>
          </div>

          {/* Time & date pill */}
          <div className="flex items-center gap-3 self-start px-3.5 py-1.5 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 backdrop-blur-md text-xs font-medium text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-sky-500" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold">{localTimeStr}</span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400">{localDateStr}</span>
            </div>
          </div>
        </div>

        {/* Center: Large Temperature & Condition Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 my-2">
          <div className="flex items-baseline gap-4">
            <div className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white">
              {formatTemperature(current.temperature, unitPreferences.temperature, false)}
              <span className="text-4xl sm:text-5xl font-light text-sky-500">°</span>
            </div>

            <div className="flex flex-col">
              <div className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">
                Feels like{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatTemperature(current.feelsLike, unitPreferences.temperature)}
                </span>
              </div>
              {todayForecast && (
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 font-medium text-rose-500 dark:text-rose-400">
                    <ArrowUp className="h-3.5 w-3.5" />
                    {formatTemperature(todayForecast.tempMax, unitPreferences.temperature)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 font-medium text-sky-500 dark:text-sky-400">
                    <ArrowDown className="h-3.5 w-3.5" />
                    {formatTemperature(todayForecast.tempMin, unitPreferences.temperature)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Condition Icon & Description badge */}
          <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 dark:border-white/5 self-start md:self-auto">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-500 dark:text-sky-400 animate-float">
              <WeatherIconComponent className="h-10 w-10 stroke-[2]" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {weatherInfo.label}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] line-clamp-1">
                {weatherInfo.description}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hero Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/5 dark:border-white/10 text-xs sm:text-sm">
          {/* Wind */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/30 dark:bg-slate-900/40">
            <Wind className="h-4 w-4 text-sky-500 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                Wind
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {formatWindSpeed(current.windSpeed, unitPreferences.windSpeed)}{' '}
                <span className="text-[11px] font-mono text-slate-400">
                  {getWindDirectionCompass(current.windDirection)}
                </span>
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/30 dark:bg-slate-900/40">
            <Droplets className="h-4 w-4 text-cyan-500 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                Humidity
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {current.relativeHumidity}%
              </div>
            </div>
          </div>

          {/* Rain / Precipitation Chance */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/30 dark:bg-slate-900/40">
            <CloudRain className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                Precipitation
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {todayForecast ? `${todayForecast.precipitationProbabilityMax}%` : `${current.precipitation} mm`}
              </div>
            </div>
          </div>

          {/* Cloud Cover */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/30 dark:bg-slate-900/40">
            <Compass className="h-4 w-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                Cloud Cover
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {current.cloudCover}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
