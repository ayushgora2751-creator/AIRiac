import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>AIRiac Citizen Portal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            data-testid="close-auth-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-sm font-semibold text-center">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-3 transition-colors ${
              activeTab === 'login'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid="tab-login"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-3 transition-colors ${
              activeTab === 'register'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid="tab-register"
          >
            Create Account
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={onClose}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={onClose}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
