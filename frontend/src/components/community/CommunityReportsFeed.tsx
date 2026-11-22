import React, { useState } from 'react';
import { Users, Flame, Factory, Truck, ShieldCheck, MapPin, ThumbsUp, Flag } from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';

interface CommunityReportsFeedProps {
  citySummary: CityAQISummary;
  onOpenReportModal: () => void;
}

export const CommunityReportsFeed: React.FC<CommunityReportsFeedProps> = ({
  citySummary,
  onOpenReportModal,
}) => {
  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      category: 'garbage_burning',
      title: 'Open Leaf & Waste Burning behind Sector Market',
      location: `${citySummary.city} Sector 26`,
      time: '28 mins ago',
      upvotes: 19,
      flagged: 1,
      hasPhoto: true,
      verified: true,
      severity: 'High',
      userVote: null as 'helpful' | 'inaccurate' | null,
    },
    {
      id: 'rep-2',
      category: 'stubble_smoke',
      title: 'Paddy Residue Smoke Inflow from Border Highway',
      location: `${citySummary.city} Rural Belt / Airport Road`,
      time: '1 hour ago',
      upvotes: 42,
      flagged: 3,
      hasPhoto: true,
      verified: true,
      severity: 'Severe',
      userVote: null as 'helpful' | 'inaccurate' | null,
    },
    {
      id: 'rep-3',
      category: 'traffic_exhaust',
      title: 'Severe Diesel Idling Congestion at Central Roundabout',
      location: `${citySummary.city} Tribune Chowk`,
      time: '3 hours ago',
      upvotes: 11,
      flagged: 0,
      hasPhoto: false,
      verified: false,
      severity: 'Moderate',
      userVote: null as 'helpful' | 'inaccurate' | null,
    },
  ]);

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newUpvotes = r.userVote === 'helpful' ? r.upvotes - 1 : r.upvotes + 1;
        const newFlagged = r.userVote === 'inaccurate' ? r.flagged - 1 : r.flagged;
        return {
          ...r,
          upvotes: newUpvotes,
          flagged: newFlagged,
          userVote: r.userVote === 'helpful' ? null : 'helpful',
        };
      })
    );
  };

  const handleFlagInaccurate = (id: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newFlagged = r.userVote === 'inaccurate' ? r.flagged - 1 : r.flagged + 1;
        const newUpvotes = r.userVote === 'helpful' ? r.upvotes - 1 : r.upvotes;
        return {
          ...r,
          flagged: newFlagged,
          upvotes: newUpvotes,
          userVote: r.userVote === 'inaccurate' ? null : 'inaccurate',
        };
      })
    );
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'garbage_burning':
      case 'stubble_smoke':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'industrial':
        return <Factory className="w-4 h-4 text-indigo-500" />;
      default:
        return <Truck className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Community Pollution Reports • {citySummary.city}
            </h3>
            <p className="text-xs text-slate-500">
              Crowdsourced hotspot surveillance & citizen environmental accountability
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          + Report Local Hotspot
        </button>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-xl border border-slate-200/80 bg-white/90 hover:bg-white transition-all space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100">
                  {getCategoryIcon(report.category)}
                </div>
                <span className="font-bold text-slate-900">{report.title}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {report.verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    CPCB Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Community Reported
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {report.location}
                </span>
                <span>•</span>
                <span>{report.time}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Helpful / Confirm button */}
                <button
                  onClick={() => handleUpvote(report.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    report.userVote === 'helpful'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                  }`}
                  title="Confirm as accurate & helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful</span>
                  <span className="font-bold font-mono">{report.upvotes}</span>
                </button>

                {/* Inaccurate / Flag button */}
                <button
                  onClick={() => handleFlagInaccurate(report.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs transition-all ${
                    report.userVote === 'inaccurate'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border-slate-200'
                  }`}
                  title="Mark as inaccurate or resolved"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inaccurate</span>
                  {report.flagged > 0 && (
                    <span className="font-bold font-mono">{report.flagged}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
