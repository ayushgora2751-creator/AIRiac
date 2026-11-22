import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, AlertCircle } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const CHANDIGARH_SECTOR_OPTIONS = [
  'Sector 1',
  'Sector 6',
  'Sector 17',
  'Sector 22',
  'Sector 25',
  'Sector 35',
  'Sector 43',
  'Sector 53',
  'Industrial Area Phase 1',
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredSector, setPreferredSector] = useState('Sector 17');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        preferred_sector: preferredSector,
      });
      onSuccess();
    } catch (err: unknown) {
      const respData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      let message = 'Registration failed. Please check your information.';
      if (respData) {
        if (respData.email) {
          message = Array.isArray(respData.email) ? respData.email[0] : String(respData.email);
        } else if (respData.password) {
          message = Array.isArray(respData.password) ? respData.password[0] : String(respData.password);
        } else if (respData.detail) {
          message = String(respData.detail);
        }
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" data-testid="register-form">
      {errorMsg && (
        <div
          data-testid="auth-error-banner"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="register-firstname"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            First Name
          </label>
          <input
            id="register-firstname"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Sukhwinder"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="register-lastname"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Last Name
          </label>
          <input
            id="register-lastname"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Singh"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="citizen@chandigarh.gov.in"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Password (min 8 characters)
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="register-sector"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Preferred Chandigarh Sector
        </label>
        <select
          id="register-sector"
          value={preferredSector}
          onChange={(e) => setPreferredSector(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
        >
          {CHANDIGARH_SECTOR_OPTIONS.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
      >
        <UserPlus className="w-4 h-4" />
        <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
      </button>

      <div className="text-center pt-2 text-xs text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};
