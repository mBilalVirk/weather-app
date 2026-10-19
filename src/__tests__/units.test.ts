import { describe, it, expect } from 'vitest';
import {
  convertTemperature,
  formatTemperature,
  convertWindSpeed,
  formatWindSpeed,
  convertPrecipitation,
  formatPrecipitation,
  convertPressure,
  formatPressure,
  getWindDirectionCompass,
  getUvCategory,
  getUsAqiCategory,
} from '../utils/units';

describe('Unit Conversion and Formatting', () => {
  it('correctly converts Celsius to Fahrenheit', () => {
    expect(convertTemperature(0, 'celsius')).toBe(0);
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });

  it('formats temperature with symbols properly', () => {
    expect(formatTemperature(20.4, 'celsius')).toBe('20°C');
    expect(formatTemperature(20.4, 'fahrenheit')).toBe('69°F');
    expect(formatTemperature(null)).toBe('--');
  });

  it('correctly converts wind speed between kmh, mph, ms, and knots', () => {
    expect(convertWindSpeed(10, 'kmh')).toBe(10);
    expect(Math.round(convertWindSpeed(100, 'mph'))).toBe(62);
    expect(Math.round(convertWindSpeed(36, 'ms'))).toBe(10);
    expect(Math.round(convertWindSpeed(100, 'knots'))).toBe(54);
  });

  it('formats wind speed with correct labels', () => {
    expect(formatWindSpeed(25, 'kmh')).toBe('25 km/h');
    expect(formatWindSpeed(null)).toBe('--');
  });

  it('converts and formats precipitation volume', () => {
    expect(convertPrecipitation(10, 'mm')).toBe(10);
    expect(formatPrecipitation(25.4, 'inch')).toBe('1.00 in');
    expect(formatPrecipitation(5.2, 'mm')).toBe('5.2 mm');
  });

  it('converts atmospheric pressure', () => {
    expect(convertPressure(1013, 'hPa')).toBe(1013);
    expect(formatPressure(1013, 'inHg')).toBe('29.91 inHg');
  });

  it('returns accurate 16-point compass directions', () => {
    expect(getWindDirectionCompass(0)).toBe('N');
    expect(getWindDirectionCompass(90)).toBe('E');
    expect(getWindDirectionCompass(180)).toBe('S');
    expect(getWindDirectionCompass(270)).toBe('W');
    expect(getWindDirectionCompass(45)).toBe('NE');
    expect(getWindDirectionCompass(225)).toBe('SW');
  });

  it('categorizes UV index accurately based on WHO thresholds', () => {
    expect(getUvCategory(1).label).toBe('Low');
    expect(getUvCategory(4).label).toBe('Moderate');
    expect(getUvCategory(7).label).toBe('High');
    expect(getUvCategory(9).label).toBe('Very High');
    expect(getUvCategory(12).label).toBe('Extreme');
  });

  it('categorizes US AQI accurately according to EPA standards', () => {
    expect(getUsAqiCategory(30).label).toBe('Good');
    expect(getUsAqiCategory(75).label).toBe('Moderate');
    expect(getUsAqiCategory(125).label).toBe('Unhealthy for Sensitive Groups');
    expect(getUsAqiCategory(175).label).toBe('Unhealthy');
    expect(getUsAqiCategory(250).label).toBe('Very Unhealthy');
    expect(getUsAqiCategory(350).label).toBe('Hazardous');
  });
});
