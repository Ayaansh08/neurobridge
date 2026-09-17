import React from 'react';
import { CheckCircleIcon, FlameIcon, StarIcon } from './Icons';
import type { StatCardProps } from './types';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  iconType,
}) => {
  const renderIcon = () => {
    switch (iconType) {
      case 'sessions':
        return <CheckCircleIcon size={22} className="stat-card-icon" />;
      case 'streak':
        return <FlameIcon size={22} className="stat-card-icon" />;
      case 'xp':
        return <StarIcon size={22} className="stat-card-icon" />;
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-card-icon-bubble stat-card-icon-bubble--${iconType}`}>
          {renderIcon()}
        </div>
        <div className="stat-card-content">
          <div className="stat-card-value">{value}</div>
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-subtitle">
            {iconType === 'streak' ? (
              <span className="stat-card-streak-tag">
                <span className="stat-card-fire-emoji">🔥</span> {subtitle}
              </span>
            ) : (
              <span className="stat-card-growth-tag">
                <span className="stat-card-arrow">↗</span> {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
