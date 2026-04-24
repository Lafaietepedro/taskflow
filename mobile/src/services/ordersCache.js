import AsyncStorage from '@react-native-async-storage/async-storage';

function getOrdersCacheKey(session) {
  const userIdentifier = session?.user?.id || session?.user?.username || 'anonymous';
  return `taskflow-field:orders:${userIdentifier}`;
}

export async function loadCachedOrders(session) {
  const key = getOrdersCacheKey(session);
  const rawValue = await AsyncStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return {
      orders: Array.isArray(parsed?.orders) ? parsed.orders : [],
      savedAt: parsed?.savedAt || null,
    };
  } catch (_error) {
    return null;
  }
}

export async function saveCachedOrders(session, orders, savedAt = new Date().toISOString()) {
  const key = getOrdersCacheKey(session);
  const payload = JSON.stringify({
    orders: Array.isArray(orders) ? orders : [],
    savedAt,
  });

  await AsyncStorage.setItem(key, payload);
}

export async function clearCachedOrders(session) {
  const key = getOrdersCacheKey(session);
  await AsyncStorage.removeItem(key);
}
