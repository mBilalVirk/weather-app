import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { CurrentWeatherHero } from '../components/weather/CurrentWeatherHero';
import { HourlyForecastCarousel } from '../components/weather/HourlyForecastCarousel';
import { DailyForecastList } from '../components/weather/DailyForecastList';
import { WeatherHighlightsGrid } from '../components/weather/WeatherHighlightsGrid';
import { WeatherChartsView } from '../components/charts/WeatherChartsView';
import { DayDetailModal } from '../components/weather/DayDetailModal';
import { DashboardSkeleton } from '../components/ui/SkeletonLoaders';
import { ErrorState } from '../components/ui/ErrorState';

export const DashboardPage: React.FC = () => {
  const { isLoading, isError, errorMessage, refreshWeather, selectLocation } = useWeather();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorState
          message={errorMessage}
          onRetry={refreshWeather}
          onSelectFallback={selectLocation}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Main Weather Hero Card */}
      <CurrentWeatherHero />

      {/* 2. Hourly Forecast Carousel */}
      <HourlyForecastCarousel />

      {/* 3. 7-Day Forecast & Bento Grid Weather Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: 7-Day Forecast */}
        <div className="lg:col-span-5 w-full">
          <DailyForecastList />
        </div>

        {/* Right column: Bento Highlights Grid */}
        <div className="lg:col-span-7 w-full">
          <WeatherHighlightsGrid />
        </div>
      </div>

      {/* 4. Meteorological Trend Charts */}
      <div className="pt-2">
        <WeatherChartsView />
      </div>

      {/* Day details modal if a day is clicked */}
      <DayDetailModal />
    </div>
  );
};
