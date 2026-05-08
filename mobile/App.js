import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { API_URL, DEMO_CREDENTIALS } from './src/config/env';
import BottomNavigation from './src/components/BottomNavigation';
import { login } from './src/services/auth';
import {
  configureNotifications,
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  scheduleTodayOrderReminder,
} from './src/services/notifications';
import { clearCachedOrders, loadCachedOrders, saveCachedOrders } from './src/services/ordersCache';
import { captureProofPhoto, pickProofPhoto } from './src/services/proofPhoto';
import { clearSyncQueue, enqueueSyncOperation, loadSyncQueue, replaceSyncQueue } from './src/services/syncQueue';
import { fetchTasks, updateTask, updateTaskStatus } from './src/services/tasks';
import { clearSession, loadSession, saveSession } from './src/services/session';
import LoginScreen from './src/screens/LoginScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { buildTaskPayload } from './src/utils/order';
import { colors, typography } from './src/theme';

function App() {
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    lastSyncedAt: null,
    offlineMode: false,
    pendingOperations: 0,
  });
  const [notificationStatus, setNotificationStatus] = useState({
    permission: 'unknown',
    scheduledCount: 0,
    scheduledFor: null,
  });

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const metrics = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    inProgress: orders.filter((order) => order.status === 'in_progress').length,
    done: orders.filter((order) => order.status === 'done').length,
  }), [orders]);

  const updatePendingOperations = useCallback(async (currentSession) => {
    if (!currentSession) {
      return 0;
    }

    const queue = await loadSyncQueue(currentSession);
    setSyncStatus((currentStatus) => ({
      ...currentStatus,
      pendingOperations: queue.length,
    }));
    return queue.length;
  }, []);

  const syncPendingOperations = useCallback(async (currentSession) => {
    const queue = await loadSyncQueue(currentSession);
    if (queue.length === 0) {
      return 0;
    }

    const remainingOperations = [];

    for (const operation of queue) {
      try {
        if (operation.type === 'status') {
          await updateTaskStatus(currentSession.token, operation.taskId, operation.payload.status);
        }

        if (operation.type === 'task_update') {
          await updateTask(currentSession.token, operation.taskId, operation.payload);
        }
      } catch (_error) {
        remainingOperations.push(operation);
      }
    }

    await replaceSyncQueue(currentSession, remainingOperations);
    setSyncStatus((currentStatus) => ({
      ...currentStatus,
      pendingOperations: remainingOperations.length,
    }));

    if (remainingOperations.length > 0) {
      throw new Error('Ainda há alterações offline aguardando conexão.');
    }

    return queue.length;
  }, []);

  const loadOrders = useCallback(async (currentSession, { silent = false } = {}) => {
    if (!currentSession?.token) {
      return;
    }

    setLoading(true);
    try {
      const flushedOperations = await syncPendingOperations(currentSession);
      const data = await fetchTasks(currentSession.token);
      const savedAt = new Date().toISOString();
      setOrders(data);
      await saveCachedOrders(currentSession, data, savedAt);
      setSyncStatus({
        lastSyncedAt: savedAt,
        offlineMode: false,
        pendingOperations: 0,
      });
      if (!silent) {
        setMessage(flushedOperations > 0
          ? `${flushedOperations} alteração(ões) offline sincronizada(s).`
          : 'Ordens sincronizadas com o servidor.');
      }
    } catch (error) {
      const cachedOrders = await loadCachedOrders(currentSession);
      const pendingOperations = await updatePendingOperations(currentSession);

      if (cachedOrders) {
        setOrders(cachedOrders.orders);
        setSyncStatus({
          lastSyncedAt: cachedOrders.savedAt,
          offlineMode: true,
          pendingOperations,
        });
        setMessage('Sem conexão com a API. Exibindo a última sincronização salva no dispositivo.');
      } else {
        setMessage(error.message || 'Erro ao carregar ordens.');
      }
    } finally {
      setLoading(false);
    }
  }, [syncPendingOperations, updatePendingOperations]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedSession = await loadSession();
        if (savedSession?.token) {
          setSession(savedSession);
          setMessage('Sessão restaurada no dispositivo.');
        }
      } finally {
        setRestoringSession(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    async function loadNotificationStatus() {
      try {
        await configureNotifications();
        const permission = await getNotificationPermissionStatus();
        setNotificationStatus((currentStatus) => ({
          ...currentStatus,
          permission,
        }));
      } catch (_error) {
        setNotificationStatus((currentStatus) => ({
          ...currentStatus,
          permission: 'unavailable',
        }));
      }
    }

    loadNotificationStatus();
  }, []);

  useEffect(() => {
    if (session?.token) {
      async function bootstrapOrders() {
        const cachedOrders = await loadCachedOrders(session);

        if (cachedOrders) {
          setOrders(cachedOrders.orders);
          setSyncStatus({
            lastSyncedAt: cachedOrders.savedAt,
            offlineMode: false,
            pendingOperations: 0,
          });
          setMessage('Carregando a última sincronização enquanto atualizamos os dados.');
        }

        await updatePendingOperations(session);
        await loadOrders(session, { silent: Boolean(cachedOrders) });
      }

      bootstrapOrders();
    }
  }, [loadOrders, session, updatePendingOperations]);

  const handleLogin = async (credentials) => {
    try {
      setErrorMessage('');
      const response = await login(credentials);
      const nextSession = { token: response.token, user: response.user };
      await saveSession(nextSession);
      setSession(nextSession);
      setActiveTab('orders');
      setMessage('Login realizado com sucesso.');
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao entrar.');
    }
  };

  const handleDemoLogin = () => handleLogin(DEMO_CREDENTIALS);

  const persistLocalOrders = useCallback(async (nextOrders) => {
    if (!session) {
      return;
    }

    const savedAt = new Date().toISOString();
    setOrders(nextOrders);
    await saveCachedOrders(session, nextOrders, savedAt);
    setSyncStatus((currentStatus) => ({
      lastSyncedAt: savedAt,
      offlineMode: false,
      pendingOperations: currentStatus.pendingOperations,
    }));
  }, [session]);

  const handleRefresh = () => loadOrders(session);

  const handleEnableTodayReminders = useCallback(async () => {
    try {
      let permission = notificationStatus.permission;

      if (permission !== 'granted') {
        permission = await requestNotificationPermissions();
      }

      setNotificationStatus((currentStatus) => ({
        ...currentStatus,
        permission,
      }));

      if (permission === 'unavailable') {
        setMessage('Nesta prévia pelo Expo Go, notificações ficam desativadas.');
        return;
      }

      if (permission !== 'granted') {
        setMessage('Permissão de notificação não concedida neste dispositivo.');
        return;
      }

      const result = await scheduleTodayOrderReminder(orders);

      if (!result.scheduled) {
        setNotificationStatus((currentStatus) => ({
          ...currentStatus,
          scheduledCount: 0,
          scheduledFor: null,
        }));
        setMessage(result.reason === 'no_orders'
          ? 'Não há ordens pendentes para hoje.'
          : result.message || 'Não foi possível agendar lembretes agora.');
        return;
      }

      setNotificationStatus({
        permission,
        scheduledCount: result.count,
        scheduledFor: result.scheduledFor,
      });
      setMessage(`${result.count} lembrete(s) de ordem do dia agendado(s).`);
    } catch (error) {
      setMessage(error.message || 'Erro ao configurar notificações.');
    }
  }, [notificationStatus.permission, orders]);

  const handleChangeStatus = async (taskId, status) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedOrder = await updateTaskStatus(session.token, taskId, status);
      const nextOrders = orders.map((item) => (item.id === taskId ? updatedOrder : item));
      await persistLocalOrders(nextOrders);
      if (selectedOrderId === taskId) {
        setSelectedOrderId(taskId);
      }
      setMessage('Status atualizado no mobile.');
    } catch (_error) {
      const optimisticOrders = orders.map((item) => (
        item.id === taskId ? { ...item, status, pendingSync: true } : item
      ));
      setOrders(optimisticOrders);
      await saveCachedOrders(session, optimisticOrders);
      const nextQueue = await enqueueSyncOperation(session, 'status', taskId, { status });
      setSyncStatus((currentStatus) => ({
        ...currentStatus,
        offlineMode: true,
        pendingOperations: nextQueue.length,
      }));
      setMessage('Sem conexão. Status salvo no dispositivo e aguardando sincronização.');
    }
  };

  const handleToggleChecklist = useCallback(async (order, checklistItemId) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedChecklist = (order.checklistItems || []).map((item) => (
        item.id === checklistItemId ? { ...item, done: !item.done } : item
      ));
      const payload = buildTaskPayload({
        ...order,
        checklistItems: updatedChecklist,
      });

      const updatedOrder = await updateTask(session.token, order.id, payload);

      const nextOrders = orders.map((item) => (item.id === order.id ? updatedOrder : item));
      await persistLocalOrders(nextOrders);
      setMessage('Checklist atualizado no mobile.');
    } catch (_error) {
      const updatedChecklist = (order.checklistItems || []).map((item) => (
        item.id === checklistItemId ? { ...item, done: !item.done } : item
      ));
      const optimisticOrder = {
        ...order,
        checklistItems: updatedChecklist,
        pendingSync: true,
      };
      const payload = buildTaskPayload(optimisticOrder);
      const optimisticOrders = orders.map((item) => (item.id === order.id ? optimisticOrder : item));

      setOrders(optimisticOrders);
      await saveCachedOrders(session, optimisticOrders);
      const nextQueue = await enqueueSyncOperation(session, 'task_update', order.id, payload);
      setSyncStatus((currentStatus) => ({
        ...currentStatus,
        offlineMode: true,
        pendingOperations: nextQueue.length,
      }));
      setMessage('Sem conexão. Checklist salvo no dispositivo e aguardando sincronização.');
    }
  }, [orders, persistLocalOrders, session]);

  const saveOrderProofPhoto = useCallback(async (order, proofPhoto) => {
    if (!session?.token) {
      return;
    }

    const nextOrder = {
      ...order,
      proofPhoto,
      pendingSync: true,
    };
    const payload = buildTaskPayload(nextOrder);

    try {
      const updatedOrder = await updateTask(session.token, order.id, payload);
      const nextOrders = orders.map((item) => (item.id === order.id ? updatedOrder : item));
      await persistLocalOrders(nextOrders);
      setMessage(proofPhoto ? 'Comprovante anexado à ordem.' : 'Comprovante removido da ordem.');
    } catch (_error) {
      const optimisticOrders = orders.map((item) => (item.id === order.id ? nextOrder : item));
      setOrders(optimisticOrders);
      await saveCachedOrders(session, optimisticOrders);
      const nextQueue = await enqueueSyncOperation(session, 'task_update', order.id, payload);
      setSyncStatus((currentStatus) => ({
        ...currentStatus,
        offlineMode: true,
        pendingOperations: nextQueue.length,
      }));
      setMessage('Sem conexão. Comprovante salvo no dispositivo e aguardando sincronização.');
    }
  }, [orders, persistLocalOrders, session]);

  const handleCaptureProofPhoto = useCallback(async (order) => {
    try {
      const proofPhoto = await captureProofPhoto();
      if (!proofPhoto) {
        return;
      }

      await saveOrderProofPhoto(order, proofPhoto);
    } catch (error) {
      setMessage(error.message || 'Erro ao capturar comprovante.');
    }
  }, [saveOrderProofPhoto]);

  const handlePickProofPhoto = useCallback(async (order) => {
    try {
      const proofPhoto = await pickProofPhoto();
      if (!proofPhoto) {
        return;
      }

      await saveOrderProofPhoto(order, proofPhoto);
    } catch (error) {
      setMessage(error.message || 'Erro ao selecionar comprovante.');
    }
  }, [saveOrderProofPhoto]);

  const handleRemoveProofPhoto = useCallback(async (order) => {
    await saveOrderProofPhoto(order, null);
  }, [saveOrderProofPhoto]);

  const handleLogout = async () => {
    await clearCachedOrders(session);
    await clearSyncQueue(session);
    await clearSession();
    setSession(null);
    setOrders([]);
    setMessage('');
    setErrorMessage('');
    setActiveTab('orders');
    setSelectedOrderId(null);
    setSyncStatus({
      lastSyncedAt: null,
      offlineMode: false,
      pendingOperations: 0,
    });
  };

  const handleOpenOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseOrder = () => {
    setSelectedOrderId(null);
  };

  if (restoringSession) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingTitle}>TaskFlow Field</Text>
        <Text style={styles.loadingText}>Restaurando a sessão do dispositivo...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen
          onLogin={handleLogin}
          onDemoLogin={DEMO_CREDENTIALS.enabled ? handleDemoLogin : null}
          errorMessage={errorMessage}
        />
      </>
    );
  }

  const showingOrderDetails = Boolean(selectedOrder);

  return (
    <View style={styles.appShell}>
      <StatusBar style="light" />
      <View style={styles.screenContainer}>
        {showingOrderDetails ? (
          <OrderDetailsScreen
            order={selectedOrder}
            onBack={handleCloseOrder}
            onChangeStatus={handleChangeStatus}
            onToggleChecklist={handleToggleChecklist}
            onCaptureProofPhoto={handleCaptureProofPhoto}
            onPickProofPhoto={handlePickProofPhoto}
            onRemoveProofPhoto={handleRemoveProofPhoto}
          />
        ) : activeTab === 'orders' ? (
          <OrdersScreen
            session={session}
            orders={orders}
            loading={loading}
            syncStatus={syncStatus}
            notificationStatus={notificationStatus}
            onRefresh={handleRefresh}
            onEnableTodayReminders={handleEnableTodayReminders}
            onChangeStatus={handleChangeStatus}
            onOpenOrder={handleOpenOrder}
            message={message}
          />
        ) : (
          <ProfileScreen
            session={session}
            metrics={metrics}
            apiUrl={API_URL}
            syncStatus={syncStatus}
            notificationStatus={notificationStatus}
            onEnableTodayReminders={handleEnableTodayReminders}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
          />
        )}
      </View>

      {!showingOrderDetails && (
        <BottomNavigation activeTab={activeTab} onChangeTab={setActiveTab} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenContainer: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: typography.display,
  },
  loadingText: {
    color: colors.muted2,
    fontSize: 15,
    textAlign: 'center',
    fontFamily: typography.body,
  },
});

export default App;
