import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme';

const TABS = [
  { key: 'orders', label: 'Ordens', code: 'OS' },
  { key: 'profile', label: 'Perfil', code: 'PF' },
];

function BottomNavigation({ activeTab, onChangeTab }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChangeTab(tab.key)}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
        >
          <Text style={[styles.tabCode, activeTab === tab.key && styles.tabCodeActive]}>{tab.code}</Text>
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  tabActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderColor: 'rgba(245, 166, 35, 0.28)',
  },
  tabCode: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  tabCodeActive: {
    color: colors.accent,
  },
  tabText: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.text,
  },
});

export default BottomNavigation;
