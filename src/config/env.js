const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const API_URL = rawApiUrl.replace(/\/$/, '');
export const DEMO_CREDENTIALS = {
  enabled: import.meta.env.VITE_DEMO_ACCOUNT_ENABLED === 'true',
  username: import.meta.env.VITE_DEMO_USERNAME || 'demo@taskflow.com',
  password: import.meta.env.VITE_DEMO_PASSWORD || 'taskflow123',
};
