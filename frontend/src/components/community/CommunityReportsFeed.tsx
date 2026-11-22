import React, { useState } from 'react';
import { Users, Flame, Factory, Truck, ShieldCheck, MapPin, ThumbsUp } from 'lucide-react';
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
      hasPhoto: true,
      verified: true,
      severity: 'High',
    },
    {
      id: 'rep-2',
      category: 'stubble_smoke',
      title: 'Paddy Residue Smoke Inflow from Border Highway',
      location: `${citySummary.city} Rural Belt / Airport Road`,
      time: '1 hour ago',
      upvotes: 42,
      hasPhoto: true,
      verified: true,
      severity: 'Severe',
    },
    {
      id: 'rep-3',
      category: 'traffic_exhaust',
      title: 'Severe Diesel Idling Congestion at Central Roundabout',
      location: `${citySummary.city} Tribune Chowk`,
      time: '3 hours ago',
      upvotes: 11,
      hasPhoto: false,
      verified: false,
      severity: 'Moderate',
    },
  ]);

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
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
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
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

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {report.location}
                </span>
                <span>•</span>
                <span>{report.time}</span>
              </div>

              <button
                onClick={() => handleUpvote(report.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors"
                title="Upvote / Confirm this incident"
              >
                <ThumbsUp className="w-3 h-3" />
                <span className="font-bold">{report.upvotes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
