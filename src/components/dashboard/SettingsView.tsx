import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [pacingSpeed, setPacingSpeed] = useState('relaxed');
  const [responseLength, setResponseLength] = useState('concise');
  const [coachingTone, setCoachingTone] = useState('gentle');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Preferences saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="settings-view-container">
      <div className="dashboard-section-header">
        <span className="dashboard-section-eyebrow">PREFERENCES</span>
        <h2 className="dashboard-section-title">Sensory & Coaching Settings</h2>
        <p className="dashboard-section-subtitle">
          Customize coach communication rhythm and low-stimulation parameters.
        </p>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-group">
            <label className="settings-label">Account Email</label>
            <input
              type="text"
              className="settings-input settings-input--readonly"
              value={user?.email || 'guest@neurobridge.app'}
              readOnly
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">Pacing Rhythm</label>
            <div className="settings-options-row">
              {['relaxed', 'moderate', 'fast'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`settings-option-btn ${pacingSpeed === p ? 'settings-option-btn--active' : ''}`}
                  onClick={() => setPacingSpeed(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <span className="settings-hint">
              Controls the response cadence and artificial delay for low stimulation.
            </span>
          </div>

          <div className="settings-group">
            <label className="settings-label">AI Response Length</label>
            <div className="settings-options-row">
              {['concise', 'balanced', 'detailed'].map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`settings-option-btn ${responseLength === l ? 'settings-option-btn--active' : ''}`}
                  onClick={() => setResponseLength(l)}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">Coaching Tone</label>
            <div className="settings-options-row">
              {['gentle', 'direct', 'structured'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`settings-option-btn ${coachingTone === t ? 'settings-option-btn--active' : ''}`}
                  onClick={() => setCoachingTone(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="dashboard-cta-btn">
              <span>Save Preferences</span>
            </button>
            {saveStatus && <span className="settings-saved-note">{saveStatus}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};
