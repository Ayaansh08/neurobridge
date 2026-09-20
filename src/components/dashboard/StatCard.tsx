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
  const numVal = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
  const unitText = numVal === 1 ? 'day' : 'days';

  const renderIcon = () => {
    switch (iconType) {
      case 'streak':
        return <FlameIcon size={18} strokeWidth={1.25} className="stat-card-icon" />;
      case 'sessions':
        return <CheckCircleIcon size={18} strokeWidth={1.25} className="stat-card-icon" />;
      case 'xp':
        return <StarIcon size={18} strokeWidth={1.25} className="stat-card-icon" />;
    }
  };

  const getEyebrow = () => {
    switch (iconType) {
      case 'streak':
        return 'PRACTICE MOMENTUM';
      case 'sessions':
        return 'REHEARSALS COMPLETED';
      case 'xp':
        return 'PRACTICE REWARDS';
    }
  };

  const hasSubtitle = Boolean(subtitle && subtitle.trim() !== '' && !subtitle.includes('total'));

  return (
    <div className={`stat-card stat-card--${iconType}`}>
      <div className="stat-card-header">
        <span className="stat-card-eyebrow">{getEyebrow()}</span>
        <div className="stat-card-medallion" aria-hidden="true">
          {renderIcon()}
        </div>
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value-row">
          <span className="stat-card-value">{value}</span>
          {isStreak && <span className="stat-card-unit">{unitText}</span>}
        </div>
        <div className="stat-card-title">{title}</div>
      </div>

      <div className="stat-card-footer">
        {hasSubtitle ? (
          <p className="stat-card-helper">
            {isStreak && <span className="stat-sage-dot" />}
            {subtitle}
          </p>
        ) : (
          <div className="stat-card-spacer" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};
