import React, { useState } from 'react';
import { CalendarDays, Clock, Filter, Droplets, Wind, Sun, ArrowUp, ArrowDown } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { DailyForecastList } from '../components/weather/DailyForecastList';
import { WeatherChartsView } from '../components/charts/WeatherChartsView';
import { DayDetailModal } from '../components/weather/DayDetailModal';
import { DashboardSkeleton } from '../components/ui/SkeletonLoaders';
import { getWeatherInfo, getWeatherIcon } from '../utils/weatherCodes';
import { formatTemperature, formatWindSpeed, getWindDirectionCompass } from '../utils/units';
import { formatTime, formatDate } from '../utils/dateTime';

export const ForecastPage: React.FC = () => {
  const { weatherData, currentLocation, unitPreferences, isLoading } = useWeather();
  const [hourlyDisplayCount, setHourlyDisplayCount] = useState<24 | 48>(24);

  if (isLoading || !weatherData) {
    return <DashboardSkeleton />;
  }

  const hours = weatherData.hourly.slice(0, hourlyDisplayCount);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Extended Forecast & Modeling
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detailed 48-hour hourly progression and multi-day synoptic projections for{' '}
            {currentLocation.name}.
          </p>
        </div>
      </div>

      {/* Meteorological Charts Section */}
      <WeatherChartsView />

      {/* 7-Day In-Depth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 w-full">
          <DailyForecastList />
        </div>

        {/* 48-Hour Expanded Breakdown */}
        <div className="lg:col-span-6 w-full rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-400" />
              <h2 className="text-base font-bold text-slate-100">Hourly Progression Table</h2>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-slate-800 text-xs">
              <button
                onClick={() => setHourlyDisplayCount(24)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  hourlyDisplayCount === 24
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setHourlyDisplayCount(48)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  hourlyDisplayCount === 48
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                48h
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-slate-800/60 pr-1">
            {hours.map((h, i) => {
              const Icon = getWeatherIcon(h.weatherCode, h.isDay);
              const info = getWeatherInfo(h.weatherCode);
              const timeStr = formatTime(
                h.time,
                weatherData.timezone,
                unitPreferences.timeFormat === '12h'
              );
              const dateStr = formatDate(h.time, weatherData.timezone, 'short');

              return (
                <div
                  key={`${h.time}-${i}`}
                  className="py-3 px-2 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/30 rounded-xl transition-colors"
                >
                  <div className="w-20 shrink-0">
                    <span className="font-semibold text-slate-200 block">{timeStr}</span>
                    <span className="text-[10px] text-slate-500">{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <Icon className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="truncate text-slate-300 font-medium">{info.label}</span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-slate-100 w-14 shrink-0 text-right">
                    {formatTemperature(h.temperature, unitPreferences.temperature)}
                  </div>

                  <div className="flex items-center gap-1 text-sky-400 font-medium w-12 shrink-0">
                    {h.precipitationProbability > 0 ? (
                      <>
                        <Droplets className="h-3 w-3" />
                        <span>{h.precipitationProbability}%</span>
                      </>
                    ) : (
                      <span className="text-slate-600">0%</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 w-24 shrink-0 justify-end font-mono">
                    <Wind className="h-3 w-3 text-slate-500" />
                    <span>{formatWindSpeed(h.windSpeed, unitPreferences.windSpeed, false)}</span>
                    <span className="text-[10px] text-slate-500">
                      {getWindDirectionCompass(h.windDirection)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DayDetailModal />
    </div>
  );
};
