import React from 'react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { AirQualityView } from './components/airquality/AirQualityView';
import { WeatherMapView } from './components/maps/WeatherMapView';
import { WeatherCompareView } from './components/compare/WeatherCompareView';
import { SettingsView } from './components/settings/SettingsView';
import { AboutView } from './components/about/AboutView';

const MainContent: React.FC = () => {
  const { activeTab } = useWeather();

  return (
    <main className="flex-1 w-full pb-12">
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'forecast' && <ForecastPage />}
      {activeTab === 'airquality' && <AirQualityView />}
      {activeTab === 'map' && <WeatherMapView />}
      {activeTab === 'compare' && <WeatherCompareView />}
      {activeTab === 'settings' && <SettingsView />}
      {activeTab === 'about' && <AboutView />}
    </main>
  );
};

export default function App() {
  return (
    <WeatherProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors">
        {/* Navigation Header */}
        <Header />

        {/* Global Tab Navigation */}
        <Navigation />

        {/* Dynamic Route Content */}
        <MainContent />

        {/* Meteorological Footer */}
        <Footer />
      </div>
    </WeatherProvider>
  );
}
