import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CityOverview } from './components/dashboard/CityOverview';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { TrendChart } from './components/dashboard/TrendChart';
import { HealthAdvice } from './components/dashboard/HealthAdvice';
import { ChandigarhMap } from './components/map/ChandigarhMap';
import { AuthModal } from './components/auth/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollVideoBackground } from './components/common/ScrollVideoBackground';
import { useLatestAirQuality, useDiurnalTrend } from './hooks/useAirQuality';
import {
  MOCK_CHANDIGARH_STATIONS,
  MOCK_CHANDIGARH_CITY_SUMMARY,
  MOCK_24H_TREND,
} from './test/mocks/mockData';

export const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string>('CH-SEC22-CAAQMS');

  // Query latest live air quality data from backend (falls back seamlessly to deterministic fixtures)
  const { data: airData } = useLatestAirQuality();
  const { data: trendData } = useDiurnalTrend(selectedStationId);

  const stations = airData?.stations?.length
    ? airData.stations
    : MOCK_CHANDIGARH_STATIONS;

  const citySummary = airData?.city_summary || MOCK_CHANDIGARH_CITY_SUMMARY;

  const fallbackStation = MOCK_CHANDIGARH_STATIONS[0];
  const selectedStation =
    stations.find(
      (s) =>
        s.station_id === selectedStationId ||
        (s as any).station_code === selectedStationId
    ) ||
    stations[0] ||
    fallbackStation;

  const trendSeries = trendData?.series?.length
    ? trendData.series
    : MOCK_24H_TREND;

  const pollutants = selectedStation?.pollutants || fallbackStation.pollutants;
  const dominantPollutant =
    selectedStation?.dominant_pollutant || fallbackStation.dominant_pollutant;

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 300-Frame Scroll-Driven Video Background */}
      <ScrollVideoBackground
        totalFrames={300}
        framePrefix="/frames/ezgif-frame-"
        frameExtension=".jpg"
        overlayOpacity={0.25}
      />

      {/* Navigation Header (Sticky Above Background) */}
      <Header
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        selectedStation={selectedStationId}
        onSelectStation={setSelectedStationId}
      />

      {/* Main Dashboard Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* City Summary Hero */}
        <ErrorBoundary fallbackTitle="City Overview could not be displayed">
          <CityOverview
            summary={citySummary}
            selectedStationName={selectedStation?.name}
          />
        </ErrorBoundary>

        {/* Spatial Map and Trend Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 bg-white/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/50 shadow-sm">
                Chandigarh CAAQMS Station Network
              </h3>
              <span className="text-xs text-slate-700 bg-white/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/50 shadow-sm">
                Click pin to inspect station
              </span>
            </div>
            <ErrorBoundary fallbackTitle="Geospatial Map failed to render">
              <ChandigarhMap
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
              />
            </ErrorBoundary>
          </div>

          <div className="space-y-2">
            <ErrorBoundary fallbackTitle="Pollution Trend Chart failed to render">
              <TrendChart
                data={trendSeries}
                stationName={selectedStation?.name || 'Sector 22 CAAQMS'}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* 7-Pollutant Sub-Index Breakdown */}
        <ErrorBoundary fallbackTitle="Pollutant Breakdown could not be displayed">
          <PollutantGrid
            pollutants={pollutants}
            dominantPollutant={dominantPollutant}
          />
        </ErrorBoundary>

        {/* Contextual Health Advisory */}
        <ErrorBoundary fallbackTitle="Health Advisory could not be displayed">
          <HealthAdvice
            category={citySummary?.category || 'Moderate'}
            aqi={citySummary?.overall_aqi ?? 100}
          />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
