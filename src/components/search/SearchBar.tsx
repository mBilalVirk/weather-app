import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  MapPin,
  Compass,
  Star,
  Clock,
  Loader2,
  Navigation,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { searchLocations } from '../../services/weatherService';
import { LocationItem } from '../../types/weather';

interface SearchBarProps {
  onLocationSelected?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelected,
  className = '',
  isCompact = false,
}) => {
  const {
    selectLocation,
    favorites,
    recentSearches,
    clearRecentSearches,
    useCurrentLocation,
    isGeolocationLoading,
    geolocationError,
  } = useWeather();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchError, setSearchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const data = await searchLocations(query, controller.signal);
        setResults(data);
        if (data.length === 0) {
          setSearchError(`No locations found for "${query}"`);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSearchError('Error finding locations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (loc: LocationItem) => {
      selectLocation(loc);
      setQuery('');
      setIsOpen(false);
      setResults([]);
      setSelectedIndex(-1);
      if (onLocationSelected) onLocationSelected();
    },
    [selectLocation, onLocationSelected]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city, postal code, or place..."
          aria-label="Search city or location"
          className={`w-full pl-10 pr-16 ${
            isCompact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'
          } rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-sky-500 animate-spin mr-1" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              await useCurrentLocation();
              if (onLocationSelected) onLocationSelected();
            }}
            disabled={isGeolocationLoading}
            className="p-1.5 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 active:scale-95 transition-all"
            title="Use current GPS location"
          >
            {isGeolocationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {geolocationError && (
        <div className="absolute top-full mt-1.5 w-full z-50 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {geolocationError}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-96 overflow-y-auto custom-scrollbar animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Real-time search results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Matching Locations
              </div>
              {results.map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                    selectedIndex === idx
                      ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-900 dark:text-sky-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <MapPin className="h-4 w-4 text-sky-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                        {[item.admin1, item.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  {item.country_code && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.country_code}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {searchError && !isLoading && (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {searchError}
            </div>
          )}

          {/* If no active query: show Favorites and Recent Searches */}
          {!query && (
            <div className="p-2 space-y-3">
              {/* Geolocation Button */}
              <button
                type="button"
                onClick={async () => {
                  await useCurrentLocation();
                  setIsOpen(false);
                  if (onLocationSelected) onLocationSelected();
                }}
                disabled={isGeolocationLoading}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
              >
                {isGeolocationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Compass className="h-4 w-4" />
                )}
                <span>Use Current Location</span>
              </button>

              {/* Favorites */}
              {favorites.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span>Favorite Places</span>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {favorites.map((fav) => (
                      <button
                        key={fav.id}
                        type="button"
                        onClick={() => handleSelect(fav)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <span className="font-medium truncate">{fav.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {fav.country || fav.country_code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearRecentSearches();
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lowercase"
                    >
                      clear
                    </button>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {recentSearches.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="text-xs text-slate-400">
                          {[item.admin1, item.country_code].filter(Boolean).join(', ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
