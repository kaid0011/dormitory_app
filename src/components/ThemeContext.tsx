import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
          console.log('Loaded theme from AsyncStorage:', savedTheme);
        } else {
          const systemTheme = Appearance.getColorScheme();
          setIsDarkMode(systemTheme === 'dark');
          console.log('Loaded system theme:', systemTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from AsyncStorage:', error);
      }
    };

    loadTheme();
  }, []); // Run only once on component mount

  const toggleTheme = async () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    try {
      await AsyncStorage.setItem('theme', newTheme);
      console.log('Saved theme to AsyncStorage:', newTheme);
    } catch (error) {
      console.error('Failed to save theme to AsyncStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
