import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './modules/dashboard';
import Social from './modules/Social';
import Settings from './modules/Settings';
import { AppearanceProvider, useAppearance } from './context/AppearanceContext';

const queryClient = new QueryClient();

function AppContent() {
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('theme') || 'default'
  );
  const [currentVariant, setCurrentVariant] = useState(
    localStorage.getItem('variant') || 'dark'
  );

  const { dockPosition } = useAppearance();

  useEffect(() => {
    const link = document.getElementById('theme-css');
    if (link) {
      link.href = `/themes/${currentTheme}.css`;
    }
    document.documentElement.setAttribute('data-theme', currentVariant);
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('variant', currentVariant);
  }, [currentTheme, currentVariant]);

  return (
    <Router>
      <link id="theme-css" rel="stylesheet" href={`/themes/${currentTheme}.css`} />
      <div className={`app-layout sidebar-${dockPosition}-e`}>
        <Sidebar
          position={dockPosition}
          currentVariant={currentVariant}
          setVariant={setCurrentVariant}
        />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/social" element={<Social />} />
            <Route
              path="/settings"
              element={
                <Settings
                  currentTheme={currentTheme}
                  setCurrentTheme={setCurrentTheme}
                  currentVariant={currentVariant}
                  setCurrentVariant={setCurrentVariant}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AppearanceProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AppearanceProvider>
  );
}