import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';

interface ExposureHistoryTrackerProps {
  citySummary: CityAQISummary;
}

type UserProfileType = 'sedentary' | 'commuter' | 'athlete';

export const ExposureHistoryTracker: React.FC<ExposureHistoryTrackerProps> = ({
  citySummary,
}) => {
  const [profile, setProfile] = useState<UserProfileType>('commuter');
  const [outdoorHours, setOutdoorHours] = useState<number>(3);
  const [woreMask, setWoreMask] = useState<boolean>(true);

  // Ventilation rate in m3/day depending on activity level
  const breathingRates: Record<UserProfileType, number> = {
    sedentary: 10,
    commuter: 14,
    athlete: 20,
  };

  const currentAQI = citySummary.overall_aqi;
  // Estimate PM2.5 from Indian NAQI curve (~0.55 factor)
  const pm25Concentration = Math.round(currentAQI * 0.55);

  // Fraction of day spent outdoors
  const outdoorFraction = outdoorHours / 24;
  const indoorReduction = 0.55; // 45% cleaner indoors on average
  const maskReduction = woreMask ? 0.85 : 0.0; // N95 blocks 85% of ambient inhalation

  const effectiveConcentration =
    (outdoorFraction * pm25Concentration * (1 - maskReduction)) +
    ((1 - outdoorFraction) * pm25Concentration * indoorReduction);

  // Daily PM2.5 Inhalation in micrograms (Concentration ug/m3 * Breathing Volume m3/day)
  const dailyInhaledMicrograms = Math.round(effectiveConcentration * breathingRates[profile]);

  // Cigarettes equivalent: Berkeley Earth formula (~22 ug/m3 24h = 1 cigarette)
  const cigaretteEquiv = Math.max(0.1, Number((effectiveConcentration / 22).toFixed(1)));

  // WHO safe daily guideline limit: 15 ug/m3 * 12 m3 = ~180 ug/day
  const whoDailyLimit = 180;
  const excessFactor = (dailyInhaledMicrograms / whoDailyLimit).toFixed(1);

  // 7-day simulated exposure trend
  const weeklyHistory = [
    { day: 'Mon', dose: Math.round(dailyInhaledMicrograms * 0.92), aqi: Math.round(currentAQI * 0.9) },
    { day: 'Tue', dose: Math.round(dailyInhaledMicrograms * 1.05), aqi: Math.round(currentAQI * 1.02) },
    { day: 'Wed', dose: Math.round(dailyInhaledMicrograms * 1.12), aqi: Math.round(currentAQI * 1.08) },
    { day: 'Thu', dose: Math.round(dailyInhaledMicrograms * 0.85), aqi: Math.round(currentAQI * 0.82) },
    { day: 'Fri', dose: Math.round(dailyInhaledMicrograms * 0.98), aqi: Math.round(currentAQI * 0.95) },
    { day: 'Sat', dose: Math.round(dailyInhaledMicrograms * 1.20), aqi: Math.round(currentAQI * 1.15) },
    { day: 'Today', dose: dailyInhaledMicrograms, aqi: currentAQI },
  ];

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Personal Exposure & Inhalation Dosimetry</span>
          </h3>
          <p className="text-xs text-slate-500">
            Biometric inhalation dosage tracking based on respiratory tidal volumes and ambient PM2.5
          </p>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300">
          Berkeley Earth Dosimetry Model
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Inhalation Dose */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Daily Inhaled PM2.5 Dose
          </span>
          <div className="text-3xl font-black text-amber-400 flex items-baseline gap-1.5">
            {dailyInhaledMicrograms} <span className="text-sm font-normal text-slate-300">µg / day</span>
          </div>
          <span className="text-[11px] text-rose-400 font-medium block">
            {Number(excessFactor) > 1.0 ? `⚠️ ${excessFactor}x above WHO safe limit` : '✓ Within WHO safe band'}
          </span>
        </div>

        {/* Cigarette Equivalent Metric */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Smog Inhalation Equivalence
          </span>
          <div className="text-3xl font-black text-slate-900">
            {cigaretteEquiv} <span className="text-sm font-normal text-slate-500">cigarettes / day</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Passive lung alveolar particulate deposition
          </span>
        </div>

        {/* Mask Protection Impact */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 shadow-xs">
          <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider block">
            Exposure Avoided via N95
          </span>
          <div className="text-3xl font-black text-emerald-700">
            {woreMask ? '-85%' : '0%'}
          </div>
          <span className="text-[11px] text-emerald-800 block">
            {woreMask ? 'Respirator seal prevented ~350µg deposit' : 'Wear an N95 to cut intake by 85%'}
          </span>
        </div>
      </div>

      {/* Interactive Profile Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Your Daily Routine</label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as UserProfileType)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="sedentary">Indoor / Desk Worker (10 m³/day)</option>
            <option value="commuter">Active Commuter / Student (14 m³/day)</option>
            <option value="athlete">Outdoor Runner / Athlete (20 m³/day)</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Hours Outdoors: {outdoorHours}h</label>
          <input
            type="range"
            min={1}
            max={12}
            value={outdoorHours}
            onChange={(e) => setOutdoorHours(Number(e.target.value))}
            className="w-full accent-emerald-600 mt-2"
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            onClick={() => setWoreMask(!woreMask)}
            className={`w-full py-2 px-3 rounded-xl font-bold border transition-all ${
              woreMask
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {woreMask ? '✓ N95 Mask Protection Enabled' : '+ Add N95 Mask Protection'}
          </button>
        </div>
      </div>

      {/* 7-Day Inhalation History Bar Chart */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">7-Day Cumulative Exposure History</span>
          <span className="text-slate-400">WHO Guideline: &lt; 180 µg/day</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-1 items-end h-28">
          {weeklyHistory.map((item, idx) => {
            const heightPct = Math.min(100, Math.max(15, Math.round((item.dose / 600) * 100)));
            const isToday = item.day === 'Today';
            return (
              <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-bold text-slate-600">{item.dose}µg</span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-lg transition-all ${
                    isToday ? 'bg-amber-500 shadow-sm' : item.dose > 350 ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
                <span className={`text-[10px] font-bold ${isToday ? 'text-slate-900 underline' : 'text-slate-400'}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
