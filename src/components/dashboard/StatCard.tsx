import React from 'react';
import { CheckCircleIcon, FlameIcon, StarIcon } from './Icons';
import type { StatCardProps } from './types';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  iconType,
}) => {
  const isStreak = iconType === 'streak';

  const renderIcon = () => {
    switch (iconType) {
      case 'sessions':
        return <CheckCircleIcon size={18} className="stat-chip-icon" />;
      case 'streak':
        return <FlameIcon size={30} className="streak-bespoke-flame" />;
      case 'xp':
        return <StarIcon size={18} className="stat-chip-icon" />;
    }
  };

  if (isStreak) {
    // Large bespoke streak card with hand-drawn flame & progress ring
    return (
      <div className="stat-card stat-card--streak">
        <div className="stat-streak-visual">
          <div className="stat-streak-flame-container">
            {renderIcon()}
          </div>
          {/* Subtle concentric analog milestone marker */}
          <div className="stat-streak-ring-accent" aria-hidden="true" />
        </div>

        <div className="stat-streak-content">
          <div className="stat-card-eyebrow">PRACTICE MOMENTUM</div>
          <div className="stat-streak-number-row">
            <span className="stat-streak-value">{value}</span>
            <span className="stat-streak-unit">days</span>
          </div>
          <div className="stat-card-title">{title}</div>
          <p className="stat-streak-note">
            <span className="stat-sage-dot" />
            {subtitle}
          </p>
        </div>
      </div>
    );
  }

  // Smaller companion stat chips beside the primary streak card
  return (
    <div className={`stat-card stat-card--chip stat-card--${iconType}`}>
      <div className="stat-chip-top">
        <span className="stat-card-eyebrow">
          {iconType === 'sessions' ? 'ALL TIME' : 'ACCUMULATED'}
        </span>
        <div className="stat-chip-icon-box">
          {renderIcon()}
        </div>
      </div>

      <div className="stat-chip-body">
        <div className="stat-chip-value">{value}</div>
        <div className="stat-card-title">{title}</div>
      </div>

      <div className="stat-chip-footer">
        <span className="stat-chip-pill">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

