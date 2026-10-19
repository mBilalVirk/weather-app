import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { LocationItem, WeatherData } from '../../types/weather';
import { DEFAULT_LOCATIONS } from '../../constants/defaultLocations';
import { fetchWeatherData, searchLocations } from '../../services/weatherService';
import { formatTemperature, formatWindSpeed, getWindDirectionCompass } from '../../utils/units';
import { getWeatherInfo, getWeatherIcon } from '../../utils/weatherCodes';

export const WeatherCompareView: React.FC = () => {
  const { currentLocation, unitPreferences, favorites } = useWeather();

  const [compareList, setCompareList] = useState<LocationItem[]>([
    currentLocation,
    DEFAULT_LOCATIONS.find((l) => l.name !== currentLocation.name) || DEFAULT_LOCATIONS[1],
  ]);

  const [weatherMap, setWeatherMap] = useState<Record<number, WeatherData>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch weather for compareList items
  useEffect(() => {
    compareList.forEach(async (loc) => {
      if (!weatherMap[loc.id] && !loadingMap[loc.id]) {
        setLoadingMap((prev) => ({ ...prev, [loc.id]: true }));
        try {
          const data = await fetchWeatherData(loc.latitude, loc.longitude, loc.timezone);
          setWeatherMap((prev) => ({ ...prev, [loc.id]: data }));
        } catch (e) {
          console.error('Failed to load compare weather', e);
        } finally {
          setLoadingMap((prev) => ({ ...prev, [loc.id]: false }));
        }
      }
    });
  }, [compareList]);

  // Handle city search to add
  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim() || val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchLocations(val);
      setSearchResults(results.slice(0, 5));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addCity = (loc: LocationItem) => {
    if (compareList.some((c) => c.id === loc.id)) return;
    if (compareList.length >= 3) {
      // replace last
      setCompareList([compareList[0], compareList[1], loc]);
    } else {
      setCompareList([...compareList, loc]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCity = (id: number) => {
    if (compareList.length <= 1) return;
    setCompareList(compareList.filter((c) => c.id !== id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GitCompare className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Compare Weather Conditions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Direct side-by-side meteorological comparison of up to 3 global cities.
          </p>
        </div>

        {/* Add city search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Add city to compare..."
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 text-sky-400 animate-spin" />
          )}

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => addCity(res)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800 text-slate-200"
                >
                  <span className="font-medium">{res.name}</span>
                  <span className="text-slate-500">{res.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compareList.map((loc, idx) => {
          const weather = weatherMap[loc.id];
          const isLoading = loadingMap[loc.id];

          if (isLoading || !weather) {
            return (
              <div
                key={loc.id}
                className="h-80 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col items-center justify-center animate-pulse"
              >
                <Loader2 className="h-6 w-6 text-sky-400 animate-spin mb-2" />
                <span className="text-xs text-slate-400">Loading {loc.name}...</span>
              </div>
            );
          }

          const current = weather.current;
          const info = getWeatherInfo(current.weatherCode);
          const Icon = getWeatherIcon(current.weatherCode, current.isDay);

          return (
            <div
              key={loc.id}
              className="p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-mono">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Location {idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">{loc.name}</h3>
                  <p className="text-xs text-slate-400">{loc.country || loc.country_code}</p>
                </div>

                {compareList.length > 1 && (
                  <button
                    onClick={() => removeCity(loc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove city"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Main Temp & Weather Icon */}
              <div className="my-5 flex items-center justify-between">
                <div>
                  <div className="text-5xl font-black text-white tracking-tighter">
                    {formatTemperature(current.temperature, unitPreferences.temperature)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Feels like {formatTemperature(current.feelsLike, unitPreferences.temperature)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 inline-block mb-1">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">{info.label}</div>
                </div>
              </div>

              {/* Comparative Metrics Table */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CloudRain className="h-3.5 w-3.5 text-cyan-400" /> Rain Probability
                  </span>
                  <span className="font-semibold text-slate-200">
                    {weather.daily[0]?.precipitationProbabilityMax ?? 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-sky-400" /> Wind Speed
                  </span>
                  <span className="font-semibold text-slate-200">
                    {formatWindSpeed(current.windSpeed, unitPreferences.windSpeed)}{' '}
                    <span className="text-slate-500">
                      {getWindDirectionCompass(current.windDirection)}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-blue-400" /> Humidity
                  </span>
                  <span className="font-semibold text-slate-200">
                    {current.relativeHumidity}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" /> UV Index
                  </span>
                  <span className="font-semibold text-slate-200">
                    {weather.daily[0]?.uvIndexMax.toFixed(1) ?? '--'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Presets */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Quick-Add Suggested Cities
        </h4>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_LOCATIONS.filter((l) => !compareList.some((c) => c.id === l.id)).map((loc) => (
            <button
              key={loc.id}
              onClick={() => addCity(loc)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="h-3 w-3 text-sky-400" />
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
