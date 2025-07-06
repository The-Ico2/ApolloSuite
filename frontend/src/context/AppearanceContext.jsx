// src/context/AppearanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

const AppearanceContext = createContext();

export function AppearanceProvider({ children }) {
  const [dockPosition, setDockPosition] = useState('left');
  const [fontSize, setFontSize] = useState('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Fetch settings from backend on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.dockPosition) setDockPosition(data.dockPosition);
          if (data.fontSize) setFontSize(data.fontSize);
          if (typeof data.animationsEnabled === 'boolean') setAnimationsEnabled(data.animationsEnabled);
        } else {
          console.error('Failed to fetch settings', res.status);
        }
      } catch (err) {
        console.error('Error fetching settings', err);
      }
    }
    fetchSettings();
  }, []);

  // Sync settings to backend on change (debounce recommended in production)
  useEffect(() => {
    async function updateSettings() {
      try {
        await fetch(`${API_BASE}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dockPosition,
            fontSize,
            animationsEnabled,
          }),
        });
      } catch (err) {
        console.error('Error updating settings', err);
      }
    }
    updateSettings();
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