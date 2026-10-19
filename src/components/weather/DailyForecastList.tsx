import React from 'react';
import {
  CalendarDays,
  Droplets,
  ChevronRight,
  Wind,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { getWeatherInfo, getWeatherIcon } from '../../utils/weatherCodes';
import { formatTemperature } from '../../utils/units';
import { getDayName, formatDate } from '../../utils/dateTime';
import { DailyForecastItem } from '../../types/weather';

interface DailyForecastListProps {
  onSelectDay?: (day: DailyForecastItem) => void;
}

export const DailyForecastList: React.FC<DailyForecastListProps> = ({ onSelectDay }) => {
  const { weatherData, unitPreferences, setSelectedDay } = useWeather();

  if (!weatherData || !weatherData.daily.length) return null;

  const daily = weatherData.daily;

  // Calculate week-wide min and max for the relative temperature bars
  const weekMin = Math.min(...daily.map((d) => d.tempMin));
  const weekMax = Math.max(...daily.map((d) => d.tempMax));
  const tempSpan = Math.max(1, weekMax - weekMin);

  const handleDayClick = (day: DailyForecastItem) => {
    setSelectedDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">7-Day Forecast</h2>
        </div>
        <span className="text-xs text-slate-400">Click a day for details</span>
      </div>

      {/* Days List */}
      <div className="divide-y divide-slate-800/50">
        {daily.map((day, idx) => {
          const isToday = idx === 0;
          const dayName = isToday ? 'Today' : getDayName(day.date, weatherData.timezone);
          const dateStr = formatDate(day.date, weatherData.timezone, 'short');
          const info = getWeatherInfo(day.weatherCode);
          const Icon = getWeatherIcon(day.weatherCode, true);

          // Calculate bar offsets
          const leftPercent = ((day.tempMin - weekMin) / tempSpan) * 100;
          const widthPercent = Math.max(8, ((day.tempMax - day.tempMin) / tempSpan) * 100);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => handleDayClick(day)}
              className="w-full py-3.5 px-2 rounded-2xl flex items-center justify-between gap-3 text-left hover:bg-slate-800/50 active:scale-[0.99] transition-all group"
            >
              {/* Day Name & Date */}
              <div className="w-24 sm:w-28 shrink-0">
                <div
                  className={`text-sm font-semibold ${
                    isToday ? 'text-sky-400' : 'text-slate-200'
                  }`}
                >
                  {dayName}
                </div>
                <div className="text-[11px] text-slate-400">{dateStr}</div>
              </div>

              {/* Weather icon & Condition */}
              <div className="flex items-center gap-2 sm:gap-3 w-32 sm:w-40 shrink-0">
                <div className="p-1 text-slate-200">
                  <Icon className="h-5 w-5 text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs text-slate-300 font-medium truncate hidden sm:inline">
                  {info.label}
                </span>
                {day.precipitationProbabilityMax > 15 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-sky-400">
                    <Droplets className="h-3 w-3" />
                    {day.precipitationProbabilityMax}%
                  </span>
                )}
              </div>

              {/* Temperature Range Bar */}
              <div className="flex-1 flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 w-9 text-right shrink-0">
                  {formatTemperature(day.tempMin, unitPreferences.temperature)}
                </span>

                <div className="flex-1 h-2 rounded-full bg-slate-800/80 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 shadow-sm"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold text-slate-100 w-9 text-left shrink-0">
                  {formatTemperature(day.tempMax, unitPreferences.temperature)}
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
