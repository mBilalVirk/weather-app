import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Activity,
  Map as MapIcon,
  GitCompare,
  Settings,
  Info,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { ActiveTab } from '../../types/weather';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useWeather();

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Forecast & Trends', icon: CalendarDays },
    { id: 'airquality', label: 'Air Quality', icon: Activity },
    { id: 'map', label: 'Weather Map', icon: MapIcon },
    { id: 'compare', label: 'Compare Cities', icon: GitCompare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1.5 rounded-2xl bg-slate-900/40 dark:bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
