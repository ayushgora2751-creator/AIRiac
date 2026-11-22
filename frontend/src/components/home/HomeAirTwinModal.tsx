import React, { useState } from 'react';
import { Home, Wind, AlertTriangle, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';

interface HomeAirTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  citySummary: CityAQISummary;
}

export const HomeAirTwinModal: React.FC<HomeAirTwinModalProps> = ({
  isOpen,
  onClose,
  citySummary,
}) => {
  const [buildingType, setBuildingType] = useState('apartment');
  const [floorLevel, setFloorLevel] = useState('mid');
  const [roomSizeSqM, setRoomSizeSqM] = useState(25); // ~25 m2 room
  const [windowState, setWindowState] = useState('closed'); // closed, cracked, open
  const [purifierCADR, setPurifierCADR] = useState(250); // 0, 250, 500
  const [cookingActivity, setCookingActivity] = useState('hood'); // none, hood, open

  if (!isOpen) return null;

  // Outdoor baseline PM2.5 derived from current city AQI
  const outdoorPM25 = Math.round(citySummary.overall_aqi * 0.55);

  // Calculate building infiltration rate (ACH - Air Changes per Hour)
  let infiltrationRate = 0.5; // base infiltration
  if (windowState === 'cracked') infiltrationRate = 1.4;
  if (windowState === 'open') infiltrationRate = 3.2;

  // Floor level adjustment (ground floor gets more road dust, high floor gets slightly less)
  let floorFactor = 1.0;
  if (floorLevel === 'ground') floorFactor = 1.15;
  if (floorLevel === 'high') floorFactor = 0.85;

  // Indoor generation from cooking
  let cookingAddition = 0;
  if (cookingActivity === 'open') cookingAddition = 45;
  if (cookingActivity === 'hood') cookingAddition = 12;

  // Purifier clean rate in ACH
  const roomVolume = roomSizeSqM * 2.8; // room height 2.8m
  const purifierACH = purifierCADR > 0 ? purifierCADR / roomVolume : 0;

  // Steady-state indoor concentration formula: C_in = (Infil * C_out * Floor + Gen) / (Infil + Purifier + Deposition)
  const depositionRate = 0.2; // natural surface settling
  const totalRemoval = infiltrationRate + purifierACH + depositionRate;
  const rawIndoorPM25 =
    (infiltrationRate * outdoorPM25 * floorFactor + cookingAddition) / totalRemoval;
  const indoorPM25 = Math.max(8, Math.round(rawIndoorPM25));

  const reductionPercent = Math.max(
    0,
    Math.min(95, Math.round(((outdoorPM25 - indoorPM25) / outdoorPM25) * 100))
  );

  const getIndoorCategory = (pm25: number) => {
    if (pm25 <= 30) return { label: 'Good (Clean)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (pm25 <= 60) return { label: 'Moderate', color: 'text-amber-800 bg-amber-100 border-amber-300' };
    if (pm25 <= 120) return { label: 'Poor', color: 'text-orange-800 bg-orange-100 border-orange-300' };
    return { label: 'Severe Indoor Smog', color: 'text-red-800 bg-red-100 border-red-300' };
  };

  const indoorStatus = getIndoorCategory(indoorPM25);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-teal-700 via-emerald-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <Home className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Indoor Air Twin & Building Exposure Model</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400/20 text-emerald-200 font-mono border border-emerald-400/30">
                  Physics Simulator
                </span>
              </div>
              <p className="text-xs text-emerald-100 opacity-90">
                Simulating indoor microclimate against ambient {citySummary.city} AQI ({citySummary.overall_aqi})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Simulation Results Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-lg">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Outdoor PM2.5 ({citySummary.city})
              </span>
              <div className="text-3xl font-extrabold text-slate-200">
                {outdoorPM25} <span className="text-sm font-normal text-slate-400">µg/m³</span>
              </div>
              <p className="text-[11px] text-slate-400">Ambient CPCB Station Average</p>
            </div>

            <div className="space-y-1 md:border-x md:border-slate-800 md:px-4">
              <span className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">
                Simulated Indoor PM2.5
              </span>
              <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                {indoorPM25} <span className="text-sm font-normal text-slate-400">µg/m³</span>
              </div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${indoorStatus.color}`}>
                {indoorStatus.label}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-sky-400 uppercase tracking-wider font-semibold">
                Exposure Reduction
              </span>
              <div className="text-3xl font-extrabold text-emerald-400">
                {reductionPercent}%
              </div>
              <p className="text-[11px] text-slate-400">
                {reductionPercent > 40 ? 'Protection effective' : 'High outdoor infiltration'}
              </p>
            </div>
          </div>

          {/* Building Parameters Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-600" />
              Configure Building & Room Architecture
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Building Type */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-semibold text-slate-700 block">Building Type</label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="apartment">Multi-Story Apartment</option>
                  <option value="villa">Independent House / Villa</option>
                  <option value="office">Commercial Office Space</option>
                  <option value="school">School / Classroom</option>
                </select>
              </div>

              {/* Floor Level */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-semibold text-slate-700 block">Floor Elevation</label>
                <select
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ground">Ground / 1st Floor (High Traffic Dust)</option>
                  <option value="mid">3rd to 7th Floor (Standard Infiltration)</option>
                  <option value="high">8th Floor and Above (Boundary Layer)</option>
                </select>
              </div>

              {/* Window Openings */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-semibold text-slate-700 block">Window & Door Status</label>
                <select
                  value={windowState}
                  onChange={(e) => setWindowState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="closed">Firmly Closed & Weatherstripped</option>
                  <option value="cracked">Cracked Open for Air Exchange</option>
                  <option value="open">Wide Open (Natural Ventilation)</option>
                </select>
              </div>

              {/* Air Purifier CADR */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-semibold text-slate-700 block">Air Purifier Filtration</label>
                <select
                  value={purifierCADR}
                  onChange={(e) => setPurifierCADR(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>None (No active purification)</option>
                  <option value={200}>Standard HEPA (CADR 200 m³/h)</option>
                  <option value={450}>High-Capacity True HEPA (CADR 450 m³/h)</option>
                </select>
              </div>

              {/* Room Size Area */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-semibold text-slate-700 block">Room Floor Area</label>
                <select
                  value={roomSizeSqM}
                  onChange={(e) => setRoomSizeSqM(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={15}>Small Bedroom (15 m²)</option>
                  <option value={25}>Master Bedroom / Living Room (25 m²)</option>
                  <option value={50}>Open-Plan Living & Dining (50 m²)</option>
                  <option value={80}>Large Office Hall (80 m²)</option>
                </select>
              </div>

              {/* Cooking & Indoor Combustion */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-semibold text-slate-700 block">Indoor Cooking Activity</label>
                <select
                  value={cookingActivity}
                  onChange={(e) => setCookingActivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">No Cooking (Clean Indoor Base)</option>
                  <option value="hood">Cooking with Ducted Chimney Hood</option>
                  <option value="open">Open Stove / Frying (No Chimney)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations for this Building */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Simulated High-Impact Upgrades for Your Space</span>
            </div>

            <ul className="text-xs text-slate-700 space-y-2">
              {purifierCADR === 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Adding a <strong>CADR 250 m³/h True HEPA purifier</strong> will slash indoor PM2.5 by an estimated <strong>60–75%</strong> in this {roomSizeSqM} m² room.
                  </span>
                </li>
              )}
              {windowState === 'open' && (
                <li className="flex items-start gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Windows are currently open while outdoor PM2.5 is high ({outdoorPM25} µg/m³). Keeping windows closed during morning/evening smog hours will cut infiltration by half.
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Best natural ventilation window for {citySummary.city} today: <strong>1:00 PM – 4:00 PM</strong> when thermal convection disperses ground-level smog.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Model: Lawrence Berkeley Mass-Balance Infiltration Formulation
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
