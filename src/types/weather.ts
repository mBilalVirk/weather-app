export interface LocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  country_id?: number;
  admin1?: string; // State or province
  admin2?: string;
  admin3?: string;
  admin4?: string;
  timezone?: string;
  population?: number;
  postcodes?: string[];
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  isDay: boolean;
  relativeHumidity: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloudCover: number;
  pressureMsl: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex?: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  uvIndex: number;
  humidity: number;
  dewPoint: number;
  visibility: number;
  isDay: boolean;
  cloudCover: number;
  pressureMsl: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  daylightDuration: number;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windDirectionDominant: number;
  windGustsMax: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  lastUpdated: string;
}

export interface AirQualityPollutant {
  name: string;
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  statusLabel: string;
  color: string;
  whoLimit?: number;
  description: string;
}

export interface AirQualityHourlyItem {
  time: string;
  usAqi: number;
  europeanAqi: number;
  pm2_5: number;
  pm10: number;
  nitrogenDioxide: number;
  ozone: number;
  sulphurDioxide: number;
}

export interface AirQualityData {
  latitude: number;
  longitude: number;
  timezone: string;
  usAqi: number;
  europeanAqi: number;
  pm2_5: number;
  pm10: number;
  nitrogenDioxide: number;
  ozone: number;
  sulphurDioxide: number;
  carbonMonoxide: number;
  dust: number;
  uvIndex: number;
  hourly: AirQualityHourlyItem[];
  lastUpdated: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type PrecipitationUnit = 'mm' | 'inch';
export type PressureUnit = 'hPa' | 'inHg';
export type TimeFormat = '12h' | '24h';
export type AppTheme = 'dark' | 'light' | 'system';

export interface UnitPreferences {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  precipitation: PrecipitationUnit;
  pressure: PressureUnit;
  timeFormat: TimeFormat;
}

export type ActiveTab = 'dashboard' | 'forecast' | 'airquality' | 'map' | 'compare' | 'settings' | 'about';
