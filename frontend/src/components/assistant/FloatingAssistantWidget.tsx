import React from 'react';
import { Bot } from 'lucide-react';

interface FloatingAssistantWidgetProps {
  onClick: () => void;
  city: string;
  aqi: number;
}

export const FloatingAssistantWidget: React.FC<FloatingAssistantWidgetProps> = ({
  onClick,
  city,
  aqi,
}) => {
  return (
    <aside
      aria-label="AI Air Assistant Quick Access"
      className="fixed bottom-6 right-6 z-40 flex items-center group pointer-events-auto"
    >
      <button
        onClick={onClick}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-lg border border-emerald-400/30 shadow-2xl shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
        </div>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs font-black tracking-tight">
            <span>Ask Air AI</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
              Gemini + Python
            </span>
          </div>
          <p className="text-[10px] text-slate-300 font-medium">
            {city} AQI: <strong>{aqi}</strong> • Instant advice
          </p>
        </div>
      </button>
    </aside>
  );
};
