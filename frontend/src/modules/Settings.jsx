import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabNavigation from './settings/TabNavigationSettings';
import ThemeSettings from './settings/ThemeSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import NotificationSettings from './settings/NotificationSettings';
import AdvancedSettings from './settings/AdvancedSettings';
import OtherSettings from './settings/OtherSettings';

const SETTINGS_TABS = [
  { key: 'themes', label: 'Themes' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'other', label: 'Other' },
];

// Smooth spring animation variants with scale, opacity, and x-axis slide
const tabContentVariants = {
  initial: { opacity: 0, x: 30, scale: 0.98 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
      opacity: { duration: 0.4, ease: "easeInOut" },
      x: { duration: 0.5, ease: "easeInOut" },
      scale: { duration: 0.5, ease: "easeOut" }
    }
  },
  exit: { 
    opacity: 0, 
    x: -30, 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
      opacity: { duration: 0.4, ease: "easeInOut" },
      x: { duration: 0.5, ease: "easeInOut" },
      scale: { duration: 0.5, ease: "easeIn" }
    }
  },
};

export default function Settings({ currentTheme, setCurrentTheme, currentVariant, setCurrentVariant }) {
  const [activeTab, setActiveTab] = useState('themes');

  return (
    <div style={{ margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Settings</h1>

      <TabNavigation tabs={SETTINGS_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'themes' && (
          <motion.div
            key="themes"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity" }}
          >
            <ThemeSettings
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              currentVariant={currentVariant}
              setCurrentVariant={setCurrentVariant}
            />
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            key="appearance"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity" }}
          >
            <AppearanceSettings />
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity" }}
          >
            <NotificationSettings />
          </motion.div>
        )}

        {activeTab === 'advanced' && (
          <motion.div
            key="advanced"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity" }}
          >
            <AdvancedSettings />
          </motion.div>
        )}

        {activeTab === 'other' && (
          <motion.div
            key="other"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity" }}
          >
            <OtherSettings />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
