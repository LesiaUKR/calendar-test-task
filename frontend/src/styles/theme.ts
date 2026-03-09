const shared = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: {
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '20px',
    },
  },
  borderRadius: '6px',
  priority: {
    LOW: '#22c55e',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    URGENT: '#ef4444',
  },
};

export const lightTheme = {
  ...shared,
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    today: '#eff6ff',
    boundary: '#9ca3af',
    error: '#ef4444',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    cardBg: '#ffffff',
    cardShadow: '0 1px 3px rgba(0,0,0,0.08)',
    holidayBg: '#fef2f2',
    holidayText: '#dc2626',
    deleteHover: '#ef4444',
    surfaceHover: '#e8eaed',
    headerBg: '#fafbfc',
    borderLight: '#dde1e6',
  },
};

export const darkTheme = {
  ...shared,
  colors: {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#e4e4e7',
    textSecondary: '#a1a1aa',
    border: '#2e2e2e',
    accent: '#60a5fa',
    accentHover: '#3b82f6',
    today: '#1e2a3a',
    boundary: '#52525b',
    error: '#f87171',
    inputBg: '#2a2a2a',
    inputBorder: '#3a3a3a',
    cardBg: '#2a2a2a',
    cardShadow: '0 1px 3px rgba(0,0,0,0.3)',
    holidayBg: '#3a2020',
    holidayText: '#fca5a5',
    deleteHover: '#dc2626',
    surfaceHover: '#2a2a2a',
    headerBg: '#181818',
    borderLight: '#3a3a3a',
  },
};

export type Theme = typeof lightTheme;
