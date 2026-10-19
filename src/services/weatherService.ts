import {
  WeatherData,
  AirQualityData,
  LocationItem,
  AirQualityPollutant,
  AirQualityHourlyItem,
} from '../types/weather';

// In-memory cache with timestamps
interface CacheItem<T> {
  data: T;
  timestamp: number;
}
const cache = new Map<string, CacheItem<unknown>>();

const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const AIR_QUALITY_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const GEOCODING_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getFromCache<T>(key: string, ttl: number): T | null {
  const cached = cache.get(key) as CacheItem<T> | undefined;
  if (!cached) return null;
  if (Date.now() - cached.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setInCache<T>(key: string, data: T): void {
  // Prune cache if it gets too large (> 100 entries)
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch complete real-time, hourly, and daily weather from Open-Meteo API
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  timezone = 'auto',
  signal?: AbortSignal
): Promise<WeatherData> {
  const roundedLat = Number(latitude.toFixed(4));
  const roundedLon = Number(longitude.toFixed(4));
  const cacheKey = `weather_${roundedLat}_${roundedLon}_${timezone}`;

  const cached = getFromCache<WeatherData>(cacheKey, WEATHER_CACHE_TTL);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    latitude: roundedLat.toString(),
    longitude: roundedLon.toString(),
    timezone: timezone || 'auto',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'surface_pressure',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'is_day',
      'cloud_cover',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'daylight_duration',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'wind_gusts_10m_max',
    ].join(','),
    forecast_days: '8',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Weather service responded with status ${response.status}`);
  }

  const raw = await response.json();

  // Parse Hourly data
  const hourlyTimes: string[] = raw.hourly?.time || [];
  const hourly = hourlyTimes.slice(0, 48).map((timeStr: string, idx: number) => ({
    time: timeStr,
    temperature: raw.hourly.temperature_2m?.[idx] ?? 0,
    feelsLike: raw.hourly.apparent_temperature?.[idx] ?? 0,
    weatherCode: raw.hourly.weather_code?.[idx] ?? 0,
    precipitationProbability: raw.hourly.precipitation_probability?.[idx] ?? 0,
    precipitation: raw.hourly.precipitation?.[idx] ?? 0,
    windSpeed: raw.hourly.wind_speed_10m?.[idx] ?? 0,
    windDirection: raw.hourly.wind_direction_10m?.[idx] ?? 0,
    windGusts: raw.hourly.wind_gusts_10m?.[idx] ?? 0,
    uvIndex: raw.hourly.uv_index?.[idx] ?? 0,
    humidity: raw.hourly.relative_humidity_2m?.[idx] ?? 0,
    dewPoint: raw.hourly.dew_point_2m?.[idx] ?? 0,
    visibility: raw.hourly.visibility?.[idx] ? raw.hourly.visibility[idx] / 1000 : 10, // convert meters to km
    isDay: Boolean(raw.hourly.is_day?.[idx] ?? 1),
    cloudCover: raw.hourly.cloud_cover?.[idx] ?? 0,
    pressureMsl: raw.hourly.pressure_msl?.[idx] ?? 1013,
  }));

  // Parse Daily data
  const dailyDates: string[] = raw.daily?.time || [];
  const daily = dailyDates.slice(0, 7).map((dateStr: string, idx: number) => ({
    date: dateStr,
    weatherCode: raw.daily.weather_code?.[idx] ?? 0,
    tempMax: raw.daily.temperature_2m_max?.[idx] ?? 0,
    tempMin: raw.daily.temperature_2m_min?.[idx] ?? 0,
    apparentTempMax: raw.daily.apparent_temperature_max?.[idx] ?? 0,
    apparentTempMin: raw.daily.apparent_temperature_min?.[idx] ?? 0,
    sunrise: raw.daily.sunrise?.[idx] ?? '',
    sunset: raw.daily.sunset?.[idx] ?? '',
    daylightDuration: raw.daily.daylight_duration?.[idx] ?? 0,
    uvIndexMax: raw.daily.uv_index_max?.[idx] ?? 0,
    precipitationSum: raw.daily.precipitation_sum?.[idx] ?? 0,
    precipitationProbabilityMax: raw.daily.precipitation_probability_max?.[idx] ?? 0,
    windSpeedMax: raw.daily.wind_speed_10m_max?.[idx] ?? 0,
    windDirectionDominant: raw.daily.wind_direction_10m_dominant?.[idx] ?? 0,
    windGustsMax: raw.daily.wind_gusts_10m_max?.[idx] ?? 0,
  }));

  const currentUvIndex = hourly[0]?.uvIndex ?? 0;

  const result: WeatherData = {
    latitude: raw.latitude,
    longitude: raw.longitude,
    elevation: raw.elevation ?? 0,
    timezone: raw.timezone || timezone,
    timezoneAbbreviation: raw.timezone_abbreviation || 'UTC',
    utcOffsetSeconds: raw.utc_offset_seconds || 0,
    current: {
      time: raw.current?.time || new Date().toISOString(),
      temperature: raw.current?.temperature_2m ?? 0,
      feelsLike: raw.current?.apparent_temperature ?? 0,
      weatherCode: raw.current?.weather_code ?? 0,
      isDay: Boolean(raw.current?.is_day ?? 1),
      relativeHumidity: raw.current?.relative_humidity_2m ?? 0,
      precipitation: raw.current?.precipitation ?? 0,
      rain: raw.current?.rain ?? 0,
      showers: raw.current?.showers ?? 0,
      snowfall: raw.current?.snowfall ?? 0,
      cloudCover: raw.current?.cloud_cover ?? 0,
      pressureMsl: raw.current?.pressure_msl ?? 1013,
      surfacePressure: raw.current?.surface_pressure ?? 1013,
      windSpeed: raw.current?.wind_speed_10m ?? 0,
      windDirection: raw.current?.wind_direction_10m ?? 0,
      windGusts: raw.current?.wind_gusts_10m ?? 0,
      uvIndex: currentUvIndex,
    },
    hourly,
    daily,
    lastUpdated: new Date().toISOString(),
  };

  setInCache(cacheKey, result);
  return result;
}

/**
 * Fetch real air quality information from Open-Meteo Air Quality API
 */
export async function fetchAirQualityData(
  latitude: number,
  longitude: number,
  timezone = 'auto',
  signal?: AbortSignal
): Promise<AirQualityData> {
  const roundedLat = Number(latitude.toFixed(4));
  const roundedLon = Number(longitude.toFixed(4));
  const cacheKey = `air_quality_${roundedLat}_${roundedLon}_${timezone}`;

  const cached = getFromCache<AirQualityData>(cacheKey, AIR_QUALITY_CACHE_TTL);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    latitude: roundedLat.toString(),
    longitude: roundedLon.toString(),
    timezone: timezone || 'auto',
    current: [
      'european_aqi',
      'us_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'dust',
      'uv_index',
    ].join(','),
    hourly: [
      'european_aqi',
      'us_aqi',
      'pm10',
      'pm2_5',
      'nitrogen_dioxide',
      'ozone',
      'sulphur_dioxide',
    ].join(','),
    forecast_days: '2',
  });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Air quality service returned error code ${response.status}`);
  }

  const raw = await response.json();

  const hourlyTimes: string[] = raw.hourly?.time || [];
  const hourly: AirQualityHourlyItem[] = hourlyTimes.slice(0, 24).map((timeStr, idx) => ({
    time: timeStr,
    usAqi: raw.hourly.us_aqi?.[idx] ?? 0,
    europeanAqi: raw.hourly.european_aqi?.[idx] ?? 0,
    pm2_5: raw.hourly.pm2_5?.[idx] ?? 0,
    pm10: raw.hourly.pm10?.[idx] ?? 0,
    nitrogenDioxide: raw.hourly.nitrogen_dioxide?.[idx] ?? 0,
    ozone: raw.hourly.ozone?.[idx] ?? 0,
    sulphurDioxide: raw.hourly.sulphur_dioxide?.[idx] ?? 0,
  }));

  const result: AirQualityData = {
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone || timezone,
    usAqi: raw.current?.us_aqi ?? 35,
    europeanAqi: raw.current?.european_aqi ?? 20,
    pm2_5: raw.current?.pm2_5 ?? 8.5,
    pm10: raw.current?.pm10 ?? 14.2,
    nitrogenDioxide: raw.current?.nitrogen_dioxide ?? 12.0,
    ozone: raw.current?.ozone ?? 45.0,
    sulphurDioxide: raw.current?.sulphur_dioxide ?? 4.0,
    carbonMonoxide: raw.current?.carbon_monoxide ?? 250,
    dust: raw.current?.dust ?? 5.0,
    uvIndex: raw.current?.uv_index ?? 3,
    hourly,
    lastUpdated: new Date().toISOString(),
  };

  setInCache(cacheKey, result);
  return result;
}

/**
 * Search locations via Open-Meteo Geocoding API
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationItem[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = `geo_search_${trimmed.toLowerCase()}`;
  const cached = getFromCache<LocationItem[]>(cacheKey, GEOCODING_CACHE_TTL);
  if (cached) return cached;

  const params = new URLSearchParams({
    name: trimmed,
    count: '10',
    language: 'en',
    format: 'json',
  });

  const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Location search failed with status ${response.status}`);
  }

  const data = await response.json();
  const results: LocationItem[] = data.results || [];

  setInCache(cacheKey, results);
  return results;
}

/**
 * Reverse geocode coordinate into city / place name
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<LocationItem> {
  const roundedLat = Number(latitude.toFixed(4));
  const roundedLon = Number(longitude.toFixed(4));
  const cacheKey = `reverse_geo_${roundedLat}_${roundedLon}`;

  const cached = getFromCache<LocationItem>(cacheKey, GEOCODING_CACHE_TTL);
  if (cached) return cached;

  // Try BigDataCloud free client-side reverse geocoding
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${roundedLat}&longitude=${roundedLon}&localityLanguage=en`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const result: LocationItem = {
        id: Math.round(roundedLat * 1000 + roundedLon * 1000),
        name: name,
        latitude: roundedLat,
        longitude: roundedLon,
        country: data.countryName || '',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
      };
      setInCache(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode fallback:', err);
  }

  // Fallback location object
  const fallback: LocationItem = {
    id: Math.round(roundedLat * 1000 + roundedLon * 1000),
    name: `Location (${roundedLat.toFixed(2)}°, ${roundedLon.toFixed(2)}°)`,
    latitude: roundedLat,
    longitude: roundedLon,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
  };
  setInCache(cacheKey, fallback);
  return fallback;
}

/**
 * Helper to build individual pollutant breakdown with WHO guidelines
 */
export function getPollutantDetails(airQuality: AirQualityData): AirQualityPollutant[] {
  return [
    {
      name: 'pm2_5',
      label: 'PM2.5',
      value: airQuality.pm2_5,
      unit: 'µg/m³',
      status: airQuality.pm2_5 <= 15 ? 'good' : airQuality.pm2_5 <= 35 ? 'moderate' : airQuality.pm2_5 <= 75 ? 'unhealthy-sensitive' : 'unhealthy',
      statusLabel: airQuality.pm2_5 <= 15 ? 'Good' : airQuality.pm2_5 <= 35 ? 'Moderate' : airQuality.pm2_5 <= 75 ? 'Elevated' : 'High',
      color: airQuality.pm2_5 <= 15 ? '#10b981' : airQuality.pm2_5 <= 35 ? '#f59e0b' : '#ef4444',
      whoLimit: 15,
      description: 'Fine particulate matter that penetrates deep into respiratory systems and lungs.',
    },
    {
      name: 'pm10',
      label: 'PM10',
      value: airQuality.pm10,
      unit: 'µg/m³',
      status: airQuality.pm10 <= 45 ? 'good' : airQuality.pm10 <= 100 ? 'moderate' : 'unhealthy',
      statusLabel: airQuality.pm10 <= 45 ? 'Good' : airQuality.pm10 <= 100 ? 'Moderate' : 'High',
      color: airQuality.pm10 <= 45 ? '#10b981' : airQuality.pm10 <= 100 ? '#f59e0b' : '#ef4444',
      whoLimit: 45,
      description: 'Inhalable coarse particles like dust, pollen, and mold spores.',
    },
    {
      name: 'nitrogenDioxide',
      label: 'NO₂',
      value: airQuality.nitrogenDioxide,
      unit: 'µg/m³',
      status: airQuality.nitrogenDioxide <= 25 ? 'good' : airQuality.nitrogenDioxide <= 50 ? 'moderate' : 'unhealthy',
      statusLabel: airQuality.nitrogenDioxide <= 25 ? 'Good' : airQuality.nitrogenDioxide <= 50 ? 'Moderate' : 'High',
      color: airQuality.nitrogenDioxide <= 25 ? '#10b981' : airQuality.nitrogenDioxide <= 50 ? '#f59e0b' : '#ef4444',
      whoLimit: 25,
      description: 'Emissions primarily from combustion engines and industrial processes.',
    },
    {
      name: 'ozone',
      label: 'O₃',
      value: airQuality.ozone,
      unit: 'µg/m³',
      status: airQuality.ozone <= 60 ? 'good' : airQuality.ozone <= 120 ? 'moderate' : 'unhealthy',
      statusLabel: airQuality.ozone <= 60 ? 'Good' : airQuality.ozone <= 120 ? 'Moderate' : 'High',
      color: airQuality.ozone <= 60 ? '#10b981' : airQuality.ozone <= 120 ? '#f59e0b' : '#ef4444',
      whoLimit: 100,
      description: 'Ground-level ozone formed by chemical reactions under strong sunlight.',
    },
    {
      name: 'sulphurDioxide',
      label: 'SO₂',
      value: airQuality.sulphurDioxide,
      unit: 'µg/m³',
      status: airQuality.sulphurDioxide <= 40 ? 'good' : airQuality.sulphurDioxide <= 80 ? 'moderate' : 'unhealthy',
      statusLabel: airQuality.sulphurDioxide <= 40 ? 'Good' : airQuality.sulphurDioxide <= 80 ? 'Moderate' : 'High',
      color: airQuality.sulphurDioxide <= 40 ? '#10b981' : airQuality.sulphurDioxide <= 80 ? '#f59e0b' : '#ef4444',
      whoLimit: 40,
      description: 'Sulfur dioxide released by fossil fuel combustion and industrial refining.',
    },
    {
      name: 'carbonMonoxide',
      label: 'CO',
      value: Math.round(airQuality.carbonMonoxide),
      unit: 'µg/m³',
      status: airQuality.carbonMonoxide <= 4000 ? 'good' : 'moderate',
      statusLabel: airQuality.carbonMonoxide <= 4000 ? 'Good' : 'Elevated',
      color: airQuality.carbonMonoxide <= 4000 ? '#10b981' : '#f59e0b',
      whoLimit: 4000,
      description: 'Colorless, odorless gas emitted by combustion fuels and vehicle exhaust.',
    },
  ];
}
