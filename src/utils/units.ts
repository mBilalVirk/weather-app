import { TemperatureUnit, WindSpeedUnit, PrecipitationUnit, PressureUnit } from '../types/weather';

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return (celsius * 9) / 5 + 32;
  }
  return celsius;
}

export function formatTemperature(
  celsius: number | null | undefined,
  unit: TemperatureUnit = 'celsius',
  includeSymbol = true
): string {
  if (celsius === null || celsius === undefined || isNaN(celsius)) {
    return '--';
  }
  const val = Math.round(convertTemperature(celsius, unit));
  const symbol = includeSymbol ? (unit === 'fahrenheit' ? '°F' : '°C') : '°';
  return `${val}${symbol}`;
}

export function convertWindSpeed(kmh: number, unit: WindSpeedUnit): number {
  switch (unit) {
    case 'mph':
      return kmh * 0.621371;
    case 'ms':
      return kmh / 3.6;
    case 'knots':
      return kmh * 0.539957;
    case 'kmh':
    default:
      return kmh;
  }
}

export function formatWindSpeed(
  kmh: number | null | undefined,
  unit: WindSpeedUnit = 'kmh',
  includeUnit = true
): string {
  if (kmh === null || kmh === undefined || isNaN(kmh)) {
    return '--';
  }
  const converted = convertWindSpeed(kmh, unit);
  const rounded = unit === 'ms' ? converted.toFixed(1) : Math.round(converted).toString();
  if (!includeUnit) return rounded;

  const unitLabels: Record<WindSpeedUnit, string> = {
    kmh: 'km/h',
    mph: 'mph',
    ms: 'm/s',
    knots: 'kt',
  };

  return `${rounded} ${unitLabels[unit]}`;
}

export function convertPrecipitation(mm: number, unit: PrecipitationUnit): number {
  if (unit === 'inch') {
    return mm * 0.0393701;
  }
  return mm;
}

export function formatPrecipitation(
  mm: number | null | undefined,
  unit: PrecipitationUnit = 'mm',
  includeUnit = true
): string {
  if (mm === null || mm === undefined || isNaN(mm)) {
    return '--';
  }
  const converted = convertPrecipitation(mm, unit);
  const formatted = unit === 'inch' ? converted.toFixed(2) : converted.toFixed(1);
  if (!includeUnit) return formatted;
  return `${formatted} ${unit === 'inch' ? 'in' : 'mm'}`;
}

export function convertPressure(hPa: number, unit: PressureUnit): number {
  if (unit === 'inHg') {
    return hPa * 0.02953;
  }
  return hPa;
}

export function formatPressure(
  hPa: number | null | undefined,
  unit: PressureUnit = 'hPa',
  includeUnit = true
): string {
  if (hPa === null || hPa === undefined || isNaN(hPa)) {
    return '--';
  }
  const converted = convertPressure(hPa, unit);
  const formatted = unit === 'inHg' ? converted.toFixed(2) : Math.round(converted).toString();
  if (!includeUnit) return formatted;
  return `${formatted} ${unit}`;
}

export function getWindDirectionCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index] || 'N';
}

export interface UvCategoryInfo {
  index: number;
  label: string;
  color: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  advice: string;
}

export function getUvCategory(uv: number | null | undefined): UvCategoryInfo {
  const index = uv ?? 0;
  if (index <= 2) {
    return {
      index,
      label: 'Low',
      color: '#10b981',
      textColor: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/20',
      advice: 'No protection needed. Safe to stay outside.',
    };
  } else if (index <= 5) {
    return {
      index,
      label: 'Moderate',
      color: '#f59e0b',
      textColor: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20',
      advice: 'Wear sunscreen, hat, and sunglasses during midday hours.',
    };
  } else if (index <= 7) {
    return {
      index,
      label: 'High',
      color: '#f97316',
      textColor: 'text-orange-400',
      bgClass: 'bg-orange-500/10',
      borderClass: 'border-orange-500/20',
      advice: 'Protection required. Seek shade during peak midday hours.',
    };
  } else if (index <= 10) {
    return {
      index,
      label: 'Very High',
      color: '#ef4444',
      textColor: 'text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/20',
      advice: 'Extra protection required. Avoid direct sun between 10am-4pm.',
    };
  } else {
    return {
      index,
      label: 'Extreme',
      color: '#a855f7',
      textColor: 'text-purple-400',
      bgClass: 'bg-purple-500/10',
      borderClass: 'border-purple-500/20',
      advice: 'Stay indoors if possible. Unprotected skin can burn quickly.',
    };
  }
}

export interface AqiCategoryInfo {
  aqi: number;
  label: string;
  category: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  color: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  generalAdvice: string;
  sensitiveAdvice: string;
  outdoorActivities: 'Enjoy outdoor activities' | 'Safe for most people' | 'Reduce intense exertion' | 'Avoid prolonged outdoor exertion' | 'Stay indoors and use air filters';
}

export function getUsAqiCategory(aqi: number | null | undefined): AqiCategoryInfo {
  const value = aqi ?? 0;
  if (value <= 50) {
    return {
      aqi: value,
      label: 'Good',
      category: 'good',
      color: '#10b981',
      textColor: 'text-emerald-400',
      bgClass: 'bg-emerald-500/15',
      borderClass: 'border-emerald-500/30',
      generalAdvice: 'Air quality is satisfactory and poses little or no risk.',
      sensitiveAdvice: 'Ideal conditions for enjoying the outdoors.',
      outdoorActivities: 'Enjoy outdoor activities',
    };
  } else if (value <= 100) {
    return {
      aqi: value,
      label: 'Moderate',
      category: 'moderate',
      color: '#f59e0b',
      textColor: 'text-amber-400',
      bgClass: 'bg-amber-500/15',
      borderClass: 'border-amber-500/30',
      generalAdvice: 'Air quality is acceptable for most people.',
      sensitiveAdvice: 'Unusually sensitive individuals may experience minor irritation.',
      outdoorActivities: 'Safe for most people',
    };
  } else if (value <= 150) {
    return {
      aqi: value,
      label: 'Unhealthy for Sensitive Groups',
      category: 'sensitive',
      color: '#f97316',
      textColor: 'text-orange-400',
      bgClass: 'bg-orange-500/15',
      borderClass: 'border-orange-500/30',
      generalAdvice: 'General public is less likely to be affected.',
      sensitiveAdvice: 'People with asthma, respiratory issues, children and seniors should limit prolonged outdoor exertion.',
      outdoorActivities: 'Reduce intense exertion',
    };
  } else if (value <= 200) {
    return {
      aqi: value,
      label: 'Unhealthy',
      category: 'unhealthy',
      color: '#ef4444',
      textColor: 'text-rose-400',
      bgClass: 'bg-rose-500/15',
      borderClass: 'border-rose-500/30',
      generalAdvice: 'Some members of the general public may experience health effects.',
      sensitiveAdvice: 'Sensitive groups should avoid outdoor activities entirely.',
      outdoorActivities: 'Avoid prolonged outdoor exertion',
    };
  } else if (value <= 300) {
    return {
      aqi: value,
      label: 'Very Unhealthy',
      category: 'very-unhealthy',
      color: '#a855f7',
      textColor: 'text-purple-400',
      bgClass: 'bg-purple-500/15',
      borderClass: 'border-purple-500/30',
      generalAdvice: 'Health alert: Increased likelihood of adverse effects for everyone.',
      sensitiveAdvice: 'Everyone should avoid physical activity outdoors.',
      outdoorActivities: 'Stay indoors and use air filters',
    };
  } else {
    return {
      aqi: value,
      label: 'Hazardous',
      category: 'hazardous',
      color: '#7f1d1d',
      textColor: 'text-red-300',
      bgClass: 'bg-red-950/40',
      borderClass: 'border-red-600/40',
      generalAdvice: 'Health warning of emergency conditions. Entire population is more likely to be affected.',
      sensitiveAdvice: 'Remain indoors with closed windows and run an air purifier.',
      outdoorActivities: 'Stay indoors and use air filters',
    };
  }
}
