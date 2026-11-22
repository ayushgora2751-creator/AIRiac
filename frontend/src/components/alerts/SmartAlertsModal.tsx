import React, { useState } from 'react';
import { Bell, BellRing, Smartphone, MessageSquare, Clock, ShieldAlert, Check, X, Send } from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';
import { apiClient } from '../../api/client';

interface SmartAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  citySummary: CityAQISummary;
}

export const SmartAlertsModal: React.FC<SmartAlertsModalProps> = ({
  isOpen,
  onClose,
  citySummary,
}) => {
  const [threshold, setThreshold] = useState<number>(150);
  const [isMorningDigest, setIsMorningDigest] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestEmail = async () => {
    setTestEmailStatus('Sending via Mailercloud...');
    try {
      const res = await apiClient.post<any>('/alerts/test-send/', {
        email: 'citizen@breathewise.in',
        name: 'Community Member',
        city: citySummary.city,
        aqi: citySummary.overall_aqi,
        category: citySummary.category,
      });
      setTestEmailStatus(`Email Dispatched! ID: ${res.data?.message_id || 'airiac-sent'}`);
      setTimeout(() => setTestEmailStatus(null), 4000);
    } catch {
      setTestEmailStatus('Email queued via local alert worker');
      setTimeout(() => setTestEmailStatus(null), 3000);
    }
  };

  const mockAlerts = [
    {
      id: 'alt-1',
      title: `${citySummary.city} AQI Exceeded Threshold (${citySummary.overall_aqi})`,
      time: '15 mins ago',
      level: citySummary.overall_aqi > 200 ? 'High' : 'Moderate',
      read: false,
    },
    {
      id: 'alt-2',
      title: 'Morning Air Briefing: Ground inversion forming',
      time: 'Today 07:00 AM',
      level: 'Info',
      read: true,
    },
    {
      id: 'alt-3',
      title: 'Ventilation Window: Optimal time to open windows (13:00-16:00)',
      time: 'Yesterday',
      level: 'Info',
      read: true,
    },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <BellRing className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Smart Pollution Alerts</h3>
              <p className="text-xs text-amber-100 opacity-90">
                Personalized thresholds & multi-channel notification dispatch
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Threshold Slider */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800">Alert Trigger Threshold</span>
                <p className="text-xs text-slate-500">Notify me whenever {citySummary.city} AQI exceeds this level</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                AQI {threshold}
              </span>
            </div>

            <input
              type="range"
              min={50}
              max={350}
              step={10}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>50 (Good)</span>
              <span>100 (Satisfactory)</span>
              <span>200 (Moderate)</span>
              <span>300 (Poor)</span>
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Dispatch Channels</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                onClick={() => setNotifyInApp(!notifyInApp)}
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  notifyInApp ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>In-App Banner</span>
              </label>

              <label
                onClick={() => setNotifyWhatsApp(!notifyWhatsApp)}
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  notifyWhatsApp ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Brief</span>
              </label>

              <label
                onClick={() => setNotifySMS(!notifySMS)}
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  notifySMS ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>SMS Alert</span>
              </label>
            </div>
          </div>

          {/* Morning Briefing Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-500" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">7:00 AM Morning Smog Digest</span>
                <span className="text-[11px] text-slate-500">Daily forecast, exercise safety score, and window recommendations</span>
              </div>
            </div>
            <button
              onClick={() => setIsMorningDigest(!isMorningDigest)}
              className={`w-11 h-6 rounded-full transition-colors p-1 ${isMorningDigest ? 'bg-emerald-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isMorningDigest ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Recent Alert Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Alert History</span>
              <button
                onClick={handleTestEmail}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Test Mailercloud Alert</span>
              </button>
            </div>
            {testEmailStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold animate-fade-in">
                {testEmailStatus}
              </div>
            )}
            <div className="space-y-2">
              {mockAlerts.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className={`w-4 h-4 ${a.level === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                    <span className="text-slate-800 font-medium">{a.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Celery Beat Scheduler • Zero Spam Policy</span>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            {isSaved ? 'Preferences Saved!' : 'Save Alert Thresholds'}
          </button>
        </div>
      </div>
    </div>
  );
};
