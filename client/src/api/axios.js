/**
 * Axios API Instance Configuration
 * ================================
 * Creates a configured Axios client instance to interact with the backend API.
 * Attaches request and response interceptors:
 * - Request: automatically injects JWT access tokens in the Authorization header.
 * - Response: catches 401 errors (token expired), initiates token refresh,
 *   re-injects the new token, and transparently retries the failed request.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Automated Access Token Refresh on 401 Expired
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and request has not already been retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request a new token pair using the refresh token
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update authorization header on the original request and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🚨 Token rotation failed, logging out user:', refreshError.message);
        
        // Clear local storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Use custom event or state change to trigger redirect without hard page reload if possible,
        // or fall back to window redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session_expired=true';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
