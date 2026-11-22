import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CityOverview } from './components/dashboard/CityOverview';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { TrendChart } from './components/dashboard/TrendChart';
import { HealthAdvice } from './components/dashboard/HealthAdvice';
import { ChandigarhMap } from './components/map/ChandigarhMap';
import { CleanRoutePlanner } from './components/map/CleanRoutePlanner';
import { AQIForecastSection } from './components/forecast/AQIForecastSection';
import { SmartDailyPlanner } from './components/planner/SmartDailyPlanner';
import { ExposureHistoryTracker } from './components/exposure/ExposureHistoryTracker';
import { CommunityReportsFeed } from './components/community/CommunityReportsFeed';
import { FloatingAssistantWidget } from './components/assistant/FloatingAssistantWidget';
const SplineAtmosphereScene = React.lazy(() =>
  import('./components/3d/SplineAtmosphereScene').then((module) => ({
    default: module.SplineAtmosphereScene,
  }))
);
import { AirAssistantModal } from './components/assistant/AirAssistantModal';
import { HomeAirTwinModal } from './components/home/HomeAirTwinModal';
import { SmartAlertsModal } from './components/alerts/SmartAlertsModal';
import { CitizenReportModal } from './components/reports/CitizenReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollVideoBackground } from './components/common/ScrollVideoBackground';
import { useLatestAirQuality, useDiurnalTrend } from './hooks/useAirQuality';
import { INDIAN_CITIES } from './data/indianCities';
import {
  MOCK_CHANDIGARH_STATIONS,
  MOCK_CHANDIGARH_CITY_SUMMARY,
  MOCK_24H_TREND,
} from './test/mocks/mockData';

export const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Chandigarh');
  const [selectedStationId, setSelectedStationId] = useState<string>('CH-SEC22-CAAQMS');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isHomeTwinOpen, setIsHomeTwinOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);

  // Query latest live air quality data for selected city
  const { data: airData } = useLatestAirQuality(selectedCity);
  const { data: trendData } = useDiurnalTrend(selectedStationId);

  // Active city metadata for map centering and zoom
  const currentCityMeta =
    INDIAN_CITIES.find(
      (c) => c.name.toLowerCase() === selectedCity.toLowerCase()
    ) || INDIAN_CITIES[0];

  const stations = airData?.stations?.length
    ? airData.stations
    : MOCK_CHANDIGARH_STATIONS;

  const citySummary = airData?.city_summary || {
    ...MOCK_CHANDIGARH_CITY_SUMMARY,
    city: selectedCity,
  };

  // Sync station selection when switching cities
  useEffect(() => {
    if (stations.length > 0) {
      const exists = stations.some(
        (s) =>
          s.station_id === selectedStationId ||
          s.station_code === selectedStationId
      );
      if (!exists) {
        setSelectedStationId(
          stations[0].station_id || stations[0].station_code || ''
        );
      }
    }
  }, [stations, selectedStationId]);

  const fallbackStation = stations[0] || MOCK_CHANDIGARH_STATIONS[0];
  const selectedStation =
    stations.find(
      (s) =>
        s.station_id === selectedStationId ||
        s.station_code === selectedStationId
    ) || fallbackStation;

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

      {/* Navigation Header with Pan-India City Search & Feature Buttons */}
      <Header
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        selectedCity={selectedCity}
        onSelectCity={(city) => setSelectedCity(city)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenHomeTwin={() => setIsHomeTwinOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onToggle3D={() => setIs3DActive(!is3DActive)}
        is3DActive={is3DActive}
      />

      {/* 3D Spline Interactive Atmosphere Simulation (When toggled) */}
      {is3DActive && (
        <section className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-fade-in">
          <ErrorBoundary fallbackTitle="3D Scene failed to load">
            <React.Suspense
              fallback={
                <div className="w-full h-[500px] sm:h-[620px] rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin mb-4" />
                  <p className="text-sm font-semibold text-emerald-300">Loading 3D Atmospheric Simulation...</p>
                </div>
              }
            >
              <SplineAtmosphereScene
                onClose={() => setIs3DActive(false)}
                selectedCity={selectedCity}
              />
            </React.Suspense>
          </ErrorBoundary>
        </section>
      )}

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
          {/* Left Column: Spatial Map & Exposure Route Planner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 bg-white/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/50 shadow-sm">
                {selectedCity} Station Network & Heatmap
              </h3>
              <span className="text-xs text-slate-700 bg-white/75 backdrop-blur-md px-2 py-1 rounded-lg border border-white/50 shadow-sm">
                Click pin to inspect station
              </span>
            </div>

            <ErrorBoundary fallbackTitle="Geospatial Map failed to render">
              <ChandigarhMap
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                center={currentCityMeta.center}
                zoom={currentCityMeta.zoom}
              />
            </ErrorBoundary>

            <ErrorBoundary fallbackTitle="Clean Route Planner could not be loaded">
              <CleanRoutePlanner
                stations={stations}
                city={selectedCity}
              />
            </ErrorBoundary>
          </div>

          {/* Right Column: Diurnal Curve & Multi-Day Forecast */}
          <div className="space-y-4">
            <ErrorBoundary fallbackTitle="Pollution Trend Chart failed to render">
              <TrendChart
                data={trendSeries}
                stationName={selectedStation?.name || `${selectedCity} Station`}
              />
            </ErrorBoundary>

            <ErrorBoundary fallbackTitle="AQI Forecast failed to render">
              <AQIForecastSection
                trendSeries={trendSeries}
                citySummary={citySummary}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Smart Daily Planner (Hourly Activity Optimizer) */}
        <ErrorBoundary fallbackTitle="Smart Daily Planner could not be loaded">
          <SmartDailyPlanner
            trendSeries={trendSeries}
            citySummary={citySummary}
          />
        </ErrorBoundary>

        {/* 7-Pollutant Sub-Index Breakdown */}
        <ErrorBoundary fallbackTitle="Pollutant Breakdown could not be displayed">
          <PollutantGrid
            pollutants={pollutants}
            dominantPollutant={dominantPollutant}
          />
        </ErrorBoundary>

        {/* Personal Exposure Dosimetry & Inhalation Tracker */}
        <ErrorBoundary fallbackTitle="Personal Exposure Tracker could not be loaded">
          <ExposureHistoryTracker
            citySummary={citySummary}
          />
        </ErrorBoundary>

        {/* Contextual Health Advisory */}
        <ErrorBoundary fallbackTitle="Health Advisory could not be displayed">
          <HealthAdvice
            category={citySummary?.category || 'Moderate'}
            aqi={citySummary?.overall_aqi ?? 100}
          />
        </ErrorBoundary>

        {/* Community Reports Hotspot Feed */}
        <ErrorBoundary fallbackTitle="Community Reports Feed could not be loaded">
          <CommunityReportsFeed
            citySummary={citySummary}
            onOpenReportModal={() => setIsReportOpen(true)}
          />
        </ErrorBoundary>
      </main>

      {/* Floating Instant AI Assistant Widget */}
      <FloatingAssistantWidget
        onClick={() => setIsAssistantOpen(true)}
        city={selectedCity}
        aqi={citySummary?.overall_aqi ?? 150}
      />

      {/* Footer */}
      <Footer />

      {/* Feature Modals */}
      <AirAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        citySummary={citySummary}
      />

      <HomeAirTwinModal
        isOpen={isHomeTwinOpen}
        onClose={() => setIsHomeTwinOpen(false)}
        citySummary={citySummary}
      />

      <SmartAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        citySummary={citySummary}
      />

      <CitizenReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        citySummary={citySummary}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
