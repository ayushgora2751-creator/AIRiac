import React from 'react';
import { Wind, MapPin, User, LogOut } from 'lucide-react';
import { StatusPill } from './StatusPill';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onOpenAuthModal: () => void;
  selectedStation?: string;
  onSelectStation?: (stationId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const { data: healthData, isLoading: isHealthLoading, error: healthError } = useHealthCheck();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/30 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                AIRiac
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800">
                Phase 0
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              Urban Air Quality Assistant
            </p>
          </div>
        </div>

        {/* Center: City Selector / Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span data-testid="city-selector">Chandigarh, UT</span>
        </div>

        {/* Right: Health Status Pill & Auth */}
        <div className="flex items-center gap-3">
          <StatusPill
            status={healthData?.status}
            isLoading={isHealthLoading}
            error={healthError}
          />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
                title="Sign Out"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              data-testid="open-auth-btn"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
