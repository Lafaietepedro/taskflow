export const colors = {
  bg: '#0f1117',
  bgDeep: '#0b0d12',
  surface: '#171b25',
  surface2: '#1e2333',
  border: '#252b3b',
  accent: '#f5a623',
  accent2: '#ff6b35',
  text: '#e8eaf0',
  muted: '#5a6280',
  muted2: '#8a91a8',
  success: '#2ecc71',
  warning: '#f5a623',
  danger: '#e74c3c',
  blue: '#4a9eff',
  black: '#050608',
};

export const typography = {
  display: 'System',
  body: 'System',
  mono: 'monospace',
};

export const radius = {
  sm: 5,
  md: 8,
  lg: 12,
  xl: 18,
};

export const shadows = {
  panel: {
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
};

export const statusMeta = {
  pending: {
    label: 'Pendente',
    color: colors.warning,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderColor: 'rgba(245, 166, 35, 0.24)',
  },
  in_progress: {
    label: 'Em andamento',
    color: colors.accent2,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderColor: 'rgba(255, 107, 53, 0.24)',
  },
  done: {
    label: 'Concluído',
    color: colors.success,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: 'rgba(46, 204, 113, 0.22)',
  },
};

export const priorityMeta = {
  high: { label: 'Alta', color: colors.danger },
  medium: { label: 'Média', color: colors.warning },
  low: { label: 'Baixa', color: colors.blue },
};
