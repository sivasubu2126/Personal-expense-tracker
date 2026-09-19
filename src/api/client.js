import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const requestRefreshToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(res => {
        const { access_token } = res.data;
        setAccessToken(access_token);
        return access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Add access token to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const token = await requestRefreshToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
