import axios from 'axios';
import { apiLatencyHistogram } from './metrics';

const api = axios.create({
  baseURL: 'https://yourdomain.com', // Your backend URL
});

api.interceptors.request.use((config) => {
  // Store the start timestamp directly in the request config
  config.metadata = { startTime: performance.now() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const endTime = performance.now();
    const durationSeconds = (endTime - response.config.metadata.startTime) / 1000;

    apiLatencyHistogram.record(durationSeconds, {
      endpoint: response.config.url,
      method: response.config.method?.toUpperCase() || 'GET',
      status: response.status.toString(),
    });

    return response;
  },
  (error) => {
    const endTime = performance.now();
    const durationSeconds = (endTime - error.config?.metadata?.startTime) / 1000;

    apiLatencyHistogram.record(durationSeconds, {
      endpoint: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      status: error.response?.status?.toString() || 'NETWORK_ERROR',
    });

    return Promise.reject(error);
  }
);

export default api;
