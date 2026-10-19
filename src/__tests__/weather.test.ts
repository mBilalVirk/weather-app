import { describe, it, expect } from 'vitest';
import { getWeatherInfo, getWeatherDescription } from '../utils/weatherCodes';
import { formatTime, formatDate, getDayName, calculateDayProgress } from '../utils/dateTime';

describe('Weather Codes & DateTime Formatting', () => {
  it('identifies WMO codes correctly', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
    expect(getWeatherDescription(2)).toBe('Partly cloudy');
    expect(getWeatherDescription(3)).toBe('Overcast');
    expect(getWeatherDescription(45)).toBe('Fog');
    expect(getWeatherDescription(61)).toBe('Slight rain');
    expect(getWeatherDescription(65)).toBe('Heavy rain');
    expect(getWeatherDescription(71)).toBe('Slight snow fall');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });

  it('provides safe fallback for unknown weather codes', () => {
    const fallback = getWeatherInfo(9999);
    expect(fallback.label).toBe('Variable conditions');
  });

  it('formats dates consistently', () => {
    const formatted = formatDate('2025-06-15T12:00:00Z', 'UTC', 'short');
    expect(formatted).toContain('Jun');
    expect(formatted).toContain('15');
  });

  it('formats 12h vs 24h times', () => {
    const time12h = formatTime('2025-06-15T14:30:00Z', 'UTC', true);
    expect(time12h).toMatch(/2:30\s*(PM|pm)/i);

    const time24h = formatTime('2025-06-15T14:30:00Z', 'UTC', false);
    expect(time24h).toBe('14:30');
  });

  it('calculates sun progress between sunrise and sunset', () => {
    const sunrise = '2025-06-15T06:00:00Z';
    const sunset = '2025-06-15T18:00:00Z';
    const noon = '2025-06-15T12:00:00Z';

    const result = calculateDayProgress(sunrise, sunset, noon);
    expect(result.progress).toBe(50);
    expect(result.isDay).toBe(true);
    expect(result.daylightDurationFormatted).toBe('12h 0m');
  });
});
