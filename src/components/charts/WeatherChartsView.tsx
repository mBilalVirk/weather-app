import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Calendar,
  Layers,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import {
  convertTemperature,
  convertWindSpeed,
  formatTemperature,
  formatWindSpeed,
} from '../../utils/units';
import { formatTime, getDayName } from '../../utils/dateTime';

type ChartMetric = 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'daily';

export const WeatherChartsView: React.FC = () => {
  const { weatherData, unitPreferences } = useWeather();
  const [metric, setMetric] = useState<ChartMetric>('temperature');

  if (!weatherData) return null;

  // 24-hour dataset for hourly charts
  const hourlyData = weatherData.hourly.slice(0, 24).map((h, i) => {
    const timeLabel =
      i === 0
        ? 'Now'
        : formatTime(
            h.time,
            weatherData.timezone,
            unitPreferences.timeFormat === '12h'
          );

    return {
      time: timeLabel,
      rawTime: h.time,
      temp: Number(convertTemperature(h.temperature, unitPreferences.temperature).toFixed(1)),
      feelsLike: Number(convertTemperature(h.feelsLike, unitPreferences.temperature).toFixed(1)),
      pop: h.precipitationProbability,
      precip: h.precipitation,
      wind: Number(convertWindSpeed(h.windSpeed, unitPreferences.windSpeed).toFixed(1)),
      gusts: Number(convertWindSpeed(h.windGusts || h.windSpeed * 1.3, unitPreferences.windSpeed).toFixed(1)),
      humidity: h.humidity,
      dewPoint: Number(convertTemperature(h.dewPoint, unitPreferences.temperature).toFixed(1)),
    };
  });

  // Daily dataset for 7-day high/low comparison
  const dailyData = weatherData.daily.map((d, i) => ({
    day: i === 0 ? 'Today' : getDayName(d.date, weatherData.timezone),
    high: Number(convertTemperature(d.tempMax, unitPreferences.temperature).toFixed(1)),
    low: Number(convertTemperature(d.tempMin, unitPreferences.temperature).toFixed(1)),
    pop: d.precipitationProbabilityMax,
    wind: Number(convertWindSpeed(d.windSpeedMax, unitPreferences.windSpeed).toFixed(1)),
  }));

  const tempSymbol = unitPreferences.temperature === 'fahrenheit' ? '°F' : '°C';
  const windUnitLabel =
    unitPreferences.windSpeed === 'mph'
      ? 'mph'
      : unitPreferences.windSpeed === 'ms'
      ? 'm/s'
      : unitPreferences.windSpeed === 'knots'
      ? 'kt'
      : 'km/h';

  const chartTabs: { id: ChartMetric; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'temperature', label: 'Hourly Temperature', icon: Thermometer },
    { id: 'precipitation', label: 'Precipitation Chance', icon: CloudRain },
    { id: 'wind', label: 'Wind Speed & Gusts', icon: Wind },
    { id: 'humidity', label: 'Humidity & Dew Point', icon: Droplets },
    { id: 'daily', label: '7-Day High / Low Range', icon: Calendar },
  ];

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            <h2 className="text-lg font-bold text-slate-100">Meteorological Charts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-variable trends from atmospheric models
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          {chartTabs.map((t) => {
            const Icon = t.icon;
            const isSelected = metric === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMetric(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full">
        {metric === 'temperature' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit={tempSymbol} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="temp"
                name={`Temperature (${tempSymbol})`}
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
              <Area
                type="monotone"
                dataKey="feelsLike"
                name={`Feels Like (${tempSymbol})`}
                stroke="#818cf8"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#feelsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {metric === 'precipitation' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                dataKey="pop"
                name="Rain Probability (%)"
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {metric === 'wind' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit={` ${windUnitLabel}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="wind"
                name={`Sustained Wind (${windUnitLabel})`}
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="gusts"
                name={`Peak Gusts (${windUnitLabel})`}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {metric === 'humidity' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="humidity"
                name="Relative Humidity (%)"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#humidityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {metric === 'daily' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit={tempSymbol} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                dataKey="high"
                name={`High Temp (${tempSymbol})`}
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="low"
                name={`Low Temp (${tempSymbol})`}
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
