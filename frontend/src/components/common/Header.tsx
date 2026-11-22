import React, { useState } from 'react';
import {
  Wind,
  MapPin,
  User,
  LogOut,
  Bot,
  Home,
  Bell,
  Camera,
  Globe,
  Navigation,
  ChevronDown,
} from 'lucide-react';
import { StatusPill } from './StatusPill';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useAuth } from '../../hooks/useAuth';
import { INDIAN_CITIES } from '../../data/indianCities';
import { apiClient } from '../../api/client';

interface HeaderProps {
  onOpenAuthModal: () => void;
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  onOpenAssistant: () => void;
  onOpenHomeTwin: () => void;
  onOpenAlerts: () => void;
  onOpenReport: () => void;
  onToggle3D: () => void;
  is3DActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuthModal,
  selectedCity,
  onSelectCity,
  onOpenAssistant,
  onOpenHomeTwin,
  onOpenAlerts,
  onOpenReport,
  onToggle3D,
  is3DActive,
}) => {
  const { data: healthData, isLoading: isHealthLoading, error: healthError } = useHealthCheck();
  const { user, isAuthenticated, logout } = useAuth();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCities = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleLocateMe = async () => {
    try {
      const res = await apiClient.get<any>('/geo/locate/');
      const detectedCity = res.data?.city;
      if (detectedCity) {
        const match = INDIAN_CITIES.find(
          (c) => c.name.toLowerCase() === detectedCity.toLowerCase()
        );
        if (match) {
          onSelectCity(match.name);
          return;
        }
      }
    } catch {
      // fallback
    }
    onSelectCity('Chandigarh');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/30 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">
                AIRiac
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                India Pan-City
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium">
              Urban Air Quality & Exposure Platform
            </p>
          </div>
        </div>

        {/* Center: Pan-India City Search & Selector Dropdown */}
        <div className="relative shrink-0 sm:shrink">
          <div className="flex items-center gap-1">
            <button
              data-testid="city-selector"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-300/80 text-slate-800 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="max-w-[130px] sm:max-w-none truncate">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={handleLocateMe}
              title="Locate me via GPS"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* City Selection Dropdown Menu */}
          {isCityDropdownOpen && (
            <div className="absolute top-12 left-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in">
              <input
                type="text"
                placeholder="Search any Indian city..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                autoFocus
              />
              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredCities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCity(c.name);
                      setIsCityDropdownOpen(false);
                      setSearchFilter('');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedCity === c.name
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`text-[10px] ${selectedCity === c.name ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {c.state}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feature Action Buttons */}
        <div className="hidden lg:flex items-center gap-1.5">
          {/* Ask Air AI */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 transition-all shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask Air AI</span>
          </button>

          {/* Check from Home (Home Air Twin) */}
          <button
            onClick={onOpenHomeTwin}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-300 transition-all shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-teal-600" />
            <span>Home Twin</span>
          </button>

          {/* Smart Alerts */}
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-300 transition-all shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Alerts</span>
          </button>

          {/* Citizen Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300 transition-all shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-rose-600" />
            <span>Report</span>
          </button>

          {/* 3D Spline Toggle */}
          <button
            onClick={onToggle3D}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
              is3DActive
                ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${is3DActive ? 'text-emerald-400' : 'text-indigo-600'}`} />
            <span>3D Earth</span>
          </button>
        </div>

        {/* Right: Health Status & Auth */}
        <div className="flex items-center gap-2">
          <StatusPill
            status={healthData?.status}
            isLoading={isHealthLoading}
            error={healthError}
          />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="open-auth-btn"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Action Bar (Scrollable for smaller screens) */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-white/70 overflow-x-auto no-scrollbar">
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-300 shrink-0"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
        <button
          onClick={onOpenHomeTwin}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-300 shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home Twin</span>
        </button>
        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-300 shrink-0"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Alerts</span>
        </button>
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-300 shrink-0"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
        <button
          onClick={onToggle3D}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-300 shrink-0"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>3D View</span>
        </button>
      </div>
    </header>
  );
};
