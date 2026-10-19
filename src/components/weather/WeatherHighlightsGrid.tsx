import React from 'react';
import {
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import {
  formatWindSpeed,
  formatPressure,
  getWindDirectionCompass,
  getUvCategory,
  convertTemperature,
  formatTemperature,
} from '../../utils/units';
import { formatTime, calculateDayProgress } from '../../utils/dateTime';

export const WeatherHighlightsGrid: React.FC = () => {
  const { weatherData, unitPreferences } = useWeather();

  if (!weatherData) return null;

  const current = weatherData.current;
  const today = weatherData.daily[0];

  // UV info
  const uvVal = current.uvIndex ?? today?.uvIndexMax ?? 0;
  const uvInfo = getUvCategory(uvVal);

  // Sunrise / Sunset calculations
  const sunProgress = today
    ? calculateDayProgress(today.sunrise, today.sunset, current.time)
    : { progress: 50, isDay: true, daylightDurationFormatted: '--', timeRemaining: '--' };

  // Humidity comfort
  const getHumidityComfort = (hum: number) => {
    if (hum < 30) return { label: 'Dry air', desc: 'May cause dry skin & irritation' };
    if (hum <= 60) return { label: 'Comfortable', desc: 'Optimal humidity level' };
    if (hum <= 75) return { label: 'Humid', desc: 'Noticeably sticky atmosphere' };
    return { label: 'Very humid', desc: 'High moisture, muggy feel' };
  };
  const humComfort = getHumidityComfort(current.relativeHumidity);

  // Visibility status
  const currentHourly = weatherData.hourly[0];
  const visibilityKm = currentHourly?.visibility ?? 10;
  const visibilityMiles = visibilityKm * 0.621371;
  const visibilityDisplay =
    unitPreferences.windSpeed === 'mph'
      ? `${visibilityMiles.toFixed(1)} mi`
      : `${visibilityKm.toFixed(1)} km`;

  const getVisibilityStatus = (km: number) => {
    if (km >= 10) return 'Perfect visibility';
    if (km >= 5) return 'Good visibility';
    if (km >= 2) return 'Moderate haze or fog';
    return 'Low visibility (dense fog/mist)';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>Today's Weather Highlights</span>
        </h2>
        <span className="text-xs text-slate-400">Accurate surface telemetry</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. UV Index */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">UV Index</span>
            <Sun className="h-4 w-4 text-amber-400" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100">{Math.round(uvVal)}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${uvInfo.bgClass} ${uvInfo.textColor} border ${uvInfo.borderClass}`}
              >
                {uvInfo.label}
              </span>
            </div>

            {/* Gauge bar */}
            <div className="w-full h-2 mt-3 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (uvVal / 11) * 100)}%`,
                  backgroundColor: uvInfo.color,
                }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2">{uvInfo.advice}</p>
        </div>

        {/* 2. Wind & Gusts */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Wind</span>
            <Wind className="h-4 w-4 text-sky-400" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-extrabold text-slate-100 flex items-baseline gap-1">
              <span>{formatWindSpeed(current.windSpeed, unitPreferences.windSpeed)}</span>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
              <div
                className="p-1 rounded-full bg-sky-500/10 text-sky-400 transform transition-transform"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
                title={`${current.windDirection}°`}
              >
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-semibold">{getWindDirectionCompass(current.windDirection)}</span>
              <span className="text-slate-500">({current.windDirection}°)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Gusts up to {formatWindSpeed(current.windGusts, unitPreferences.windSpeed)}
          </p>
        </div>

        {/* 3. Sunrise & Sunset */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Sun Cycle</span>
            <Sunrise className="h-4 w-4 text-amber-400" />
          </div>

          <div className="my-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Sunrise className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {formatTime(
                    today?.sunrise,
                    weatherData.timezone,
                    unitPreferences.timeFormat === '12h'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Sunset className="h-3.5 w-3.5 text-orange-400" />
                <span>
                  {formatTime(
                    today?.sunset,
                    weatherData.timezone,
                    unitPreferences.timeFormat === '12h'
                  )}
                </span>
              </div>
            </div>

            {/* Sun progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-500"
                style={{ width: `${sunProgress.progress}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400">{sunProgress.timeRemaining}</p>
        </div>

        {/* 4. Humidity & Dew Point */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
            <Droplets className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100">
                {current.relativeHumidity}%
              </span>
              <span className="text-xs font-semibold text-cyan-400">
                {humComfort.label}
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-300">
              Dew point:{' '}
              <span className="font-semibold text-slate-100">
                {formatTemperature(currentHourly?.dewPoint, unitPreferences.temperature)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">{humComfort.desc}</p>
        </div>

        {/* 5. Visibility */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Visibility</span>
            <Eye className="h-4 w-4 text-indigo-400" />
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-100">
              {visibilityDisplay}
            </span>
          </div>

          <p className="text-xs text-slate-400">{getVisibilityStatus(visibilityKm)}</p>
        </div>

        {/* 6. Pressure */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pressure</span>
            <Gauge className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-100">
              {formatPressure(current.pressureMsl, unitPreferences.pressure)}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {current.pressureMsl > 1013
              ? 'High pressure • Stable conditions'
              : 'Low pressure • Possible precipitation'}
          </p>
        </div>

        {/* 7. Cloud Cover */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cloud Cover</span>
            <Cloud className="h-4 w-4 text-sky-400" />
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-100">
              {current.cloudCover}%
            </span>

            {/* Cloud visual percentage bar */}
            <div className="w-full h-2 mt-3 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-slate-400 transition-all duration-500"
                style={{ width: `${current.cloudCover}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {current.cloudCover < 20
              ? 'Clear skies'
              : current.cloudCover < 60
              ? 'Partly cloudy'
              : 'Overcast skies'}
          </p>
        </div>

        {/* 8. Precipitation */}
        <div className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Precipitation</span>
            <CloudRain className="h-4 w-4 text-blue-400" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100">
                {current.precipitation} mm
              </span>
              <span className="text-xs text-slate-400 font-medium">in last hr</span>
            </div>

            <div className="mt-2 text-xs text-slate-300">
              Today's expected total:{' '}
              <span className="font-semibold text-slate-100">
                {today?.precipitationSum ?? 0} mm
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Chance today: {today?.precipitationProbabilityMax ?? 0}%
          </p>
        </div>
      </div>
    </div>
  );
};
