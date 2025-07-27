// src/context/AppearanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppearanceContext = createContext();

const STORAGE_KEY = 'apollo_appearance_settings';

export function AppearanceProvider({ children }) {
  const [dockPosition, setDockPosition] = useState('left');
  const [fontSize, setFontSize] = useState('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.dockPosition) setDockPosition(data.dockPosition);
        if (data.fontSize) setFontSize(data.fontSize);
        if (typeof data.animationsEnabled === 'boolean') setAnimationsEnabled(data.animationsEnabled);
      }
    } catch (err) {
      console.error('Error loading appearance settings from localStorage', err);
    }
  }, []);

  // Save settings to localStorage on change
  useEffect(() => {
    try {
      const data = {
        dockPosition,
        fontSize,
        animationsEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Error saving appearance settings to localStorage', err);
    }
  }, [dockPosition, fontSize, animationsEnabled]);

  return (
    <AppearanceContext.Provider
      value={{
        dockPosition,
        setDockPosition,
        fontSize,
        setFontSize,
        animationsEnabled,
        setAnimationsEnabled,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}