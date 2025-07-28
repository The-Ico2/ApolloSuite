import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppearanceProvider, useAppearance } from './context/AppearanceContext';
import { AnimatePresence, motion } from 'framer-motion';

// COMPONENTS
import Sidebar from './components/Sidebar';

// PAGES
import Dashboard from './modules/dashboard';
import Drive from './modules/Storage';
import Settings from './modules/Settings';

const queryClient = new QueryClient();

// Wrapper component to enable animated route transitions
function AnimatedRoutes({ currentTheme, setCurrentTheme, currentVariant, setCurrentVariant }) {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -20, scale: 0.95 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              style={{ height: '100%' }}
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/storage"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              style={{ height: '100%' }}
            >
              <Drive />
            </motion.div>
          }
        />
        <Route
          path="/settings"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              style={{ height: '100%' }}
            >
              <Settings
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                currentVariant={currentVariant}
                setCurrentVariant={setCurrentVariant}
              />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

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
      <div className={`app-layout sidebar-${dockPosition}-e`} style={{ height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          position={dockPosition}
          currentVariant={currentVariant}
          setVariant={setCurrentVariant}
        />
        <div className="main-content" style={{ height: '100%', overflow: 'auto' }}>
          <AnimatedRoutes
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            currentVariant={currentVariant}
            setCurrentVariant={setCurrentVariant}
          />
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