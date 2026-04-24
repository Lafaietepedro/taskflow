import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const ORDER_REMINDERS_CHANNEL_ID = 'order-reminders';
const EXPO_GO_NOTIFICATION_MESSAGE = 'Notificações locais devem ser testadas em development build. No Expo Go, este recurso fica desativado.';

export function areNotificationsAvailable() {
  return Constants.appOwnership !== 'expo';
}

function isToday(dateValue) {
  if (!dateValue) {
    return false;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const now = new Date();
  return parsedDate.getFullYear() === now.getFullYear()
    && parsedDate.getMonth() === now.getMonth()
    && parsedDate.getDate() === now.getDate();
}

function getReminderDate() {
  const now = new Date();
  const reminderDate = new Date();
  reminderDate.setHours(8, 0, 0, 0);

  if (reminderDate <= now) {
    reminderDate.setTime(now.getTime() + 60 * 1000);
  }

  return reminderDate;
}

function buildNotificationBody(todayOrders) {
  const firstOrders = todayOrders
    .slice(0, 3)
    .map((order) => order.customerName || order.title)
    .filter(Boolean);

  if (firstOrders.length === 0) {
    return 'Revise a fila do dia antes de sair para campo.';
  }

  const remainingCount = todayOrders.length - firstOrders.length;
  const suffix = remainingCount > 0 ? ` e mais ${remainingCount}` : '';
  return `${firstOrders.join(', ')}${suffix}`;
}

export function getTodayOrders(orders) {
  return orders.filter((order) => isToday(order.serviceDate) && order.status !== 'done');
}

export async function configureNotifications() {
  if (!areNotificationsAvailable()) {
    return 'unavailable';
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ORDER_REMINDERS_CHANNEL_ID, {
      name: 'Lembretes de ordens',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f5a623',
    });
  }
}

export async function getNotificationPermissionStatus() {
  if (!areNotificationsAvailable()) {
    return 'unavailable';
  }

  const permissions = await Notifications.getPermissionsAsync();
  return permissions.granted ? 'granted' : permissions.canAskAgain ? 'undetermined' : 'denied';
}

export async function requestNotificationPermissions() {
  if (!areNotificationsAvailable()) {
    return 'unavailable';
  }

  const permissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: false,
    },
  });

  return permissions.granted ? 'granted' : permissions.canAskAgain ? 'undetermined' : 'denied';
}

export async function scheduleTodayOrderReminder(orders) {
  if (!areNotificationsAvailable()) {
    return {
      scheduled: false,
      count: 0,
      reason: 'unavailable',
      message: EXPO_GO_NOTIFICATION_MESSAGE,
    };
  }

  await configureNotifications();

  const todayOrders = getTodayOrders(orders);
  if (todayOrders.length === 0) {
    return {
      scheduled: false,
      count: 0,
      reason: 'no_orders',
    };
  }

  const permissionStatus = await getNotificationPermissionStatus();
  if (permissionStatus !== 'granted') {
    return {
      scheduled: false,
      count: todayOrders.length,
      reason: 'permission_required',
    };
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  const triggerDate = getReminderDate();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${todayOrders.length} ordem(ns) para hoje`,
      body: buildNotificationBody(todayOrders),
      data: {
        screen: 'orders',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: ORDER_REMINDERS_CHANNEL_ID,
    },
  });

  return {
    scheduled: true,
    count: todayOrders.length,
    scheduledFor: triggerDate.toISOString(),
  };
}
