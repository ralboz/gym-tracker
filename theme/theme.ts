export type ThemeMode = 'light' | 'dark';

export interface ColorTokens {
  background: string;
  surface: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primaryAction: string;
  destructiveAction: string;
  iconDefault: string;
  iconActive: string;
  overlay: string;
  inputBackground: string;
}

export const lightTheme: ColorTokens = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#495057',
  textMuted: '#6C757D',
  border: '#E5E7EB',
  primaryAction: '#007AFF',
  destructiveAction: '#FF3B30',
  iconDefault: '#8E8E93',
  iconActive: '#007AFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  inputBackground: '#F9FAFB',
};

export const darkTheme: ColorTokens = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#1E1E1E',
  textPrimary: '#F1F1F1',
  textSecondary: '#B0B0B0',
  textMuted: '#808080',
  border: '#2C2C2C',
  primaryAction: '#0A84FF',
  destructiveAction: '#FF453A',
  iconDefault: '#8E8E93',
  iconActive: '#0A84FF',
  overlay: 'rgba(0, 0, 0, 0.7)',
  inputBackground: '#2C2C2C',
};
