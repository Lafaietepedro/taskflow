import React from 'react';
import { Alert, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDate, formatDateTime } from '../utils/order';
import { colors, radius, statusMeta, typography } from '../theme';

function getPhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function buildWhatsAppPhone(phoneDigits) {
  if (!phoneDigits) {
    return '';
  }

  return phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
}

async function openExternalUrl(url, fallbackMessage) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error('URL indisponível');
    }

    await Linking.openURL(url);
  } catch (_error) {
    Alert.alert('Ação indisponível', fallbackMessage);
  }
}

function OrderDetailsScreen({
  order,
  onBack,
  onChangeStatus,
  onToggleChecklist,
  onCaptureProofPhoto,
  onPickProofPhoto,
  onRemoveProofPhoto,
}) {
  if (!order) {
    return null;
  }

  const currentStatus = statusMeta[order.status] || statusMeta.pending;
  const phoneDigits = getPhoneDigits(order.customerPhone);
  const hasPhone = Boolean(phoneDigits);
  const hasAddress = Boolean(String(order.address || '').trim());
  const routeUrl = hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`
    : '';
  const whatsAppUrl = hasPhone
    ? `https://wa.me/${buildWhatsAppPhone(phoneDigits)}?text=${encodeURIComponent(`Olá, ${order.customerName || 'tudo bem'}! Estou acompanhando a ordem: ${order.title}.`)}`
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.kicker}>Detalhe da ordem</Text>
          <Text style={styles.title}>{order.title}</Text>
          <Text style={styles.subtitle}>{order.customerName || 'Cliente não informado'}</Text>
        </View>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={[styles.cardAccent, { backgroundColor: currentStatus.color }]} />
          <Text style={styles.cardLabel}>STATUS OPERACIONAL</Text>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.backgroundColor, borderColor: currentStatus.borderColor }]}>
            <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
            <Text style={[styles.statusBadgeText, { color: currentStatus.color }]}>{currentStatus.label}</Text>
          </View>
          <View style={styles.statusRow}>
            {Object.entries(statusMeta).map(([statusKey, meta]) => (
              <Pressable
                key={statusKey}
                onPress={() => onChangeStatus(order.id, statusKey)}
                style={[styles.statusButton, order.status === statusKey && styles.statusButtonActive]}
              >
                <Text style={[styles.statusText, order.status === statusKey && styles.statusTextActive]}>{meta.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>DATA</Text>
            <Text style={styles.cardValue}>{formatDate(order.serviceDate)}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>TELEFONE</Text>
            <Text style={styles.cardValue}>{order.customerPhone || 'Não informado'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>TÉCNICO</Text>
            <Text style={styles.cardValue}>{order.assignedTechnician || 'Não definido'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>ENDEREÇO</Text>
          <Text style={styles.cardText}>{order.address || 'Não informado'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>AÇÕES DE CAMPO</Text>
          <View style={styles.quickActionGrid}>
            <Pressable
              disabled={!hasPhone}
              onPress={() => openExternalUrl(`tel:${phoneDigits}`, 'Não foi possível iniciar uma ligação para este cliente.')}
              style={[styles.quickActionButton, !hasPhone && styles.quickActionButtonDisabled]}
            >
              <Text style={[styles.quickActionText, !hasPhone && styles.quickActionTextDisabled]}>Ligar</Text>
            </Pressable>

            <Pressable
              disabled={!hasAddress}
              onPress={() => openExternalUrl(routeUrl, 'Não foi possível abrir o endereço no mapa.')}
              style={[styles.quickActionButton, !hasAddress && styles.quickActionButtonDisabled]}
            >
              <Text style={[styles.quickActionText, !hasAddress && styles.quickActionTextDisabled]}>Abrir rota</Text>
            </Pressable>

            <Pressable
              disabled={!hasPhone}
              onPress={() => openExternalUrl(whatsAppUrl, 'Não foi possível abrir o WhatsApp para este cliente.')}
              style={[styles.quickActionButton, !hasPhone && styles.quickActionButtonDisabled]}
            >
              <Text style={[styles.quickActionText, !hasPhone && styles.quickActionTextDisabled]}>WhatsApp</Text>
            </Pressable>
          </View>
        </View>

        {order.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>OBSERVAÇÕES</Text>
            <Text style={styles.cardText}>{order.notes}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>CHECKLIST DA VISITA</Text>
          {order.checklistItems.length > 0 ? (
            order.checklistItems.map((item) => (
              <Pressable
                key={item.id || item.label}
                onPress={() => onToggleChecklist(order, item.id)}
                style={styles.checklistRow}
              >
                <View style={[styles.checkbox, item.done && styles.checkboxActive]}>
                  <Text style={[styles.checkboxText, item.done && styles.checkboxTextActive]}>✓</Text>
                </View>
                <Text style={[styles.checklistLabel, item.done && styles.checklistLabelDone]}>{item.label}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhum item cadastrado para esta visita.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>COMPROVANTE DE EXECUÇÃO</Text>
          {order.proofPhoto?.uri ? (
            <View style={styles.proofWrapper}>
              <Image source={{ uri: order.proofPhoto.uri }} style={styles.proofImage} />
              <Text style={styles.proofMeta}>
                {order.proofPhoto.source === 'library' ? 'Galeria' : 'Câmera'} | {formatDateTime(order.proofPhoto.capturedAt)}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Nenhuma foto anexada a esta ordem.</Text>
          )}

          <View style={styles.proofActions}>
            <Pressable onPress={() => onCaptureProofPhoto(order)} style={styles.primaryProofButton}>
              <Text style={styles.primaryProofButtonText}>Tirar foto</Text>
            </Pressable>
            <Pressable onPress={() => onPickProofPhoto(order)} style={styles.secondaryProofButton}>
              <Text style={styles.secondaryProofButtonText}>Galeria</Text>
            </Pressable>
            {order.proofPhoto?.uri ? (
              <Pressable onPress={() => onRemoveProofPhoto(order)} style={styles.secondaryProofButton}>
                <Text style={styles.secondaryProofButtonText}>Remover</Text>
              </Pressable>
            ) : null}
          </View>
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
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
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
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
    flexShrink: 1,
  },
  subtitle: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 14,
    flexShrink: 1,
  },
  backButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 2,
  },
  backButtonText: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontWeight: '800',
  },
  content: {
    padding: 18,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    position: 'relative',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 15,
    gap: 10,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 15,
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
    fontSize: 17,
    fontWeight: '900',
    flexShrink: 1,
  },
  cardText: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.28)',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  quickActionButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    opacity: 0.58,
  },
  quickActionText: {
    color: colors.accent,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  quickActionTextDisabled: {
    color: colors.muted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    borderRadius: 999,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusButtonActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderColor: 'rgba(245, 166, 35, 0.28)',
  },
  statusText: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextActive: {
    color: colors.accent,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeep,
  },
  checkboxActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxText: {
    color: 'transparent',
    fontWeight: '900',
  },
  checkboxTextActive: {
    color: colors.black,
  },
  checklistLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  checklistLabelDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  emptyText: {
    color: colors.muted2,
    fontFamily: typography.body,
    lineHeight: 22,
  },
  proofWrapper: {
    gap: 8,
  },
  proofImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.bgDeep,
  },
  proofMeta: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 11,
    flexShrink: 1,
  },
  proofActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryProofButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryProofButtonText: {
    color: colors.black,
    fontFamily: typography.body,
    fontWeight: '900',
  },
  secondaryProofButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryProofButtonText: {
    color: colors.text,
    fontFamily: typography.body,
    fontWeight: '800',
  },
});

export default OrderDetailsScreen;
