import React, { useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { getWeatherIcon } from '../../utils/weatherCodes';
import { formatTemperature, formatWindSpeed } from '../../utils/units';
import { formatTime } from '../../utils/dateTime';

export const HourlyForecastCarousel: React.FC = () => {
  const { weatherData, unitPreferences } = useWeather();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!weatherData || !weatherData.hourly.length) return null;

  const hourly = weatherData.hourly.slice(0, 24);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 shadow-xl">
      {/* Header with title and scroll controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">Hourly Forecast</h2>
          <span className="text-xs text-slate-400 font-medium">Next 24 Hours</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Scroll hourly forecast left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Scroll hourly forecast right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto custom-scrollbar pb-3 pt-1 scroll-smooth"
      >
        {hourly.map((item, idx) => {
          const isNow = idx === 0;
          const Icon = getWeatherIcon(item.weatherCode, item.isDay);
          const timeLabel = isNow
            ? 'Now'
            : formatTime(
                item.time,
                weatherData.timezone,
                unitPreferences.timeFormat === '12h'
              );

          return (
            <div
              key={`${item.time}-${idx}`}
              className={`flex flex-col items-center justify-between min-w-[85px] sm:min-w-[95px] p-3.5 rounded-2xl transition-all duration-200 select-none ${
                isNow
                  ? 'bg-gradient-to-b from-sky-500/20 to-indigo-500/10 border border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30'
              }`}
            >
              {/* Hour time */}
              <span
                className={`text-xs font-semibold ${
                  isNow ? 'text-sky-400' : 'text-slate-300'
                }`}
              >
                {timeLabel}
              </span>

              {/* Weather icon */}
              <div className="my-2.5 p-1 text-slate-200">
                <Icon className={`h-6 w-6 ${isNow ? 'text-sky-400' : 'text-slate-300'}`} />
              </div>

              {/* Temperature */}
              <span className="text-base sm:text-lg font-bold text-slate-100">
                {formatTemperature(item.temperature, unitPreferences.temperature)}
              </span>

              {/* Rain Chance */}
              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-sky-400">
                {item.precipitationProbability > 0 ? (
                  <>
                    <Droplets className="h-3 w-3" />
                    <span>{item.precipitationProbability}%</span>
                  </>
                ) : (
                  <span className="text-slate-600 dark:text-slate-500">0%</span>
                )}
              </div>

              {/* Wind speed */}
              <div className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-400 font-mono">
                <Wind className="h-2.5 w-2.5 text-slate-500" />
                <span>{formatWindSpeed(item.windSpeed, unitPreferences.windSpeed, false)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
