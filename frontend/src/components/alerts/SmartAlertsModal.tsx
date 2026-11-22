import React, { useState } from 'react';
import {
  BellRing,
  Smartphone,
  MessageSquare,
  Check,
  X,
  Send,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';
import { apiClient } from '../../api/client';

interface SmartAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  citySummary: CityAQISummary;
}

interface DispatchLog {
  id: string;
  timestamp: string;
  channel: string;
  event: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Opted out';
}

export const SmartAlertsModal: React.FC<SmartAlertsModalProps> = ({
  isOpen,
  onClose,
  citySummary,
}) => {
  const [threshold, setThreshold] = useState<number>(150);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [optedOutOfAll, setOptedOutOfAll] = useState(false);

  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([
    {
      id: 'log-1',
      timestamp: 'Today 08:00 AM',
      channel: 'In-App Banner',
      event: `Morning Inversion Briefing • AQI ${citySummary.overall_aqi}`,
      status: 'Delivered',
    },
    {
      id: 'log-2',
      timestamp: 'Today 07:15 AM',
      channel: 'WhatsApp',
      event: `Pre-commute Smog Alert (Threshold ${threshold} Exceeded)`,
      status: 'Sent',
    },
    {
      id: 'log-3',
      timestamp: 'Yesterday 09:30 PM',
      channel: 'SMS Gateway',
      event: 'Nocturnal Stubble Inflow Warning',
      status: 'Opted out',
    },
    {
      id: 'log-4',
      timestamp: 'Yesterday 06:45 PM',
      channel: 'Mailercloud Email',
      event: 'Evening Microclimate Ventilation Summary',
      status: 'Delivered',
    },
  ]);

  if (!isOpen) return null;

  const handleSimulateAlert = async () => {
    setIsSimulating(true);
    try {
      await apiClient.post<any>('/alerts/test-send/', {
        email: 'citizen@breathewise.in',
        name: 'Active Citizen',
        city: citySummary.city,
        aqi: citySummary.overall_aqi,
        category: citySummary.category,
      });
    } catch {
      // Local fallback simulation
    }

    const newLog: DispatchLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: notifyEmail ? 'Mailercloud Email' : 'In-App Banner',
      event: `Test Alert Triggered: ${citySummary.city} AQI ${citySummary.overall_aqi} (${citySummary.category})`,
      status: 'Delivered',
    };

    setDispatchLogs([newLog, ...dispatchLogs]);
    setIsSimulating(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const getStatusBadge = (status: DispatchLog['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Send className="w-3 h-3 text-blue-600" />
            Sent
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      case 'Opted out':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            Opted out
          </span>
        );
    }
  };

  return (
    <div
      data-testid="smart-alerts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <BellRing className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Smart Pollution Alerts & Dispatch Gateway</h3>
              <p className="text-xs text-amber-100 opacity-90">
                Personalized thresholds, multi-channel dispatch status & delivery audit logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
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

          {/* Delivery Channels with Status Badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Notification Channels & Live Status
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Click card to toggle channel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* In-App */}
              <div
                onClick={() => setNotifyInApp(!notifyInApp)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  notifyInApp
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className={`w-4 h-4 ${notifyInApp ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-bold">In-App Live Banner</span>
                    <span className="text-[10px] text-slate-500 font-normal">Realtime browser notification</span>
                  </div>
                </div>
                {notifyInApp ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active • Sent
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Opted out
                  </span>
                )}
              </div>

              {/* WhatsApp */}
              <div
                onClick={() => setNotifyWhatsApp(!notifyWhatsApp)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  notifyWhatsApp
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className={`w-4 h-4 ${notifyWhatsApp ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-bold">WhatsApp Dispatch</span>
                    <span className="text-[10px] text-slate-500 font-normal">Direct mobile advisory</span>
                  </div>
                </div>
                {notifyWhatsApp ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active • Delivered
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Opted out
                  </span>
                )}
              </div>

              {/* Email */}
              <div
                onClick={() => setNotifyEmail(!notifyEmail)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  notifyEmail
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 ${notifyEmail ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-bold">Mailercloud Email</span>
                    <span className="text-[10px] text-slate-500 font-normal">Morning & evening briefings</span>
                  </div>
                </div>
                {notifyEmail ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active • Delivered
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Opted out
                  </span>
                )}
              </div>

              {/* SMS */}
              <div
                onClick={() => setNotifySMS(!notifySMS)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  notifySMS
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className={`w-4 h-4 ${notifySMS ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-bold">SMS Emergency</span>
                    <span className="text-[10px] text-slate-500 font-normal">Severe pollution spikes</span>
                  </div>
                </div>
                {notifySMS ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active • Sent
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Opted out
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Simulation & Dispatch Log Table */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Recent Alert Dispatches & Delivery Logs
              </span>
              <button
                onClick={handleSimulateAlert}
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isSimulating ? 'Dispatching...' : 'Simulate Test Alert'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Channel</th>
                    <th className="p-2.5">Advisory Event</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-2.5 font-medium text-slate-800 whitespace-nowrap">
                        {log.channel}
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">
                        {log.event}
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unsubscribe & Consent Management */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800">Unsubscribe & Privacy Preferences</span>
              <p className="text-[11px] text-slate-500">
                You can opt out of automated SMS and email dispatches at any time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setOptedOutOfAll(!optedOutOfAll);
                  if (!optedOutOfAll) {
                    setNotifyInApp(false);
                    setNotifyWhatsApp(false);
                    setNotifySMS(false);
                    setNotifyEmail(false);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-200 font-semibold text-slate-700"
              >
                {optedOutOfAll ? 'Restore Alerts' : 'Opt Out of All'}
              </button>
              <a
                href="#unsubscribe"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Unsubscribe link simulated: Your email citizen@breathewise.in has been unsubscribed from promotional alerts.');
                }}
                className="text-xs text-amber-700 hover:text-amber-900 underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Unsubscribe Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current City: <strong>{citySummary.city}</strong> (AQI {citySummary.overall_aqi})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'Preferences Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
