import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  LocationItem,
  WeatherData,
  AirQualityData,
  UnitPreferences,
  AppTheme,
  ActiveTab,
  DailyForecastItem,
} from '../types/weather';
import {
  fetchWeatherData,
  fetchAirQualityData,
  reverseGeocodeCoordinates,
} from '../services/weatherService';
import { DEFAULT_LOCATIONS } from '../constants/defaultLocations';

interface WeatherContextType {
  currentLocation: LocationItem;
  weatherData: WeatherData | null;
  airQualityData: AirQualityData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  errorMessage: string | null;
  favorites: LocationItem[];
  recentSearches: LocationItem[];
  unitPreferences: UnitPreferences;
  theme: AppTheme;
  activeTab: ActiveTab;
  selectedDay: DailyForecastItem | null;
  isGeolocationLoading: boolean;
  geolocationError: string | null;
  selectLocation: (location: LocationItem) => void;
  refreshWeather: () => Promise<void>;
  toggleFavorite: (location: LocationItem) => void;
  isFavorite: (id: number) => boolean;
  removeFavorite: (id: number) => void;
  clearRecentSearches: () => void;
  updateUnitPreferences: (newUnits: Partial<UnitPreferences>) => void;
  setTheme: (theme: AppTheme) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedDay: (day: DailyForecastItem | null) => void;
  useCurrentLocation: () => Promise<void>;
}

const STORAGE_KEYS = {
  CURRENT_LOCATION: 'skycast_current_location',
  FAVORITES: 'skycast_favorites',
  RECENT_SEARCHES: 'skycast_recent_searches',
  UNITS: 'skycast_units',
  THEME: 'skycast_theme',
};

const DEFAULT_UNITS: UnitPreferences = {
  temperature: 'celsius',
  windSpeed: 'kmh',
  precipitation: 'mm',
  pressure: 'hPa',
  timeFormat: '12h',
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Saved location or default
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      return saved ? JSON.parse(saved) : DEFAULT_LOCATIONS[0];
    } catch {
      return DEFAULT_LOCATIONS[0];
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<LocationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [DEFAULT_LOCATIONS[0], DEFAULT_LOCATIONS[1], DEFAULT_LOCATIONS[2]];
    } catch {
      return [DEFAULT_LOCATIONS[0], DEFAULT_LOCATIONS[1], DEFAULT_LOCATIONS[2]];
    }
  });

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<LocationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Unit Preferences
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
      return saved ? { ...DEFAULT_UNITS, ...JSON.parse(saved) } : DEFAULT_UNITS;
    } catch {
      return DEFAULT_UNITS;
    }
  });

  // Theme
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return (saved as AppTheme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem | null>(null);

  // Geolocation
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // Sync theme to document body
  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, []);

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className =
        'bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200 transition-colors duration-300';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className =
        'bg-slate-50 text-slate-900 antialiased selection:bg-sky-500/20 selection:text-sky-800 transition-colors duration-300';
    }
  }, [theme]);

  // Fetch weather data for location
  const loadWeatherData = useCallback(
    async (location: LocationItem, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);
      setErrorMessage(null);

      try {
        const [weatherRes, airQualityRes] = await Promise.allSettled([
          fetchWeatherData(location.latitude, location.longitude, location.timezone),
          fetchAirQualityData(location.latitude, location.longitude, location.timezone),
        ]);

        if (weatherRes.status === 'fulfilled') {
          setWeatherData(weatherRes.value);
        } else {
          throw new Error(weatherRes.reason?.message || 'Could not load weather forecast.');
        }

        if (airQualityRes.status === 'fulfilled') {
          setAirQualityData(airQualityRes.value);
        } else {
          console.warn('Air quality data could not be fetched:', airQualityRes.reason);
        }
      } catch (err: unknown) {
        setIsError(true);
        const msg = err instanceof Error ? err.message : 'Failed to retrieve weather data.';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Load weather when currentLocation changes
  useEffect(() => {
    loadWeatherData(currentLocation);
  }, [currentLocation, loadWeatherData]);

  // Select location and add to recents
  const selectLocation = useCallback(
    (location: LocationItem) => {
      setCurrentLocation(location);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(location));
        setRecentSearches((prev) => {
          const filtered = prev.filter((item) => item.id !== location.id);
          const updated = [location, ...filtered].slice(0, 8);
          localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
          return updated;
        });
      } catch (e) {
        console.warn('Storage error', e);
      }
    },
    []
  );

  // Refresh current weather
  const refreshWeather = useCallback(async () => {
    await loadWeatherData(currentLocation, true);
  }, [currentLocation, loadWeatherData]);

  // Favorites management
  const toggleFavorite = useCallback(
    (location: LocationItem) => {
      setFavorites((prev) => {
        const exists = prev.some((item) => item.id === location.id);
        const updated = exists
          ? prev.filter((item) => item.id !== location.id)
          : [...prev, location];
        try {
          localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
        } catch (e) {
          console.warn('Storage error', e);
        }
        return updated;
      });
    },
    []
  );

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (id: number) => {
      return favorites.some((item) => item.id === id);
    },
    [favorites]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, []);

  // Unit preferences
  const updateUnitPreferences = useCallback((newUnits: Partial<UnitPreferences>) => {
    setUnitPreferences((prev) => {
      const updated = { ...prev, ...newUnits };
      try {
        localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return updated;
    });
  }, []);

  // Use browser geolocation
  const useCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocationLoading(true);
    setGeolocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocodeCoordinates(lat, lon);
          selectLocation(loc);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Could not identify your location name.';
          setGeolocationError(msg);
        } finally {
          setIsGeolocationLoading(false);
        }
      },
      (err) => {
        setIsGeolocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeolocationError('Location permission denied. Please allow location access or search manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeolocationError('Location information is currently unavailable.');
            break;
          case err.TIMEOUT:
            setGeolocationError('The request to get user location timed out.');
            break;
          default:
            setGeolocationError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [selectLocation]);

  return (
    <WeatherContext.Provider
      value={{
        currentLocation,
        weatherData,
        airQualityData,
        isLoading,
        isRefreshing,
        isError,
        errorMessage,
        favorites,
        recentSearches,
        unitPreferences,
        theme,
        activeTab,
        selectedDay,
        isGeolocationLoading,
        geolocationError,
        selectLocation,
        refreshWeather,
        toggleFavorite,
        isFavorite,
        removeFavorite,
        clearRecentSearches,
        updateUnitPreferences,
        setTheme,
        setActiveTab,
        setSelectedDay,
        useCurrentLocation,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
