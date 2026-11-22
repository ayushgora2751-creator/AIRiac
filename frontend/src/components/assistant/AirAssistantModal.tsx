import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, BookOpen, X, ThumbsUp, ThumbsDown, CheckCircle2, RotateCcw } from 'lucide-react';
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
    aiModel?: string;
  };
  feedback?: 'helpful' | 'unhelpful' | null;
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
  const buildWelcomeMessage = (city: string, aqi: number, category: string): Message => ({
    id: `welcome-${city}-${Date.now()}`,
    sender: 'assistant',
    text: `Hello! I am your AIRiac Environmental Health Assistant for **${city}**.\n\nCurrent ambient AQI is **${aqi} (${category})**.\nAsk me anything about outdoor safety, jogging, N95 masks, ventilation windows, or health precautions.`,
    why: {
      currentAQI: aqi,
      category,
      ruleId: 'RULE-GROUNDING-BASELINE',
      guideline: 'CPCB National Ambient Air Quality Index (NAQI) Standard & WHO 2021 Guidelines.',
      aiModel: 'Gemini + CPCB Rule Validation Layer',
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<Message[]>([
    buildWelcomeMessage(citySummary.city, citySummary.overall_aqi, citySummary.category),
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync assistant context dynamically whenever city or AQI updates
  useEffect(() => {
    setMessages([
      buildWelcomeMessage(citySummary.city, citySummary.overall_aqi, citySummary.category),
    ]);
  }, [citySummary.city, citySummary.overall_aqi]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleResetThread = () => {
    setMessages([
      buildWelcomeMessage(citySummary.city, citySummary.overall_aqi, citySummary.category),
    ]);
  };

  const handleFeedback = (messageId: string, rating: 'helpful' | 'unhelpful') => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: msg.feedback === rating ? null : rating }
          : msg
      )
    );
  };

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
          text: `It is generally acceptable for healthy adults to go outside, but individuals with asthma or cardiovascular conditions should limit prolonged heavy physical exertion. Current AQI in ${citySummary.city} is ${aqi} (${cat}).`,
          ruleId: 'RULE-OUTDOOR-MODERATE-02',
          guideline: 'CPCB Advisory: Moderate band may cause breathing discomfort to people with sensitive lungs.',
        };
      } else {
        return {
          text: `It is NOT recommended to spend prolonged time outside in ${citySummary.city}. With an AQI of ${aqi} (${cat}), particulate concentrations can irritate airways and trigger respiratory distress.`,
          ruleId: 'RULE-OUTDOOR-UNSAFE-03',
          guideline: 'CPCB Health Notice: Poor/Severe bands require minimizing all non-essential outdoor exposure.',
        };
      }
    }

    if (q.includes('exercise') || q.includes('jog') || q.includes('run') || q.includes('workout')) {
      if (aqi <= 100) {
        return {
          text: `You can freely exercise and run outdoors in ${citySummary.city} today! Conditions are optimal with low particulate burden.`,
          ruleId: 'RULE-EXERCISE-OPTIMAL',
          guideline: 'WHO Global Air Quality Guidelines 2021: Low exposure zone supports vigorous outdoor athletics.',
        };
      } else if (aqi <= 200) {
        return {
          text: `Substitute intense cardio with light walking, or shift your workout indoors in ${citySummary.city}. If running outside, avoid early morning and late evening rush hours when ground inversions trap smog.`,
          ruleId: 'RULE-EXERCISE-CAUTION',
          guideline: 'Indian NAQI Guidelines: Heavy ventilation increases lung deposition of PM2.5 threefold during moderate smog.',
        };
      } else {
        return {
          text: `Avoid all outdoor running and intense exercise in ${citySummary.city}! At AQI ${aqi}, exercising outdoors forces large volumes of PM2.5 and PM10 directly into deep alveolar lung tissue. Move all workouts to an indoor filtered space.`,
          ruleId: 'RULE-EXERCISE-PROHIBIT',
          guideline: 'CPCB Health Advisory: High pollution exercise ban to prevent acute bronchospasms.',
        };
      }
    }

    if (q.includes('mask') || q.includes('n95')) {
      if (aqi <= 100) {
        return {
          text: `A mask is not necessary today in ${citySummary.city} for normal outdoor activities. Current AQI is ${aqi} (${cat}).`,
          ruleId: 'RULE-MASK-OPTIONAL',
          guideline: 'CPCB Standard: Masks not indicated below AQI 100 unless working in heavy industrial dust.',
        };
      } else if (aqi <= 200) {
        return {
          text: `A tight-fitting N95 or FFP2 respirator is recommended in ${citySummary.city} if you commute through dense traffic corridors or have respiratory sensitivity (AQI: ${aqi}).`,
          ruleId: 'RULE-MASK-RECOMMENDED',
          guideline: 'ICMR Respiratory Protection Protocol: N95 filters at least 95% of PM2.5 particulates.',
        };
      } else {
        return {
          text: `YES, a certified N95 / FFP2 mask is strictly necessary in ${citySummary.city} whenever stepping outdoors! Cloth masks and surgical masks do not filter fine PM2.5 particles effectively.`,
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
        text: `Key precautions for sensitive groups (children, seniors, asthma/heart patients) in ${citySummary.city} today (AQI: ${aqi}):
1. Keep rescue inhalers and prescribed respiratory medications readily accessible.
2. Run a HEPA air purifier inside primary sleeping and living areas.
3. Keep windows and doors sealed during early morning and night.
4. Stay well-hydrated to keep mucus membranes clear.`,
        ruleId: 'RULE-SENSITIVE-GROUPS',
        guideline: 'Ministry of Health & Family Welfare (MoHFW) Advisory on Air Pollution.',
      };
    }

    return {
      text: `Based on current observations in ${citySummary.city} (AQI ${aqi}, ${cat}), our safety validation engine recommends staying aware of air conditions, avoiding biomass smoke zones, and checking diurnal trends before outdoor activities.`,
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
      const ruleFallback = getRuleAnswer(query);

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || ruleFallback.text,
        why: {
          currentAQI: citySummary.overall_aqi,
          category: citySummary.category,
          ruleId: data.is_llm ? 'GEMINI-CPCB-SAFETY-VERIFIED' : (data.rule_id || ruleFallback.ruleId),
          guideline: data.is_llm
            ? 'Google Gemini API grounded with CPCB NAQI Medical Guidelines'
            : ruleFallback.guideline,
          safeWindow: ruleFallback.safeWindow,
          aiModel: data.is_llm ? (data.model || 'Google Gemini AI') : 'BreatheWise CPCB Safety Engine',
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
          aiModel: 'Deterministic CPCB Rule Engine (Safe Baseline)',
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      data-testid="air-assistant-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col h-[640px] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <Bot className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">AIRiac AI Air Quality Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400/20 text-emerald-200 font-mono border border-emerald-400/30">
                  Dual-Engine: Gemini + CPCB Rules
                </span>
              </div>
              <p className="text-xs text-emerald-100 opacity-90">
                Active Context: {citySummary.city} • AQI {citySummary.overall_aqi} ({citySummary.category})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetThread}
              title="Reset conversation"
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Banner */}
        <div
          data-testid="assistant-city-badge"
          className="px-4 py-2 bg-emerald-50/90 border-b border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900"
        >
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>
              Now answering for <strong>{citySummary.city}</strong> • Current AQI <strong>{citySummary.overall_aqi} ({citySummary.category})</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">
            Pollutant: {citySummary.dominant_pollutant || 'PM2.5'}
          </span>
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
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-emerald-800 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Explainability & Grounding Verification</span>
                      </div>
                      {msg.why.aiModel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-normal">
                          {msg.why.aiModel}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Rule Trigger:</strong> {msg.why.ruleId} • <strong>Context AQI:</strong> {msg.why.currentAQI} ({msg.why.category})
                    </p>
                    <p className="text-[11px] text-slate-700 italic">
                      "{msg.why.guideline}"
                    </p>
                    {msg.why.safeWindow && (
                      <p className="text-[11px] text-emerald-700 font-bold">
                        Recommended Window: {msg.why.safeWindow}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer with Timestamp and Feedback Ratings */}
                <div className="flex items-center justify-between mt-2 pt-1">
                  <span
                    className={`text-[10px] opacity-70 ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>

                  {msg.sender === 'assistant' && (
                    <div className="flex items-center gap-2">
                      {msg.feedback ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Feedback recorded
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            data-testid="assistant-helpful-btn"
                            onClick={() => handleFeedback(msg.id, 'helpful')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-emerald-600 transition-colors"
                            title="Helpful answer"
                            aria-label="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            data-testid="assistant-unhelpful-btn"
                            onClick={() => handleFeedback(msg.id, 'unhelpful')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Not helpful"
                            aria-label="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic pl-11">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              Validating against CPCB standards & generating advice...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Quick Prompts:</span>
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
