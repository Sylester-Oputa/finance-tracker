import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define our consistent color palette
export const themes = {
  light: {
    // Primary colors
    primary: '#935F4C',
    primaryHover: '#A86D59',
    primaryLight: '#C2978A',
    primaryDark: '#7A4F3E',
    
    // Background colors
    background: '#FDFBF3',
    cardBackground: '#FFFFFF',
    sidebarBackground: '#FFF6EE',
    navbarBackground: '#FFFAE5',
    modalBackground: '#FFFAE5',
    
    // Border colors
    border: '#935F4C',
    borderLight: '#AF6A58',
    borderCard: '#E5E7EB',
    
    // Text colors
    textPrimary: '#181821',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textWhite: '#FFFFFF',
    
    // State colors
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // Input colors
    inputBackground: '#F1F5F9',
    inputBorder: '#CBD5E1',
    inputFocus: '#935F4C',
    
    // Additional UI colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    accent: '#F5E6D3',
  },
  dark: {
    // Primary colors
    primary: '#C2978A',
    primaryHover: '#D4A89C',
    primaryLight: '#E6B9AE',
    primaryDark: '#935F4C',
    
    // Background colors
    background: '#0F0F0F',
    cardBackground: '#1A1A1A',
    sidebarBackground: '#161616',
    navbarBackground: '#1A1A1A',
    modalBackground: '#1A1A1A',
    
    // Border colors
    border: '#C2978A',
    borderLight: '#A86D59',
    borderCard: '#2D2D2D',
    
    // Text colors
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textWhite: '#FFFFFF',
    
    // State colors
    success: '#34D399',
    successLight: '#064E3B',
    error: '#F87171',
    errorLight: '#7F1D1D',
    warning: '#FBBF24',
    warningLight: '#78350F',
    info: '#60A5FA',
    infoLight: '#1E3A8A',
    
    // Input colors
    inputBackground: '#2D2D2D',
    inputBorder: '#404040',
    inputFocus: '#C2978A',
    
    // Additional UI colors
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    accent: '#2A2019',
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Update localStorage and apply theme when changed
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document root
    const root = document.documentElement;
    const theme = isDarkMode ? themes.dark : themes.light;
    
    // Set CSS custom properties for consistent theming
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Add/remove dark class on html element for Tailwind dark mode
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const currentTheme = isDarkMode ? themes.dark : themes.light;

  const value = {
    isDarkMode,
    toggleTheme,
    theme: currentTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
