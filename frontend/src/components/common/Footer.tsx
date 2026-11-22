import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-12 border-t border-white/30 bg-white/75 backdrop-blur-md py-6 text-slate-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            AIRiac Chandigarh-First • Adhering to Central Pollution Control Board (CPCB) Indian NAQI Standard.
          </span>
        </div>
        <div className="text-slate-400">
          Phase 0 Integration Baseline • Zero External Network Dependency Mode
        </div>
      </div>
    </footer>
  );
};
