import React from 'react';
import {
  CloudLightning,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Globe,
  Compass,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-sky-600/20 via-indigo-900/30 to-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
            <CloudLightning className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">SkyCast</h1>
            <p className="text-xs uppercase font-mono tracking-wider text-sky-400">
              Next-Generation Meteorological Platform
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          SkyCast is an authentic, production-grade weather forecast web application designed for
          meteorological precision, instant responsiveness, and modern visual clarity. It integrates
          high-resolution numerical weather prediction models directly from global meteorological agencies.
        </p>
      </div>

      {/* Numerical Weather Prediction & Data Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Database className="h-5 w-5" />
            <span>Open-Meteo Weather API</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Atmospheric forecasts are retrieved via{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline inline-flex items-center gap-0.5 font-medium"
            >
              Open-Meteo.com
              <ExternalLink className="h-3 w-3" />
            </a>
            , an open-source weather API combining data from top national weather services:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-200">ECMWF:</strong> European Centre for Medium-Range Weather Forecasts (IFS model)</li>
            <li><strong className="text-slate-200">DWD:</strong> Deutscher Wetterdienst (ICON model)</li>
            <li><strong className="text-slate-200">NOAA:</strong> US National Oceanic and Atmospheric Administration (GFS / HRRR)</li>
            <li><strong className="text-slate-200">Météo-France:</strong> AROME & ARPEGE high-resolution models</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>Air Quality & Health Standards</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Air quality calculations are compliant with both the{' '}
            <strong className="text-slate-200">United States Environmental Protection Agency (US EPA)</strong>{' '}
            AQI scale and the{' '}
            <strong className="text-slate-200">European Common Air Quality Index (CAQI)</strong>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pollutants tracked include particulate matter (PM2.5, PM10), Nitrogen Dioxide (NO₂),
            Ozone (O₃), Sulphur Dioxide (SO₂), and Carbon Monoxide (CO), compared against WHO health guidelines.
          </p>
        </div>
      </div>

      {/* Technology & Architecture */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <Cpu className="h-5 w-5" />
          <span>Core Engineering & Architecture</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <div className="font-bold text-white mb-0.5">React 19 & Vite</div>
            <div className="text-slate-400">Blazing SPA framework</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <div className="font-bold text-white mb-0.5">Tailwind CSS 4</div>
            <div className="text-slate-400">Design tokens & glassmorphism</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <div className="font-bold text-white mb-0.5">Recharts</div>
            <div className="text-slate-400">Accessible responsive curves</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <div className="font-bold text-white mb-0.5">Leaflet & Carto</div>
            <div className="text-slate-400">Interactive geo radar</div>
          </div>
        </div>
      </div>

      {/* Data Limitations Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-300">Data Freshness & Limitations:</strong> Atmospheric models update
        approximately every 1 to 3 hours depending on the originating provider. Radar representations reflect
        numerical precipitation modeling and should not be used as the sole source for maritime safety or
        severe weather emergency evacuation orders. Consult your regional national meteorological office
        during extreme storm events.
      </div>
    </div>
  );
};
