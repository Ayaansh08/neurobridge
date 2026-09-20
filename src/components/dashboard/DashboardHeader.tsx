import React from 'react';
import type { DashboardHeaderProps } from './types';
import { BlurText } from '../animations/BlurText';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userDisplayName,
  level,
  currentXp,
  nextLevelXp,
}) => {
  const safeNextXp = nextLevelXp > 0 ? nextLevelXp : 250;
  const fillPercent = Math.min(100, Math.max(0, (currentXp / safeNextXp) * 100));

  const greetingText =
    userDisplayName && userDisplayName !== 'Guest'
      ? `Welcome back, ${userDisplayName}`
      : 'Welcome back';

  return (
    <header className="dashboard-header-editorial">
      <div className="dashboard-header-left">
        <span className="dashboard-eyebrow">PRACTICE DESK</span>
        <h1 className="dashboard-greeting">
          <BlurText text={greetingText} delay={40} animateBy="words" />
        </h1>
        <p className="dashboard-tagline">
          Calm, low-pressure rehearsal for real-life conversations.
        </p>
      </div>

      <div className="dashboard-header-right">
        {/* SloshGauge Inset Ring Level Badge (No Box-in-a-Box) */}
        <div
          className="dashboard-level-slosh"
          title={`Level ${level} · ${currentXp}/${safeNextXp} XP (${safeNextXp - currentXp} XP to Level ${level + 1})`}
          role="status"
          aria-label={`Level ${level}, ${currentXp} of ${safeNextXp} XP`}
        >
          <div
            className="dashboard-level-slosh__ring"
            style={{ '--slosh-fill': `${fillPercent}%` } as React.CSSProperties}
          >
            <div className="dashboard-level-slosh__liquid" aria-hidden="true">
              <span className="dashboard-level-slosh__wave dashboard-level-slosh__wave--front" />
              <span className="dashboard-level-slosh__wave dashboard-level-slosh__wave--back" />
            </div>
            <span className="dashboard-level-slosh__number">{level}</span>
          </div>

          <div className="dashboard-level-slosh__meta">
            <div className="dashboard-level-slosh__label">LEVEL {level}</div>
            <div className="dashboard-level-slosh__xp">
              <span className="xp-current">{currentXp}</span>
              <span className="xp-sep">/</span>
              <span className="xp-total">{safeNextXp} XP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

