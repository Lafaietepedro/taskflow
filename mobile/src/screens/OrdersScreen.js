import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import OrderCard from '../components/OrderCard';
import { buildSearchText, formatDateTime } from '../utils/order';
import { colors, radius, typography } from '../theme';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'done', label: 'Concluídas' },
];

const STAT_CARDS = [
  { key: 'total', label: 'Total', tone: colors.blue },
  { key: 'pending', label: 'Pendentes', tone: colors.warning },
  { key: 'inProgress', label: 'Em campo', tone: colors.accent2 },
  { key: 'done', label: 'Feitas', tone: colors.success },
];

function OrdersScreen({
  session,
  orders,
  loading,
  syncStatus,
  notificationStatus,
  onRefresh,
  onEnableTodayReminders,
  onChangeStatus,
  onOpenOrder,
  message,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => (filter === 'all' ? true : order.status === filter))
      .filter((order) => buildSearchText(order).includes(search.toLowerCase()));
  }, [filter, orders, search]);

  const metrics = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    inProgress: orders.filter((order) => order.status === 'in_progress').length,
    done: orders.filter((order) => order.status === 'done').length,
  }), [orders]);

  const reminderText = notificationStatus?.permission === 'unavailable'
    ? 'Dev build necessário'
    : notificationStatus?.scheduledCount > 0
    ? `${notificationStatus.scheduledCount} OS agendada(s)`
    : notificationStatus?.permission === 'granted'
    ? 'Permissão ativa'
    : 'Permissão pendente';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <View style={styles.logoStack}>
            <Text style={styles.logo}>
              <Text style={styles.logoTask}>Task</Text>
              <Text style={styles.logoFlow}>Flow</Text>
            </Text>
            <Text style={styles.logoSubtitle}>FIELD OPS</Text>
          </View>
          <Pressable onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Atualizar</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>Painel do técnico</Text>
          <Text style={styles.title}>Ordens do dia</Text>
          <Text style={styles.subtitle}>{session.user?.username || 'Técnico conectado'}</Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={onEnableTodayReminders}
            style={[styles.reminderButton, notificationStatus?.permission === 'unavailable' && styles.reminderButtonDisabled]}
          >
            <Text style={styles.reminderButtonText}>Lembretes</Text>
          </Pressable>
          <Text style={styles.reminderMeta}>{reminderText}</Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={[styles.syncCard, syncStatus?.offlineMode && styles.syncCardOffline]}>
          <Text style={[styles.syncLabel, syncStatus?.offlineMode && styles.syncLabelOffline]}>
            {syncStatus?.pendingOperations > 0
              ? `${syncStatus.pendingOperations} pendência(s) offline`
              : syncStatus?.offlineMode ? 'Modo offline ativo' : 'Sincronização do dispositivo'}
          </Text>
          <Text style={styles.syncValue}>
            {syncStatus?.pendingOperations > 0
              ? `Toque em Atualizar quando a conexão voltar. Última carga: ${formatDateTime(syncStatus?.lastSyncedAt)}`
              : syncStatus?.offlineMode
              ? `Última carga salva em ${formatDateTime(syncStatus?.lastSyncedAt)}`
              : `Última sincronização em ${formatDateTime(syncStatus?.lastSyncedAt)}`}
          </Text>
        </View>

        <View style={styles.searchWrapper}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por cliente, endereço ou checklist..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.metricsRow}>
          {STAT_CARDS.map((card) => (
            <View key={card.key} style={styles.metricCard}>
              <View style={[styles.metricAccent, { backgroundColor: card.tone }]} />
              <Text style={styles.metricLabel}>{card.label}</Text>
              <Text style={styles.metricValue}>{metrics[card.key]}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filterOption) => (
            <Pressable
              key={filterOption.key}
              onPress={() => setFilter(filterOption.key)}
              style={[styles.filterChip, filter === filterOption.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filter === filterOption.key && styles.filterChipTextActive]}>
                {filterOption.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredOrders.length > 0 ? (
          <View style={styles.listContent}>
            {filteredOrders.map((item) => (
              <OrderCard key={item.id} order={item} onChangeStatus={onChangeStatus} onOpen={onOpenOrder} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{orders.length === 0 ? 'Nenhuma ordem carregada' : 'Nenhum resultado encontrado'}</Text>
              <Text style={styles.emptyText}>
                {orders.length === 0
                  ? 'Quando a equipe web cadastrar serviços, eles vão aparecer aqui usando a mesma API.'
                  : 'Tente ajustar a busca ou trocar o filtro para localizar a ordem desejada.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pageContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  logoStack: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  logo: {
    fontFamily: typography.display,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  logoTask: {
    color: colors.text,
  },
  logoFlow: {
    color: colors.accent,
  },
  logoSubtitle: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  refreshButton: {
    flexShrink: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  refreshButtonText: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 5,
  },
  kicker: {
    color: colors.accent,
    fontFamily: typography.mono,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 10,
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 30,
    fontWeight: '900',
    flexShrink: 1,
  },
  subtitle: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 14,
    flexShrink: 1,
  },
  quickActions: {
    paddingHorizontal: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  reminderButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  reminderButtonDisabled: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderButtonText: {
    color: colors.black,
    fontFamily: typography.body,
    fontWeight: '900',
  },
  reminderMeta: {
    color: colors.muted2,
    fontFamily: typography.mono,
    fontSize: 11,
    flexShrink: 1,
    minWidth: 0,
  },
  message: {
    marginHorizontal: 18,
    marginBottom: 10,
    color: colors.text,
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.22)',
    borderRadius: radius.lg,
    paddingHorizontal: 13,
    paddingVertical: 11,
    overflow: 'hidden',
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
  },
  syncCard: {
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.22)',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    paddingHorizontal: 13,
    paddingVertical: 11,
    gap: 4,
  },
  syncCardOffline: {
    borderColor: 'rgba(245, 166, 35, 0.26)',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  syncLabel: {
    color: colors.success,
    fontFamily: typography.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    flexShrink: 1,
  },
  syncLabelOffline: {
    color: colors.warning,
  },
  syncValue: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
  },
  searchWrapper: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  metricCard: {
    width: '47.5%',
    position: 'relative',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  metricAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flexShrink: 1,
  },
  metricValue: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 5,
  },
  filterRow: {
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderColor: 'rgba(245, 166, 35, 0.28)',
  },
  filterChipText: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: colors.accent,
  },
  listContent: {
    paddingHorizontal: 18,
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    padding: 18,
    justifyContent: 'center',
  },
  emptyState: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 22,
    gap: 10,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted2,
    fontFamily: typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OrdersScreen;
