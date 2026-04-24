import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDate } from '../utils/order';
import { colors, priorityMeta, radius, statusMeta, typography } from '../theme';

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.pending;

  return (
    <View style={[styles.statusBadge, { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }]}>
      <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

function TechnicianAvatar({ name }) {
  const initials = String(name || 'TF')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function OrderCard({ order, onChangeStatus, onOpen }) {
  const priority = priorityMeta[order.priority] || priorityMeta.medium;

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: statusMeta[order.status]?.color || colors.warning }]} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.orderId}>OS-{String(order.id || '').slice(-5).toUpperCase()}</Text>
          <Text style={styles.title}>{order.title}</Text>
          <Text style={styles.customer}>{order.customerName || 'Cliente não informado'}</Text>
        </View>
        <TechnicianAvatar name={order.customerName || order.title} />
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>DATA</Text>
          <Text style={styles.metaValue}>{formatDate(order.serviceDate)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>PRIORIDADE</Text>
          <Text style={[styles.metaValue, { color: priority.color }]}>{priority.label}</Text>
        </View>
      </View>

      <Text style={styles.address} numberOfLines={2}>
        {order.address || 'Endereço não informado'}
      </Text>

      <View style={styles.footer}>
        <StatusBadge status={order.status} />
        <Text style={styles.checklist}>{order.checklistItems.length} item(ns)</Text>
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

      <Pressable onPress={() => onOpen(order.id)} style={styles.detailButton}>
        <Text style={styles.detailButtonText}>Abrir detalhes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 13,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  orderId: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '900',
    flexShrink: 1,
  },
  customer: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 14,
    flexShrink: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.black,
    fontFamily: typography.display,
    fontWeight: '900',
    fontSize: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bgDeep,
    padding: 10,
    gap: 5,
  },
  metaLabel: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  metaValue: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  address: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '100%',
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
    flexShrink: 1,
  },
  checklist: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 11,
    flexShrink: 1,
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
  detailButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.28)',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailButtonText: {
    color: colors.accent,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default OrderCard;
