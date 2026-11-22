import React from 'react';
import { getNAQIInfo } from './AQIBadge';

interface MetricCardProps {
  label: string;
  fullName: string;
  value: number;
  unit: string;
  subIndex: number;
  isProminent?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  fullName,
  value,
  unit,
  subIndex,
  isProminent = false,
}) => {
  const info = getNAQIInfo(subIndex);

  return (
    <div
      data-testid={`metric-card-${label.toLowerCase()}`}
      className={`relative p-4 rounded-xl border bg-white/85 backdrop-blur-md shadow-md transition-all hover:shadow-xl hover:bg-white/95 ${
        isProminent ? 'ring-2 ring-emerald-500 border-transparent' : 'border-white/60'
      }`}
    >
      {isProminent && (
        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
          Prominent
        </span>
      )}

      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-base font-bold text-slate-800">{label}</span>
          <span className="block text-xs text-slate-500 truncate max-w-[120px]">{fullName}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${info.bg} ${info.text}`}
          title={`Sub-index: ${subIndex} (${info.category})`}
        >
          {info.category}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Sub-Index</span>
        <span className="font-mono font-bold text-slate-700">{Math.round(subIndex)}</span>
      </div>
    </div>
  );
};
