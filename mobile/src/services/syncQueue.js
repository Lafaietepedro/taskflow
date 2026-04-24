import AsyncStorage from '@react-native-async-storage/async-storage';

function getSyncQueueKey(session) {
  const userIdentifier = session?.user?.id || session?.user?.username || 'anonymous';
  return `taskflow-field:sync-queue:${userIdentifier}`;
}

function createOperation(type, taskId, payload) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    taskId,
    payload,
    createdAt: new Date().toISOString(),
  };
}

async function writeQueue(session, operations) {
  const key = getSyncQueueKey(session);
  await AsyncStorage.setItem(key, JSON.stringify(Array.isArray(operations) ? operations : []));
}

export async function loadSyncQueue(session) {
  const key = getSyncQueueKey(session);
  const rawValue = await AsyncStorage.getItem(key);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export async function enqueueSyncOperation(session, type, taskId, payload) {
  const currentQueue = await loadSyncQueue(session);
  const nextOperation = createOperation(type, taskId, payload);
  const nextQueue = [...currentQueue, nextOperation];
  await writeQueue(session, nextQueue);
  return nextQueue;
}

export async function clearSyncQueue(session) {
  const key = getSyncQueueKey(session);
  await AsyncStorage.removeItem(key);
}

export async function replaceSyncQueue(session, operations) {
  await writeQueue(session, operations);
  return Array.isArray(operations) ? operations : [];
}
