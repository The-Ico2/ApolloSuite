import React, { useState } from 'react';
import TabNavigation from './settings/TabNavigation';
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


export default function Settings({ currentTheme, setCurrentTheme, currentVariant, setCurrentVariant }) {
  const [activeTab, setActiveTab] = useState('themes');

  return (
    <div style={{ margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Settings</h1>

      <TabNavigation tabs={SETTINGS_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'themes' && (
        <ThemeSettings
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          currentVariant={currentVariant}
          setCurrentVariant={setCurrentVariant}
        />
      )}
      {activeTab === 'appearance' && <AppearanceSettings />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'advanced' && <AdvancedSettings />}
      {activeTab === 'other' && <OtherSettings />}
    </div>
  );
}
