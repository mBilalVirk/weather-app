import React, { useState } from 'react';
import {
  CloudLightning,
  Star,
  RefreshCw,
  Sun,
  Moon,
  Menu,
  X,
  MapPin,
  Sliders,
  Layers,
  Wind,
  Activity,
  Calendar,
  Info,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { SearchBar } from '../search/SearchBar';
import { ActiveTab } from '../../types/weather';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    currentLocation,
    weatherData,
    refreshWeather,
    isRefreshing,
    isFavorite,
    toggleFavorite,
    unitPreferences,
    updateUnitPreferences,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
  } = useWeather();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isFav = isFavorite(currentLocation.id);

  const toggleTempUnit = () => {
    updateUnitPreferences({
      temperature: unitPreferences.temperature === 'celsius' ? 'fahrenheit' : 'celsius',
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'airquality', label: 'Air Quality', icon: Activity },
    { id: 'map', label: 'Weather Map', icon: Wind },
    { id: 'compare', label: 'Compare', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 dark:bg-slate-950/80 border-b border-slate-200/20 dark:border-slate-800/60 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-200">
                <CloudLightning className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-white bg-clip-text text-transparent">
                  SkyCast
                </span>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-sky-400/80 -mt-1">
                  Live Meteorological
                </span>
              </div>
            </button>

            {/* Current Location Pill & Favorite Star */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-xs">
              <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                {currentLocation.name}
              </span>
              <span className="text-slate-400 text-[11px]">
                {currentLocation.country_code || currentLocation.country}
              </span>
              <button
                type="button"
                onClick={() => toggleFavorite(currentLocation)}
                className="ml-1 p-0.5 text-slate-400 hover:text-amber-400 transition-colors"
                title={isFav ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Centered Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-2">
            <SearchBar />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Quick °C / °F Switch */}
            <button
              type="button"
              onClick={toggleTempUnit}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/60 dark:bg-slate-900 border border-slate-700/60 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1 shadow-sm"
              title="Toggle temperature unit"
            >
              <span className={unitPreferences.temperature === 'celsius' ? 'text-sky-400 font-bold' : 'text-slate-400'}>°C</span>
              <span className="text-slate-500">/</span>
              <span className={unitPreferences.temperature === 'fahrenheit' ? 'text-sky-400 font-bold' : 'text-slate-400'}>°F</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => refreshWeather()}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800/60 dark:hover:bg-slate-900 border border-slate-800 transition-colors active:scale-95"
              title="Refresh forecast data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 dark:hover:bg-slate-900 border border-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar row */}
        <div className="md:hidden pb-3 pt-1">
          <SearchBar isCompact />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-400" />
              <span className="font-medium text-slate-200">{currentLocation.name}</span>
            </div>
            <button
              onClick={() => toggleFavorite(currentLocation)}
              className="flex items-center gap-1 text-slate-300 text-xs"
            >
              <Star
                className={`h-4 w-4 ${
                  isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                }`}
              />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
