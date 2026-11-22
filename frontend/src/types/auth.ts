/**
 * Types representing SimpleJWT Authentication and User Profile models.
 */

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  preferred_sector: string | null;
  is_vulnerable?: boolean;
  vulnerability_types?: string[];
  notify_via_email?: boolean;
  notify_via_sms?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  preferred_sector?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user?: UserProfile;
  tokens?: AuthTokens;
  access?: string;
  refresh?: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}
