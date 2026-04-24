import Constants from 'expo-constants';

const extraApiUrl = Constants.expoConfig?.extra?.apiUrl;
const extraDemoAccountEnabled = Constants.expoConfig?.extra?.demoAccountEnabled;
const extraDemoUsername = Constants.expoConfig?.extra?.demoUsername;
const extraDemoPassword = Constants.expoConfig?.extra?.demoPassword;
const publicApiUrl = process.env.EXPO_PUBLIC_API_URL;
const publicDemoAccountEnabled = process.env.EXPO_PUBLIC_DEMO_ACCOUNT_ENABLED;
const publicDemoUsername = process.env.EXPO_PUBLIC_DEMO_USERNAME;
const publicDemoPassword = process.env.EXPO_PUBLIC_DEMO_PASSWORD;

function getMetroHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')?.[0];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  if (host.includes('exp.direct') || host.includes('ngrok')) {
    return null;
  }

  return host;
}

function inferApiUrlFromMetroHost() {
  const host = getMetroHost();
  return host ? `http://${host}:5001/api/v1` : null;
}

export const API_URL = (
  publicApiUrl
  || inferApiUrlFromMetroHost()
  || extraApiUrl
  || 'http://localhost:5001/api/v1'
).replace(/\/$/, '');

export const DEMO_CREDENTIALS = {
  enabled: String(publicDemoAccountEnabled ?? extraDemoAccountEnabled) === 'true',
  username: publicDemoUsername || extraDemoUsername || 'demo@taskflow.com',
  password: publicDemoPassword || extraDemoPassword || 'taskflow123',
};
