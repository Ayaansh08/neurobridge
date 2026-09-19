import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { settingsService, type UserSettings, DEFAULT_SETTINGS } from '../../services/settingsService';
import { CheckCircleIcon, RefreshIcon, ComfortSlidersIcon } from './Icons';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
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

        {/* AI Response Style & Length */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">AI Response Length</h3>
            <p className="settings-card-desc">Set how concise or elaborate practice partners should be.</p>
          </div>
          <div className="settings-options-row">
            {[
              { id: 'concise' as const, label: 'Concise (1–2 sentences)' },
              { id: 'balanced' as const, label: 'Balanced (Standard dialogue)' },
              { id: 'detailed' as const, label: 'Detailed (Expanded roleplay)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`settings-option-btn ${settings.responseLength === item.id ? 'settings-option-btn--active' : ''}`}
                onClick={() => handleUpdate('responseLength', item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coaching Tone */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Coaching Tone</h3>
            <p className="settings-card-desc">Choose the feedback style that makes you feel most supported.</p>
          </div>
          <div className="settings-options-row">
            {[
              { id: 'gentle' as const, label: 'Gentle & Encouraging' },
              { id: 'direct' as const, label: 'Direct & Candid' },
              { id: 'structured' as const, label: 'Structured & Analytical' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`settings-option-btn ${settings.coachingTone === item.id ? 'settings-option-btn--active' : ''}`}
                onClick={() => handleUpdate('coachingTone', item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comfort & Accessibility Controls */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title-row">
              <ComfortSlidersIcon size={18} className="settings-card-icon" />
              <h3 className="settings-card-title">Sensory Comfort & Accessibility</h3>
            </div>
            <p className="settings-card-desc">
              Instant toggles for low-stimulation readability, motion reduction, and high contrast.
            </p>
          </div>

          <div className="settings-comfort-grid">
            {/* Text Size */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <span className="settings-comfort-label">Text Size</span>
                <span className="settings-comfort-sub">Adjust typography scale across the app</span>
              </div>
              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.textSize === 'regular' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('textSize', 'regular')}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.textSize === 'large' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('textSize', 'large')}
                >
                  Large (18px)
                </button>
              </div>
            </div>

            {/* High Contrast */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <span className="settings-comfort-label">Contrast Mode</span>
                <span className="settings-comfort-sub">Enhanced borders and vivid white ink</span>
              </div>
              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.contrast === 'standard' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('contrast', 'standard')}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.contrast === 'high' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('contrast', 'high')}
                >
                  High Contrast
                </button>
              </div>
            </div>

            {/* Motion */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <span className="settings-comfort-label">Motion & Animations</span>
                <span className="settings-comfort-sub">Disable WebGL waves and smooth transitions</span>
              </div>
              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.motion === 'standard' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('motion', 'standard')}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.motion === 'reduced' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('motion', 'reduced')}
                >
                  Reduced Motion
                </button>
              </div>
            </div>
          </div>
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
