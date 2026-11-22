export * from '../types/aqi';
export * from '../types/auth';
export * from '../types/health';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}
