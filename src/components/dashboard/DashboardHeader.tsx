import React from 'react';
import { PlayIcon } from './Icons';
import type { DashboardHeaderProps } from './types';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userDisplayName,
  level,
  currentXp,
  nextLevelXp,
  onStartPracticing,
}) => {
  const fraction = Math.min(1, Math.max(0, currentXp / nextLevelXp));
  // Circumference for r=15 is 2 * PI * 15 ≈ 94.25
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - fraction * circumference;

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
        <h1 className="dashboard-greeting">
          Welcome back, {userDisplayName}
        </h1>
        <p className="dashboard-tagline">
          Calm, low-pressure rehearsal for real-life conversations.
        </p>
      </div>

      <div className="dashboard-header-right">
        {/* Bespoke Dotted/Arc XP Component */}
        <div
          className="dashboard-level-widget"
          title={`Level ${level} · ${currentXp} of ${nextLevelXp} XP to Level ${level + 1}`}
          role="status"
          aria-label={`Level ${level}, ${currentXp} of ${nextLevelXp} XP`}
        >
          <div className="dashboard-level-arc-wrap">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              className="dashboard-level-arc-svg"
            >
              {/* Background muted track */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="level-arc-track"
                strokeWidth="2.5"
                strokeDasharray="2 3"
              />
              {/* Progress Terracotta Arc with organic rounded cap */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="level-arc-fill"
                strokeWidth="2.8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 22 22)"
              />
            </svg>
            <span className="dashboard-level-number">{level}</span>
          </div>

          <div className="dashboard-level-info">
            <div className="dashboard-level-label">LEVEL {level}</div>
            <div className="dashboard-level-xp-text">
              <span className="xp-current">{currentXp}</span>
              <span className="xp-sep">/</span>
              <span className="xp-total">{nextLevelXp} XP</span>
            </div>
          </div>
        </div>

        {/* Terracotta CTA Button */}
        <button
          type="button"
          className="dashboard-cta-btn"
          onClick={onStartPracticing}
        >
          <PlayIcon size={12} className="dashboard-cta-icon" />
          <span>Start Practicing</span>
        </button>
      </div>
    </header>
  );
};

