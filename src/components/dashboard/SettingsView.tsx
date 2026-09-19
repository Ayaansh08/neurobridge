import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userProgressService } from '../../services/userProgressService';
import { settingsService, type UserSettings, DEFAULT_SETTINGS } from '../../services/settingsService';
import { CheckCircleIcon, RefreshIcon } from './Icons';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(() => userProgressService.getDisplayName(user?.email));

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.substring(0, 30);
    setDisplayName(val);
    userProgressService.saveDisplayName(val, user?.email);
    window.dispatchEvent(new Event('nb_displayname_changed'));
  };
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getSettings());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    // Sync if settings change externally
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };
    window.addEventListener('neurobridge_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('neurobridge_settings_changed', handleSettingsChange);
  }, []);

  const handleUpdate = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    settingsService.saveSettings({ [key]: value });
    setSaveStatus('Preferences saved');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    settingsService.saveSettings(DEFAULT_SETTINGS);
    setSaveStatus('Reset to defaults');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="settings-view-container">
      <div className="dashboard-section-header">
        <span className="dashboard-section-eyebrow">PREFERENCES</span>
        <h2 className="dashboard-section-title">Sensory & Coaching Settings</h2>
        <p className="dashboard-section-subtitle">
          Customize coach communication rhythm, low-stimulation parameters, and sensory comfort.
        </p>
      </div>

      <div className="settings-grid">
        {/* Account Details Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Account & Profile</h3>
            <p className="settings-card-desc">Your rehearsal identity and practice storage.</p>
          </div>
            <div className="settings-form-group">
              <label className="settings-label">Display Name</label>
              <input
                type="text"
                className="settings-input"
                value={displayName}
                onChange={handleDisplayNameChange}
                placeholder="How should we greet you?"
                maxLength={30}
              />
            </div>
            <div className="settings-form-group">
              <label className="settings-label">Account Email</label>
            <input
              type="text"
              className="settings-input settings-input--readonly"
              value={user?.email || 'guest@neurobridge.app'}
              readOnly
            />
            <span className="settings-hint">
              Rehearsal sessions and progress are saved locally to this account profile.
            </span>
          </div>
        </div>

        {/* Pacing Rhythm Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Conversational Pacing & Sensory Rhythm</h3>
            <p className="settings-card-desc">
              Controls the response cadence and deliberate thinking pause before your AI partner replies.
            </p>
          </div>
          <div className="settings-options-grid">
            {[
              {
                id: 'relaxed' as const,
                title: 'Relaxed (1.2s pause)',
                desc: 'Generates a calm, unhurried cadence with thinking pauses for low stimulation.',
              },
              {
                id: 'moderate' as const,
                title: 'Moderate (0.6s pause)',
                desc: 'Balanced conversational tempo matching everyday natural speech.',
              },
              {
                id: 'fast' as const,
                title: 'Instant (0s pause)',
                desc: 'Instant replies without artificial thinking pauses.',
              },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={`settings-option-tile ${settings.pacingSpeed === option.id ? 'settings-option-tile--active' : ''}`}
                onClick={() => handleUpdate('pacingSpeed', option.id)}
              >
                <div className="settings-option-tile-top">
                  <span className="settings-option-tile-title">{option.title}</span>
                  {settings.pacingSpeed === option.id && (
                    <span className="settings-option-badge">Active</span>
                  )}
                </div>
                <p className="settings-option-tile-desc">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
          <div className="settings-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="settings-card-title">Sensory Comfort & Accessibility</h3>
              <p className="settings-card-desc">Toggles for readability, motion reduction, and high contrast.</p>
            </div>
            <button 
              type="button" 
              className="dashboard-btn dashboard-btn--secondary"
              onClick={() => {
                window.dispatchEvent(new Event('nb_open_comfort'));
              }}
            >
              Open Comfort Settings
            </button>
          </div>

        {/* Footer actions */}
        <div className="settings-footer-actions">
          <button
            type="button"
            className="settings-reset-btn"
            onClick={handleResetDefaults}
          >
            <RefreshIcon size={14} />
            <span>Reset to defaults</span>
          </button>

          {saveStatus && (
            <div className="settings-saved-pill" role="status">
              <CheckCircleIcon size={15} />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

