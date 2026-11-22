import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, API_BASE_URL } from '../../api/client';

describe('API Client Configuration and Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('has base URL configured targeting /api/v1', () => {
    expect(API_BASE_URL).toContain('/api/v1');
    expect(apiClient.defaults.baseURL).toContain('/api/v1');
  });

  it('sets application/json content type by default', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('attaches Bearer token from localStorage to request headers', async () => {
    localStorage.setItem('access_token', 'mock_access_jwt_xyz');

    // Test the request interceptor directly
    // @ts-expect-error accessing internal interceptor handlers for test
    const requestHandler = apiClient.interceptors.request.handlers[0].fulfilled;
    const config = await requestHandler({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer mock_access_jwt_xyz');
  });

  it('handles response without 401 smoothly', async () => {
    // @ts-expect-error accessing internal interceptor handlers for test
    const responseHandler = apiClient.interceptors.response.handlers[0].fulfilled;
    const mockResponse = { data: { success: true }, status: 200 };
    const result = responseHandler(mockResponse);
    expect(result).toEqual(mockResponse);
  });
});
