import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Info,
  ShieldAlert,
  Wind,
  Sparkles,
  TreeDeciduous,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useWeather } from '../../context/WeatherContext';
import { getUsAqiCategory } from '../../utils/units';
import { getPollutantDetails } from '../../services/weatherService';
import { formatTime } from '../../utils/dateTime';

export const AirQualityView: React.FC = () => {
  const { airQualityData, currentLocation, weatherData, unitPreferences } = useWeather();

  if (!airQualityData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl max-w-md mx-auto">
          <Activity className="h-8 w-8 text-sky-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-slate-200">Air Quality Telemetry</h3>
          <p className="text-xs text-slate-400 mt-1">
            Loading particulate sensors and atmospheric pollution indices for {currentLocation.name}...
          </p>
        </div>
      </div>
    );
  }

  const usAqiInfo = getUsAqiCategory(airQualityData.usAqi);
  const pollutants = getPollutantDetails(airQualityData);

  // Hourly AQI chart data
  const hourlyAqiData = airQualityData.hourly.map((h, i) => ({
    time:
      i === 0
        ? 'Now'
        : formatTime(
            h.time,
            weatherData?.timezone || airQualityData.timezone,
            unitPreferences.timeFormat === '12h'
          ),
    usAqi: h.usAqi,
    europeanAqi: h.europeanAqi,
    pm2_5: Number(h.pm2_5.toFixed(1)),
    pm10: Number(h.pm10.toFixed(1)),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Air Quality & Atmosphere
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live atmospheric purity and particulate measurements for {currentLocation.name},{' '}
            {currentLocation.country}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Standard: US EPA & EU CAQI</span>
        </div>
      </div>

      {/* Main AQI Hero & Health Guidance Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* US EPA AQI Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl ${usAqiInfo.bgClass} border ${usAqiInfo.borderClass} backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              US EPA Index
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${usAqiInfo.bgClass} ${usAqiInfo.textColor} border ${usAqiInfo.borderClass}`}
            >
              {usAqiInfo.label}
            </span>
          </div>

          <div className="my-6">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                {airQualityData.usAqi}
              </span>
              <span className="text-sm font-semibold text-slate-400">AQI</span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-3 mt-4 rounded-full bg-slate-800/80 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (airQualityData.usAqi / 300) * 100)}%`,
                  backgroundColor: usAqiInfo.color,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>0 (Good)</span>
              <span>150 (Sensitive)</span>
              <span>300+ (Hazardous)</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 font-medium">
            European CAQI Equivalent: <span className="font-bold text-white">{airQualityData.europeanAqi}</span>
          </div>
        </div>

        {/* Practical Health Guidance Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* General Population Guidance */}
          <div className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 mb-3">
                <TreeDeciduous className="h-5 w-5" />
                <h3 className="font-bold text-slate-100 text-sm">General Population</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs font-semibold text-slate-200 mb-3">
                {usAqiInfo.outdoorActivities}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {usAqiInfo.generalAdvice}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Suitable for regular outdoor exercise</span>
            </div>
          </div>

          {/* Sensitive Groups Guidance */}
          <div className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <HeartPulse className="h-5 w-5" />
                <h3 className="font-bold text-slate-100 text-sm">Sensitive Groups</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs font-semibold text-slate-200 mb-3">
                Asthma, Seniors, Children
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {usAqiInfo.sensitiveAdvice}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Monitor personal symptoms when outdoors</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour AQI Trend Chart */}
      {hourlyAqiData.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">24-Hour AQI Forecast Trend</h3>
              <p className="text-xs text-slate-400">Hourly progression of Air Quality Index</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyAqiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={usAqiInfo.color} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={usAqiInfo.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usAqi"
                  name="US AQI"
                  stroke={usAqiInfo.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#aqiGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pollutant Breakdown Bento Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Individual Pollutant Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400">WHO Air Quality Guidelines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutants.map((pollutant) => (
            <div
              key={pollutant.name}
              className="p-5 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-white">{pollutant.label}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${pollutant.color}20`,
                    color: pollutant.color,
                  }}
                >
                  {pollutant.statusLabel}
                </span>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white">{pollutant.value}</span>
                  <span className="text-xs text-slate-400 font-mono">{pollutant.unit}</span>
                </div>

                {pollutant.whoLimit && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    WHO Guideline Target: ≤ {pollutant.whoLimit} {pollutant.unit}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{pollutant.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
