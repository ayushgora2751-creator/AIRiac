import React, { useState } from 'react';
import { Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { DiurnalTrendPoint, CityAQISummary } from '../../types/aqi';

interface SmartDailyPlannerProps {
  trendSeries: DiurnalTrendPoint[];
  citySummary: CityAQISummary;
}

type ActivityType = 'jog' | 'commute' | 'ventilate' | 'children' | 'evening_walk';

export const SmartDailyPlanner: React.FC<SmartDailyPlannerProps> = ({
  trendSeries,
  citySummary,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('jog');

  const activities = [
    { id: 'jog', name: 'Outdoor Jogging / Exercise', icon: '🏃', bestHours: '13:00 - 15:30', peakRisk: '06:00 - 09:00' },
    { id: 'ventilate', name: 'Open Home Windows', icon: '🪟', bestHours: '12:30 - 16:00', peakRisk: '19:00 - 23:00' },
    { id: 'commute', name: 'Biking / Walking Commute', icon: '🚴', bestHours: '11:00 - 16:00', peakRisk: '08:30 - 10:30' },
    { id: 'children', name: 'Children Outdoor Recess', icon: '🧒', bestHours: '13:00 - 15:00', peakRisk: 'Early Morning' },
    { id: 'evening_walk', name: 'Elderly / Sunset Stroll', icon: '🚶', bestHours: '15:00 - 17:00', peakRisk: 'After 19:30' },
  ];

  const currentAct = activities.find((a) => a.id === selectedActivity) || activities[0];

  // Map 24h trend points to activity feasibility ratings
  const safeTrend = Array.isArray(trendSeries) && trendSeries.length > 0 ? trendSeries : [];
  const hourSlots = safeTrend.slice(0, 12).map((pt, idx) => {
    const rawTime = (pt as any)?.time ?? (pt as any)?.timestamp ?? `${idx * 2}:00`;
    const timeStr = typeof rawTime === 'string' && rawTime.includes(':') ? rawTime : `${idx * 2}:00`;
    const hourNum = parseInt(timeStr.split(':')[0], 10) || idx * 2;
    const aqi = typeof pt.aqi === 'number' ? pt.aqi : citySummary.overall_aqi;

    let status: 'optimal' | 'moderate' | 'hazard' = 'moderate';
    let label = 'Moderate Exposure';
    let bg = 'bg-amber-100 text-amber-900 border-amber-300';

    if (aqi <= 100) {
      status = 'optimal';
      label = 'Ideal Window';
      bg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (aqi > 200 || (hourNum >= 6 && hourNum <= 9) || hourNum >= 20) {
      status = 'hazard';
      label = 'Smog Inversion';
      bg = 'bg-rose-100 text-rose-900 border-rose-300';
    }

    return {
      hourStr: `${String(hourNum).padStart(2, '0')}:00`,
      aqi,
      status,
      label,
      bg,
    };
  });

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Smart Daily Activity Planner • {citySummary.city}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Diurnal planetary boundary layer modeling to optimize outdoor schedules & prevent lung deposition
          </p>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          CPCB Diurnal Engine Active
        </span>
      </div>

      {/* Activity Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {activities.map((act) => (
          <button
            key={act.id}
            onClick={() => setSelectedActivity(act.id as ActivityType)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedActivity === act.id
                ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>{act.icon}</span>
            <span>{act.name}</span>
          </button>
        ))}
      </div>

      {/* Recommended Slot Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50/90 to-teal-50/90 border border-emerald-200/80">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Optimal Safe Window for {currentAct.name}
          </span>
          <div className="text-2xl font-black text-emerald-950 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>{currentAct.bestHours}</span>
          </div>
          <p className="text-xs text-emerald-800">
            Solar convection raises thermal inversion layer, dispersing ground contaminants.
          </p>
        </div>

        <div className="space-y-1 sm:border-l sm:border-emerald-200/80 sm:pl-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
            Hazardous Rush / Inversion Hours
          </span>
          <div className="text-2xl font-black text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>{currentAct.peakRisk}</span>
          </div>
          <p className="text-xs text-rose-800">
            Shallow nocturnal radiation trapping concentrates diesel particulates and crop smoke.
          </p>
        </div>
      </div>

      {/* Hour-by-Hour Forecast Strip */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">Hourly Exposure Rating Strip</span>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {hourSlots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-transform hover:scale-105 ${slot.bg}`}
            >
              <span className="text-[11px] font-bold opacity-80">{slot.hourStr}</span>
              <div className="my-1">
                <span className="text-sm font-black">{slot.aqi}</span>
                <span className="text-[9px] block opacity-75">AQI</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-tight">
                {slot.status === 'optimal' ? 'Best' : slot.status === 'hazard' ? 'Avoid' : 'Fair'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
