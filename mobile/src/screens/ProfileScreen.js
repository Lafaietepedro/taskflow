import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDateTime } from '../utils/order';
import { colors, radius, typography } from '../theme';

const STAT_CARDS = [
  { key: 'total', label: 'Total', tone: colors.blue },
  { key: 'pending', label: 'Pendentes', tone: colors.warning },
  { key: 'inProgress', label: 'Em campo', tone: colors.accent2 },
  { key: 'done', label: 'Feitas', tone: colors.success },
];

function ProfileScreen({
  session,
  metrics,
  apiUrl,
  syncStatus,
  notificationStatus,
  onEnableTodayReminders,
  onRefresh,
  onLogout,
}) {
  const notificationsUnavailable = notificationStatus?.permission === 'unavailable';
  const currentUser = session.user || {};
  const trialDaysRemaining = currentUser.trialDaysRemaining ?? 0;
  const commercialStageLabel = currentUser.commercialStageLabel || (
    currentUser.subscriptionStatus === 'checkout_requested'
      ? 'Assinatura solicitada'
      : currentUser.subscriptionStatus === 'active'
      ? 'Assinatura ativa'
      : currentUser.trialExpired ? 'Trial expirado' : 'Trial ativo'
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoStack}>
          <Text style={styles.logo}>
            <Text style={styles.logoTask}>Task</Text>
            <Text style={styles.logoFlow}>Flow</Text>
          </Text>
          <Text style={styles.logoSubtitle}>FIELD PROFILE</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>Conta e operação</Text>
          <Text style={styles.title}>Perfil da equipe</Text>
          <Text style={styles.subtitle}>Resumo do técnico conectado, API ativa e estado de sincronização do dispositivo.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>USUÁRIO</Text>
          <Text style={styles.cardValue}>{currentUser.username || 'Não informado'}</Text>
          <Text style={styles.cardHint}>Este perfil representa a sessão ativa no dispositivo de campo.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PLANO E TRIAL</Text>
          <Text style={styles.cardValue}>{currentUser.planLabel || 'Equipe'}</Text>
          <Text style={styles.cardHint}>
            {commercialStageLabel}
            {currentUser.subscriptionStatus === 'checkout_requested'
              ? currentUser.checkoutIntent?.contactValue ? ` | contato: ${currentUser.checkoutIntent.contactValue}` : ''
              : ` | ${trialDaysRemaining} dia(s) restantes`}
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          {STAT_CARDS.map((card) => (
            <View key={card.key} style={styles.metricCard}>
              <View style={[styles.metricAccent, { backgroundColor: card.tone }]} />
              <Text style={styles.metricLabel}>{card.label}</Text>
              <Text style={styles.metricValue}>{metrics[card.key]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>API CONECTADA</Text>
          <Text style={styles.apiValue}>{apiUrl}</Text>
          <Text style={styles.cardHint}>
            No celular físico, evite localhost. Use o IP da máquina ou um tunnel também para o backend.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SINCRONIZAÇÃO</Text>
          <Text style={styles.cardValue}>{syncStatus?.offlineMode ? 'Modo offline' : 'Online'}</Text>
          <Text style={styles.cardHint}>Última atualização salva: {formatDateTime(syncStatus?.lastSyncedAt)}</Text>
          <Text style={styles.cardHint}>Pendências aguardando envio: {syncStatus?.pendingOperations || 0}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>NOTIFICAÇÕES</Text>
          <Text style={styles.cardValue}>
            {notificationsUnavailable ? 'Indisponíveis na prévia' : notificationStatus?.permission === 'granted' ? 'Ativas' : 'Pendentes'}
          </Text>
          <Text style={styles.cardHint}>
            {notificationsUnavailable
              ? 'Nesta prévia pelo Expo Go, os lembretes ficam desativados para evitar alertas incorretos.'
              : `Lembretes agendados para hoje: ${notificationStatus?.scheduledCount || 0}`}
          </Text>
          <Pressable onPress={onEnableTodayReminders} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Ativar lembretes de hoje</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onRefresh} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Atualizar ordens</Text>
          </Pressable>
          <Pressable onPress={onLogout} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Encerrar sessão</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 34,
  },
  logoStack: {
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
  hero: {
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
    lineHeight: 21,
    flexShrink: 1,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '900',
    flexShrink: 1,
  },
  cardHint: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    flexShrink: 1,
  },
  apiValue: {
    color: colors.accent,
    fontFamily: typography.mono,
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  actions: {
    gap: 10,
  },
  secondaryButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    paddingVertical: 13,
  },
  secondaryButtonText: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: colors.black,
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ProfileScreen;
