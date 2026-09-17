import React from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  ShieldIcon,
  TrendingUpIcon,
  SparklesIcon,
  ArrowRightIcon,
} from './Icons';
import type { ScenarioCardProps } from './types';

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect }) => {
  const renderIcon = () => {
    switch (scenario.icon) {
      case 'interview':
        return <BriefcaseIcon size={20} className="scenario-icon" />;
      case 'conflict':
        return <UsersIcon size={20} className="scenario-icon" />;
      case 'boundary':
        return <ShieldIcon size={20} className="scenario-icon" />;
      case 'raise':
        return <TrendingUpIcon size={20} className="scenario-icon" />;
      case 'custom':
        return <SparklesIcon size={20} className="scenario-icon" />;
      default:
        return <SparklesIcon size={20} className="scenario-icon" />;
    }
  };

  const difficultyClass = `difficulty-badge--${scenario.difficulty.toLowerCase()}`;

  return (
    <div
      className="scenario-card"
      onClick={() => onSelect?.(scenario)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(scenario);
        }
      }}
    >
      <div className="scenario-card-header">
        <div className={`scenario-icon-box scenario-icon-box--${scenario.icon}`}>
          {renderIcon()}
        </div>
      </div>

      <div className="scenario-card-body">
        <h3 className="scenario-card-title">{scenario.title}</h3>
        <p className="scenario-card-description">{scenario.description}</p>
      </div>

      <div className="scenario-card-footer">
        <span className={`difficulty-badge ${difficultyClass}`}>
          {scenario.difficulty}
        </span>
        <div className="scenario-card-arrow-wrap" aria-hidden="true">
          <ArrowRightIcon size={14} className="scenario-card-arrow" />
        </div>
      </div>
    </div>
  );
};
