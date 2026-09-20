import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userProgressService } from '../../services/userProgressService';
import { settingsService, type UserSettings, DEFAULT_SETTINGS } from '../../services/settingsService';
import { CheckCircleIcon, RefreshIcon } from './Icons';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(() => userProgressService.getDisplayName(user?.email));
  const [draftName, setDraftName] = useState(displayName);
  const [nameSaveStatus, setNameSaveStatus] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getSettings());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleNameSave = () => {
    const trimmed = draftName.trim().substring(0, 30);
    setDraftName(trimmed);
    setDisplayName(trimmed);
    userProgressService.saveDisplayName(trimmed, user?.email);
    window.dispatchEvent(new Event('nb_displayname_changed'));
    setNameSaveStatus('Saved');
    setTimeout(() => setNameSaveStatus(null), 2500);
  };

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
    setSaveStatus('Comfort settings reset.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="settings-view-container">
      <div className="dashboard-section-header">
        <span className="dashboard-section-eyebrow">PREFERENCES</span>
        <h2 className="dashboard-section-title">Sensory & Account Settings</h2>
        <p className="dashboard-section-subtitle">
          Customize sensory comfort, pacing rhythm, and account profile settings.
        </p>
      </div>

      <div className="settings-grid">
        {/* Account Details Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Account & Profile</h3>
            <p className="settings-card-desc">Your practice profile identity and storage settings.</p>
          </div>

          <div className="settings-form-group">
            <label className="settings-label" htmlFor="settings-display-name">Display Name</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="settings-display-name"
                type="text"
                className="settings-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value.substring(0, 30))}
                placeholder="How should we greet you?"
                maxLength={30}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={handleNameSave}
                style={{ whiteSpace: 'nowrap' }}
              >
                Save
              </button>
            </div>
            {nameSaveStatus && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--nb-emerald, #6E9B7D)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircleIcon size={12} /> <span>{nameSaveStatus}</span>
              </div>
            )}
          </div>

          <div className="settings-form-group">
            <label className="settings-label" htmlFor="settings-email">Email (used to sign in)</label>
            <input
              id="settings-email"
              type="text"
              className="settings-input settings-input--readonly"
              value={user?.email || 'guest@neurobridge.app'}
              readOnly
            />
            <span className="settings-hint">
              Rehearsal history is stored securely on NeuroBridge servers. Experience points and preferences are stored locally on this device.
            </span>
          </div>
        </div>

        {/* Sensory Comfort & Pacing Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">Sensory Comfort & Pacing</h3>
            <p className="settings-card-desc">Adjust visual intensity, readability, and conversational response timing. Changes apply immediately.</p>
          </div>

          <div className="settings-comfort-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Text size */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <div className="settings-comfort-label">Text Size</div>
                <div className="settings-comfort-sub">Adjust text scale for comfortable reading.</div>
              </div>
              <div className="settings-pill-toggle" role="group" aria-label="Text Size">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.textSize === 'standard' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('textSize', 'standard')}
                  aria-pressed={settings.textSize === 'standard'}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.textSize === 'large' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('textSize', 'large')}
                  aria-pressed={settings.textSize === 'large'}
                >
                  Large
                </button>
              </div>
            </div>

            {/* Contrast */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <div className="settings-comfort-label">High Contrast</div>
                <div className="settings-comfort-sub">Increase border sharpness and text contrast.</div>
              </div>
              <div className="settings-pill-toggle" role="group" aria-label="High Contrast">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.contrast === 'standard' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('contrast', 'standard')}
                  aria-pressed={settings.contrast === 'standard'}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.contrast === 'high' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('contrast', 'high')}
                  aria-pressed={settings.contrast === 'high'}
                >
                  High
                </button>
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <div className="settings-comfort-label">Reduced Motion</div>
                <div className="settings-comfort-sub">Calm static mode with zero animations.</div>
              </div>
              <div className="settings-pill-toggle" role="group" aria-label="Reduced Motion">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.motion === 'standard' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('motion', 'standard')}
                  aria-pressed={settings.motion === 'standard'}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.motion === 'reduced' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('motion', 'reduced')}
                  aria-pressed={settings.motion === 'reduced'}
                >
                  Reduced
                </button>
              </div>
            </div>

            {/* Conversation Pacing */}
            <div className="settings-comfort-item">
              <div className="settings-comfort-info">
                <div className="settings-comfort-label">Conversation Pacing</div>
                <div className="settings-comfort-sub">Set response pause before AI replies (1.2s, 0.6s, or 0s).</div>
              </div>
              <div className="settings-pill-toggle" role="group" aria-label="Conversation Pacing">
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.pacingSpeed === 'relaxed' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('pacingSpeed', 'relaxed')}
                  aria-pressed={settings.pacingSpeed === 'relaxed'}
                >
                  Relaxed
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.pacingSpeed === 'moderate' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('pacingSpeed', 'moderate')}
                  aria-pressed={settings.pacingSpeed === 'moderate'}
                >
                  Moderate
                </button>
                <button
                  type="button"
                  className={`settings-pill-btn ${settings.pacingSpeed === 'instant' ? 'settings-pill-btn--active' : ''}`}
                  onClick={() => handleUpdate('pacingSpeed', 'instant')}
                  aria-pressed={settings.pacingSpeed === 'instant'}
                >
                  Instant
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="settings-footer-actions">
          <button
            type="button"
            className="dashboard-btn dashboard-btn--secondary"
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
