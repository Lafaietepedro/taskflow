import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, shadows, typography } from '../theme';

function LoginScreen({ onLogin, onDemoLogin, errorMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      return;
    }

    setLoading(true);
    try {
      await onLogin({ username, password });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSubmit = async () => {
    if (!onDemoLogin) {
      return;
    }

    setDemoLoading(true);
    try {
      await onDemoLogin();
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.glowAmber} />
      <View style={styles.glowBlue} />

      <View style={styles.card}>
        <View style={styles.logoStack}>
          <Text style={styles.logo}>
            <Text style={styles.logoTask}>Task</Text>
            <Text style={styles.logoFlow}>Flow</Text>
          </Text>
          <Text style={styles.logoSubtitle}>FIELD OPS SYSTEM</Text>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.kicker}>Mobile Command</Text>
          <Text style={styles.title}>Operação de campo sem planilha solta.</Text>
          <Text style={styles.subtitle}>
            Entre para visualizar ordens, atualizar status e registrar comprovantes direto do celular.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>USUARIO</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="dev"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="dev123456"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable onPress={handleSubmit} disabled={loading || demoLoading} style={styles.button}>
          {loading ? <ActivityIndicator color={colors.black} /> : <Text style={styles.buttonText}>Entrar no painel</Text>}
        </Pressable>

        {onDemoLogin ? (
          <Pressable onPress={handleDemoSubmit} disabled={loading || demoLoading} style={styles.demoButton}>
            {demoLoading ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.demoButtonText}>Entrar com conta demo</Text>}
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  glowAmber: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    top: -80,
    right: -110,
  },
  glowBlue: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(74, 158, 255, 0.12)',
    bottom: -80,
    left: -90,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 18,
    ...shadows.panel,
  },
  logoStack: {
    gap: 4,
  },
  logo: {
    fontFamily: typography.display,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
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
  copyBlock: {
    gap: 8,
  },
  kicker: {
    color: colors.accent,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 32,
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
  form: {
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  input: {
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 16,
    marginBottom: 6,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.28)',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: radius.md,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.black,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: '800',
  },
  demoButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: colors.bgDeep,
  },
  demoButtonText: {
    color: colors.muted2,
    fontFamily: typography.body,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default LoginScreen;
