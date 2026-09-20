export interface UserSettings {
  pacingSpeed: 'relaxed' | 'moderate' | 'instant';
  textSize: 'standard' | 'large';
  contrast: 'standard' | 'high';
  motion: 'standard' | 'reduced';
}

const SETTINGS_STORAGE_KEY = 'neurobridge_settings';

const getInitialDefaultMotion = (): 'standard' | 'reduced' => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }
  return 'standard';
};

export const DEFAULT_SETTINGS: UserSettings = {
  pacingSpeed: 'relaxed',
  textSize: 'standard',
  contrast: 'standard',
  motion: getInitialDefaultMotion(),
};

export const PACING_DELAYS: Record<string, number> = {
  relaxed: 1200,
  moderate: 600,
  instant: 0,
  fast: 0,
};

export const settingsService = {
  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Normalize legacy values
        if (parsed.textSize === 'regular') parsed.textSize = 'standard';
        if (parsed.pacingSpeed === 'fast') parsed.pacingSpeed = 'instant';
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          motion: parsed.motion || DEFAULT_SETTINGS.motion,
        };
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
    if (typeof document === 'undefined') return;
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
