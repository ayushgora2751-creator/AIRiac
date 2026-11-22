import React from 'react';
import { NAQICategory } from '../../types/aqi';
import { HeartPulse, AlertTriangle, ShieldCheck, Sun, Home } from 'lucide-react';

interface HealthAdviceProps {
  category: NAQICategory;
  aqi?: number;
}

interface AdvisoryItem {
  title: string;
  general: string;
  vulnerable: string;
  outdoor: string;
  ventilation: string;
  level: 'low' | 'moderate' | 'high' | 'critical';
}

const ADVISORIES: Record<NAQICategory, AdvisoryItem> = {
  Good: {
    title: 'Ideal Air Quality Conditions',
    general: 'Air quality is satisfactory and poses little or no health risk. Enjoy outdoor activities.',
    vulnerable: 'No restrictions for sensitive individuals.',
    outdoor: 'Perfect conditions for running, cycling, and sports.',
    ventilation: 'Open windows to allow fresh air circulation.',
    level: 'low',
  },
  Satisfactory: {
    title: 'Acceptable Air Quality',
    general: 'Air quality is acceptable for most people. Minor breathing discomfort to sensitive individuals.',
    vulnerable: 'People with unusually severe respiratory conditions should monitor symptoms.',
    outdoor: 'Normal outdoor activities are safe.',
    ventilation: 'Natural ventilation is recommended during afternoon hours.',
    level: 'low',
  },
  Moderate: {
    title: 'Caution for Sensitive Groups',
    general: 'Breathing discomfort to people with lung disease, heart disease, children, and older adults.',
    vulnerable: 'People with asthma or heart conditions should carry emergency medications and reduce prolonged exertion.',
    outdoor: 'Take more breaks during prolonged or heavy outdoor exertion.',
    ventilation: 'Limit outdoor air intake during peak traffic and morning haze.',
    level: 'moderate',
  },
  Poor: {
    title: 'Unhealthy for Sensitive Individuals',
    general: 'Breathing discomfort to most people on prolonged exposure. Wear N95 masks in heavy traffic zones.',
    vulnerable: 'Children, seniors, and asthma patients should avoid strenuous outdoor physical exertion.',
    outdoor: 'Reschedule morning outdoor runs or substitute with indoor workouts.',
    ventilation: 'Keep windows closed during early morning and late evening inversion hours.',
    level: 'high',
  },
  'Very Poor': {
    title: 'Health Alert: Very Unhealthy Air',
    general: 'Respiratory illness likely on prolonged exposure. Significant health impact for everyone.',
    vulnerable: 'Sensitive groups should remain indoors and use HEPA air purifiers if available.',
    outdoor: 'Avoid all outdoor physical activities and strenuous exercise.',
    ventilation: 'Keep doors and windows firmly shut. Utilize indoor air purification.',
    level: 'critical',
  },
  Severe: {
    title: 'Emergency Health Warning: Hazardous Air',
    general: 'Emergency conditions. Healthy individuals will experience adverse respiratory symptoms; serious effects on vulnerable groups.',
    vulnerable: 'Strict indoor confinement recommended. Seek medical attention if experiencing chest tightness.',
    outdoor: 'Prohibit all outdoor exertion. Wear tight-fitting N95/FFP2 masks if transit is unavoidable.',
    ventilation: 'Seal room infiltration; operate air purifiers continuously on maximum filtration.',
    level: 'critical',
  },
};

export const HealthAdvice: React.FC<HealthAdviceProps> = ({ category, aqi }) => {
  const advisory = ADVISORIES[category] || ADVISORIES.Moderate;

  const headerColors = {
    low: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    moderate: 'bg-amber-50 text-amber-900 border-amber-200',
    high: 'bg-orange-50 text-orange-900 border-orange-200',
    critical: 'bg-red-50 text-red-900 border-red-200',
  }[advisory.level];

  return (
    <div
      data-testid="health-advice"
      className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-xl"
    >
      <div className={`p-5 border-b flex items-center justify-between ${headerColors}`}>
        <div className="flex items-center gap-3">
          {advisory.level === 'critical' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
          ) : (
            <HeartPulse className="w-5 h-5 text-emerald-600" />
          )}
          <div>
            <h3 className="font-bold text-base leading-tight">
              Health Advisory • {category} Risk Band
            </h3>
            <p className="text-xs opacity-85 mt-0.5">{advisory.title}</p>
          </div>
        </div>
        {aqi !== undefined && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 backdrop-blur border border-current/20">
            NAQI Score: {Math.round(aqi)}
          </span>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>General Population Guidance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advisory.general}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <HeartPulse className="w-4 h-4 text-red-500" />
            <span>Vulnerable & Sensitive Groups</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advisory.vulnerable}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Outdoor Activity & Sports</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advisory.outdoor}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Home className="w-4 h-4 text-sky-500" />
            <span>Indoor Ventilation Guidance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advisory.ventilation}
          </p>
        </div>
      </div>
    </div>
  );
};
