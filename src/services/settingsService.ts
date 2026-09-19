export interface UserSettings {
  pacingSpeed: 'relaxed' | 'moderate' | 'fast';
  responseLength: 'concise' | 'balanced' | 'detailed';
  coachingTone: 'gentle' | 'direct' | 'structured';
  textSize: 'regular' | 'large';
  contrast: 'standard' | 'high';
  motion: 'standard' | 'reduced';
}

const SETTINGS_STORAGE_KEY = 'neurobridge_settings';

export const DEFAULT_SETTINGS: UserSettings = {
  pacingSpeed: 'relaxed',
  responseLength: 'concise',
  coachingTone: 'gentle',
  textSize: 'regular',
  contrast: 'standard',
  motion: 'standard',
};

export const PACING_DELAYS: Record<UserSettings['pacingSpeed'], number> = {
  relaxed: 1200,
  moderate: 600,
  fast: 0,
};

export const settingsService = {
  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated: UserSettings = { ...current, ...settings };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    this.applyComfortStyles(updated);
    window.dispatchEvent(new CustomEvent('neurobridge_settings_changed', { detail: updated }));
    return updated;
  },

  applyComfortStyles(settings?: UserSettings) {
    const s = settings || this.getSettings();
    const root = document.documentElement;

    // Text size
    if (s.textSize === 'large') {
      root.setAttribute('data-text-size', 'large');
    } else {
      root.removeAttribute('data-text-size');
    }

    // High contrast
    if (s.contrast === 'high') {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }

    // Reduced motion
    if (s.motion === 'reduced') {
      root.setAttribute('data-motion', 'reduced');
    } else {
      root.removeAttribute('data-motion');
    }
  },

  getPacingDelayMs(): number {
    const s = this.getSettings();
    return PACING_DELAYS[s.pacingSpeed] ?? 1200;
  },
};

// Initial apply on load
if (typeof document !== 'undefined') {
  settingsService.applyComfortStyles();
}
