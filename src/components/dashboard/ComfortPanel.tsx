import React, { useState, useEffect } from 'react';
import { settingsService, type UserSettings } from '../../services/settingsService';
import { CloseIcon, ComfortSlidersIcon } from './Icons';

interface ComfortPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComfortPanel: React.FC<ComfortPanelProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getSettings());

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };
    window.addEventListener('neurobridge_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('neurobridge_settings_changed', handleSettingsChange);
  }, []);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    settingsService.saveSettings({ [key]: value });
  };

  return (
    <div className="comfort-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="comfort-title">
      <div className="comfort-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="comfort-modal-header">
          <div className="comfort-modal-header-left">
            <ComfortSlidersIcon size={18} className="comfort-modal-icon" />
            <h3 id="comfort-title" className="comfort-modal-title">Sensory Comfort Controls</h3>
          </div>
          <button type="button" className="comfort-modal-close-btn" onClick={onClose} aria-label="Close comfort controls">
            <CloseIcon size={16} />
          </button>
        </div>

        <p className="comfort-modal-desc">
          Adjust visual intensity and sensory parameters. Changes apply immediately across all screens.
        </p>

        <div className="comfort-modal-list">
          {/* Text size */}
          <div className="comfort-modal-item">
            <div className="comfort-modal-item-info">
              <span className="comfort-modal-item-label">Text Size</span>
              <span className="comfort-modal-item-sub">Enlarge body and heading text</span>
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
                Large
              </button>
            </div>
          </div>

          {/* Contrast */}
          <div className="comfort-modal-item">
            <div className="comfort-modal-item-info">
              <span className="comfort-modal-item-label">High Contrast</span>
              <span className="comfort-modal-item-sub">Sharp borders & maximum ink clarity</span>
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
                High
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="comfort-modal-item">
            <div className="comfort-modal-item-info">
              <span className="comfort-modal-item-label">Reduced Motion</span>
              <span className="comfort-modal-item-sub">Calm static mode with zero animations</span>
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
                Reduced
              </button>
            </div>
          </div>

          {/* Conversational Pacing */}
          <div className="comfort-modal-item">
            <div className="comfort-modal-item-info">
              <span className="comfort-modal-item-label">Coach Pacing</span>
              <span className="comfort-modal-item-sub">Thinking pause before AI replies</span>
            </div>
            <div className="settings-pill-toggle">
              <button
                type="button"
                className={`settings-pill-btn ${settings.pacingSpeed === 'relaxed' ? 'settings-pill-btn--active' : ''}`}
                onClick={() => handleUpdate('pacingSpeed', 'relaxed')}
              >
                Relaxed
              </button>
              <button
                type="button"
                className={`settings-pill-btn ${settings.pacingSpeed === 'moderate' ? 'settings-pill-btn--active' : ''}`}
                onClick={() => handleUpdate('pacingSpeed', 'moderate')}
              >
                Moderate
              </button>
              <button
                type="button"
                className={`settings-pill-btn ${settings.pacingSpeed === 'fast' ? 'settings-pill-btn--active' : ''}`}
                onClick={() => handleUpdate('pacingSpeed', 'fast')}
              >
                Instant
              </button>
            </div>
          </div>
        </div>

        <div className="comfort-modal-footer">
          <button type="button" className="dashboard-cta-btn" onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
