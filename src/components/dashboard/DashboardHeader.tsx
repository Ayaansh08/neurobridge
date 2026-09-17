import React from 'react';
import { StarIcon, PlayIcon } from './Icons';
import type { DashboardHeaderProps } from './types';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userDisplayName,
  level,
  currentXp,
  nextLevelXp,
  onStartPracticing,
}) => {
  const xpPercentage = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <h1 className="dashboard-greeting">
          Welcome back, {userDisplayName} <span className="greeting-wave" role="img" aria-label="wave">👋</span>
        </h1>
        <p className="dashboard-tagline">Better conversations. A stronger you.</p>
      </div>

      <div className="dashboard-header-right">
        {/* XP Level Badge */}
        <div className="dashboard-xp-badge" title={`${currentXp} out of ${nextLevelXp} XP to Level ${level + 1}`}>
          <div className="dashboard-xp-star-circle">
            <StarIcon size={13} className="dashboard-xp-star" />
          </div>
          <span className="dashboard-xp-level">Level {level}</span>
          <div className="dashboard-xp-progress-bar">
            <div
              className="dashboard-xp-progress-fill"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <span className="dashboard-xp-text">
            {currentXp} / {nextLevelXp} XP
          </span>
        </div>

        {/* Start Practicing CTA */}
        <button
          type="button"
          className="dashboard-cta-btn"
          onClick={onStartPracticing}
        >
          <PlayIcon size={13} className="dashboard-cta-icon" />
          <span>Start Practicing →</span>
        </button>
      </div>
    </header>
  );
};
