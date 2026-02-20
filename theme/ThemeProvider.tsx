import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { ColorTokens, darkTheme, lightTheme, ThemeMode } from './theme';

const THEME_STORAGE_KEY = '@theme_preference';

export interface ThemeContextValue {
  colors: ColorTokens;
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
      // Invalid values fall back to default: light
    };
    loadTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const mode: ThemeMode = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error) => {
        console.error('Failed to save theme preference:', error);
      });
      return mode;
    });
  }, []);

  const colors = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ colors, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
