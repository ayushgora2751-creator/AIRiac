import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, BookOpen, X } from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';
import { apiClient } from '../../api/client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  why?: {
    currentAQI: number;
    category: string;
    ruleId: string;
    guideline: string;
    safeWindow?: string;
  };
  timestamp: string;
}

interface AirAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  citySummary: CityAQISummary;
}

const SUGGESTED_QUESTIONS = [
  'Is it safe to go outside right now?',
  'Can I exercise or jog outdoors today?',
  'Should I wear an N95 mask?',
  'What precautions should sensitive groups take?',
  'When is the best time to open windows today?',
];

export const AirAssistantModal: React.FC<AirAssistantModalProps> = ({
  isOpen,
  onClose,
  citySummary,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your BreatheWise Environmental Health Assistant for **${citySummary.city}**. Current AQI is **${citySummary.overall_aqi} (${citySummary.category})**. Ask me anything about outdoor safety, masks, indoor ventilation, or precautions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const getRuleAnswer = (question: string) => {
    const q = question.toLowerCase();
    const aqi = citySummary.overall_aqi;
    const cat = citySummary.category;

    if (q.includes('safe to go outside') || q.includes('go out') || q.includes('outside')) {
      if (aqi <= 100) {
        return {
          text: `Yes, it is completely safe to go outdoors in ${citySummary.city} today! The AQI is ${aqi} (${cat}), which satisfies safe ambient exposure guidelines.`,
          ruleId: 'RULE-OUTDOOR-SAFE-01',
          guideline: 'CPCB National Ambient Air Quality Standard: AQI 0–100 presents minimal respiratory risk.',
        };
      } else if (aqi <= 200) {
        return {
          text: `It is generally acceptable for healthy adults to go outside, but individuals with asthma or cardiovascular conditions should limit prolonged heavy physical exertion. Current AQI is ${aqi} (${cat}).`,
          ruleId: 'RULE-OUTDOOR-MODERATE-02',
          guideline: 'CPCB Advisory: Moderate band may cause breathing discomfort to people with sensitive lungs.',
        };
      } else {
        return {
          text: `It is NOT recommended to spend prolonged time outside in ${citySummary.city}. With an AQI of ${aqi} (${cat}), particulate concentrations can irritate airways and trigger severe respiratory distress.`,
          ruleId: 'RULE-OUTDOOR-UNSAFE-03',
          guideline: 'CPCB Health Notice: Poor/Severe bands require minimizing all non-essential outdoor exposure.',
        };
      }
    }

    if (q.includes('exercise') || q.includes('jog') || q.includes('run') || q.includes('workout')) {
      if (aqi <= 100) {
        return {
          text: `You can freely exercise and run outdoors today! Conditions are optimal with low particulate burden.`,
          ruleId: 'RULE-EXERCISE-OPTIMAL',
          guideline: 'WHO Global Air Quality Guidelines 2021: Low exposure zone supports vigorous outdoor athletics.',
        };
      } else if (aqi <= 200) {
        return {
          text: `Substitute intense cardio with light walking, or shift your workout indoors. If running outside, avoid early morning and late evening rush hours when ground inversions trap smog.`,
          ruleId: 'RULE-EXERCISE-CAUTION',
          guideline: 'Indian NAQI Guidelines: Heavy ventilation increases lung deposition of PM2.5 threefold during moderate smog.',
        };
      } else {
        return {
          text: `Avoid all outdoor running and intense exercise! At AQI ${aqi}, exercising outdoors forces large volumes of PM2.5 and PM10 directly into deep alveolar lung tissue. Move all workouts to an indoor filtered space.`,
          ruleId: 'RULE-EXERCISE-PROHIBIT',
          guideline: 'CPCB Health Advisory: High pollution exercise ban to prevent acute bronchospasms.',
        };
      }
    }

    if (q.includes('mask') || q.includes('n95')) {
      if (aqi <= 100) {
        return {
          text: `A mask is not necessary today in ${citySummary.city} for normal outdoor activities.`,
          ruleId: 'RULE-MASK-OPTIONAL',
          guideline: 'CPCB Standard: Masks not indicated below AQI 100 unless working in heavy industrial dust.',
        };
      } else if (aqi <= 200) {
        return {
          text: `A tight-fitting N95 or FFP2 respirator is recommended if you commute through dense traffic corridors or have respiratory sensitivity.`,
          ruleId: 'RULE-MASK-RECOMMENDED',
          guideline: 'ICMR Respiratory Protection Protocol: N95 filters at least 95% of PM2.5 particulates.',
        };
      } else {
        return {
          text: `YES, a certified N95 / FFP2 mask is strictly necessary whenever stepping outdoors! Cloth masks and surgical masks do not filter fine PM2.5 particles effectively.`,
          ruleId: 'RULE-MASK-MANDATORY',
          guideline: 'CPCB/ICMR Emergency Smog Protocol: Proper seal N95 mask mandatory above AQI 200.',
        };
      }
    }

    if (q.includes('window') || q.includes('ventilate') || q.includes('ventilation')) {
      return {
        text: `The optimal ventilation window in ${citySummary.city} today is between **1:00 PM and 4:00 PM**. During mid-day, solar heating expands the atmospheric boundary layer (mixing height > 900m) and wind disperses surface contaminants. Keep windows closed before 9:00 AM and after 7:00 PM when shallow ground inversions trap smoke.`,
        ruleId: 'RULE-VENTILATION-WINDOW',
        guideline: 'IMD Boundary Layer Dynamics: Convective dispersion highest during afternoon solar peak.',
        safeWindow: '13:00 - 16:00 IST',
      };
    }

    if (q.includes('sensitive') || q.includes('precaution') || q.includes('children') || q.includes('elderly')) {
      return {
        text: `Key precautions for sensitive groups (children, seniors, asthma/heart patients) in ${citySummary.city} today:
1. Keep rescue inhalers and prescribed respiratory medications readily accessible.
2. Run a HEPA air purifier inside primary sleeping and living areas.
3. Keep windows and doors sealed during early morning and night.
4. Stay well-hydrated to keep mucus membranes clear.`,
        ruleId: 'RULE-SENSITIVE-GROUPS',
        guideline: 'Ministry of Health & Family Welfare (MoHFW) Advisory on Air Pollution.',
      };
    }

    return {
      text: `Based on current observations in ${citySummary.city} (AQI ${aqi}, ${cat}), our deterministic impact engine recommends staying aware of air conditions, avoiding biomass smoke zones, and checking diurnal trends before outdoor activities.`,
      ruleId: 'RULE-GENERAL-EXPOSURE',
      guideline: 'CPCB Indian National Air Quality Index Standards.',
    };
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await apiClient.post<any>('/advice/chat/', {
        question: query,
        city: citySummary.city,
        aqi: citySummary.overall_aqi,
        category: citySummary.category,
        prominent_pollutant: citySummary.dominant_pollutant,
      });

      const data = res.data;
      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || getRuleAnswer(query).text,
        why: {
          currentAQI: citySummary.overall_aqi,
          category: citySummary.category,
          ruleId: data.is_llm ? 'GEMINI-AIRIAC-AI' : (data.rule_id || 'RULE-SAFETY'),
          guideline: data.is_llm
            ? 'Google Gemini API • CPCB NAQI Medical Guidelines'
            : 'CPCB National Ambient Air Quality Standards',
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const rule = getRuleAnswer(query);
      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: rule.text,
        why: {
          currentAQI: citySummary.overall_aqi,
          category: citySummary.category,
          ruleId: rule.ruleId,
          guideline: rule.guideline,
          safeWindow: rule.safeWindow,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col h-[640px] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <Bot className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">BreatheWise Air AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400/20 text-emerald-200 font-mono border border-emerald-400/30">
                  Rule-Engine CPCB
                </span>
              </div>
              <p className="text-xs text-emerald-100 opacity-90">
                Context: {citySummary.city} • AQI {citySummary.overall_aqi} ({citySummary.category})
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

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 border border-slate-200/80 text-slate-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Explainability Breakdown Card */}
                {msg.why && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Explainability & Source Citation</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Rule Trigger:</strong> {msg.why.ruleId} • <strong>City AQI:</strong> {msg.why.currentAQI}
                    </p>
                    <p className="text-[11px] text-slate-600 italic">
                      "{msg.why.guideline}"
                    </p>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1.5 opacity-70 ${
                    msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic pl-11">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              Evaluating CPCB health rules...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Suggestions:</span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 whitespace-nowrap transition-all shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about air quality in ${citySummary.city}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50 text-slate-900"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
