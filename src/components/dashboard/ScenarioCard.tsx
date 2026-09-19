import React from 'react';
import {
  BriefcaseIcon,
  ShieldIcon,
  TrendingUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  PhoneIcon,
  UserPlusIcon,
  HelpCircleIcon,
  ZapIcon,
} from './Icons';
import type { ScenarioCardProps } from './types';

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect }) => {
  const renderIcon = () => {
    const iconSize = scenario.isFeatured ? 22 : 18;
    switch (scenario.icon) {
      case 'interview':
        return <BriefcaseIcon size={iconSize} />;
      case 'raise':
        return <TrendingUpIcon size={iconSize} />;
      case 'professor':
        return <GraduationCapIcon size={iconSize} />;
      case 'boundary':
        return <ShieldIcon size={iconSize} />;
      case 'help':
        return <HelpCircleIcon size={iconSize} />;
      case 'phone':
        return <PhoneIcon size={iconSize} />;
      case 'meet':
        return <UserPlusIcon size={iconSize} />;
      case 'conflict':
        return <ZapIcon size={iconSize} />;
      case 'custom':
      default:
        return <SparklesIcon size={iconSize} />;
    }
  };

  const difficultyKey = scenario.difficulty.toLowerCase();
  const difficultyClass = `difficulty-pill--${difficultyKey}`;

  if (scenario.isFeatured) {
    return (
      <div
        className="scenario-card scenario-card--featured"
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
        {/* Subtle warm decorative background pattern */}
        <div className="scenario-featured-texture" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="calm-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#C9633D" fillOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#calm-dots)" />
          </svg>
        </div>

        <div className="scenario-featured-badge-row">
          <span className="scenario-featured-eyebrow">
            {scenario.tagline || 'RECOMMENDED FOR YOU'}
          </span>
          <span className={`difficulty-pill ${difficultyClass}`}>
            {scenario.difficulty}
          </span>
        </div>

        <div className="scenario-featured-header">
          <div className="scenario-featured-icon-box">
            {renderIcon()}
          </div>
          <div className="scenario-featured-headings">
            <h3 className="scenario-featured-title">{scenario.title}</h3>
            {scenario.duration && (
              <span className="scenario-featured-duration">{scenario.duration}</span>
            )}
          </div>
        </div>

        <p className="scenario-featured-desc">{scenario.description}</p>

        <div className="scenario-featured-footer">
          <span className="scenario-featured-action">
            Begin scenario practice <ArrowRightIcon size={13} className="scenario-arrow" />
          </span>
        </div>
      </div>
    );
  }

  // Compact horizontal scenario card
  return (
    <div
      className="scenario-card scenario-card--compact"
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
      <div className="scenario-compact-icon-box">
        {renderIcon()}
      </div>

      <div className="scenario-compact-content">
        <div className="scenario-compact-header-row">
          <h3 className="scenario-compact-title">{scenario.title}</h3>
          <span className={`difficulty-pill ${difficultyClass}`}>
            {scenario.difficulty}
          </span>
        </div>
        <p className="scenario-compact-desc">{scenario.description}</p>
      </div>

      <div className="scenario-compact-tail">
        {scenario.duration && (
          <span className="scenario-compact-duration">{scenario.duration}</span>
        )}
        <div className="scenario-compact-arrow-wrap" aria-hidden="true">
          <ArrowRightIcon size={14} className="scenario-compact-arrow" />
        </div>
      </div>
    </div>
  );
};

