import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* Hero Card Skeleton */}
      <div className="h-72 w-full rounded-3xl bg-slate-900/60 border border-slate-800 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-8 w-48 rounded-xl bg-slate-800" />
            <div className="h-4 w-32 rounded-lg bg-slate-800/60" />
          </div>
          <div className="h-16 w-16 rounded-2xl bg-slate-800" />
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-16 w-36 rounded-2xl bg-slate-800" />
            <div className="h-4 w-28 rounded-lg bg-slate-800/60" />
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-24 rounded-xl bg-slate-800" />
            <div className="h-10 w-24 rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Hourly Forecast Carousel Skeleton */}
      <div className="h-44 w-full rounded-3xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-4">
        <div className="h-5 w-36 rounded-lg bg-slate-800" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 w-20 shrink-0 rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      </div>

      {/* 7-Day & Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 rounded-3xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
          <div className="h-5 w-32 rounded-lg bg-slate-800" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-full rounded-lg bg-slate-800/40" />
          ))}
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-900/50 border border-slate-800 p-4 space-y-3">
              <div className="h-4 w-24 rounded bg-slate-800" />
              <div className="h-8 w-16 rounded bg-slate-800" />
              <div className="h-3 w-full rounded bg-slate-800/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
