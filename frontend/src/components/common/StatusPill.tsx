import React from 'react';
import { HealthStatus } from '../../types/health';

interface StatusPillProps {
  status?: HealthStatus['status'];
  isLoading?: boolean;
  error?: Error | null;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, isLoading, error }) => {
  if (isLoading) {
    return (
      <div
        data-testid="status-pill"
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
      >
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
        Checking...
      </div>
    );
  }

  if (error || status === 'unhealthy') {
    return (
      <div
        data-testid="status-pill"
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
        title={error ? error.message : 'Backend unreachable'}
      >
        <span className="w-2 h-2 rounded-full bg-red-500" />
        API Offline
      </div>
    );
  }

  if (status === 'degraded') {
    return (
      <div
        data-testid="status-pill"
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        API Degraded
      </div>
    );
  }

  return (
    <div
      data-testid="status-pill"
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      API Connected
    </div>
  );
};
