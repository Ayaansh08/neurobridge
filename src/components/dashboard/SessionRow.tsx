import React from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  ShieldIcon,
  TrendingUpIcon,
  SparklesIcon,
  RefreshIcon,
} from './Icons';
import type { SessionRowProps } from './types';

export const SessionRow: React.FC<SessionRowProps> = ({ session, onRetry, onRowClick }) => {
  const computeScore = (dimensions: any) => {
    if (!dimensions) return null;
    const map: Record<string, number> = { strong: 3, developing: 2, 'needs practice': 1 };
    const total =
      (map[dimensions.clarity?.rating] || 0) +
      (map[dimensions.tone?.rating] || 0) +
      (map[dimensions.responsiveness?.rating] || 0) +
      (map[dimensions.composure?.rating] || 0);
    return total > 0 ? total : null;
  };

  const score = session.evaluation?.dimensions ? computeScore(session.evaluation.dimensions) : null;

  const getScenarioIcon = () => {
    switch (session.scenarioType) {
      case 'job-interview':
        return <BriefcaseIcon size={16} />;
      case 'handle-conflict':
        return <UsersIcon size={16} />;
      case 'set-boundary':
        return <ShieldIcon size={16} />;
      case 'talk-to-manager':
        return <TrendingUpIcon size={16} />;
      default:
        return <SparklesIcon size={16} />;
    }
  };

  return (
    <div
      className="session-row"
      role="listitem"
      onClick={onRowClick}
      style={onRowClick ? { cursor: 'pointer' } : undefined}
    >
      {/* Scenario Cell */}
      <div className="session-row-scenario">
        <div className="session-row-icon-box" aria-hidden="true">
          {getScenarioIcon()}
        </div>
        <span className="session-row-title">{session.scenarioTitle}</span>
      </div>

      {/* Date Cell */}
      <div className="session-row-date">
        <span className="session-row-date-text">{session.formattedDate}</span>
      </div>

      {/* Feedback & Score Cell */}
      <div className="session-row-feedback">
        <span className="session-score-pill session-score--sage">
          {score ? `${score} / 12` : 'Completed'}
        </span>
        <span className="session-feedback-text">{session.feedback}</span>
      </div>

      {/* Action Cell */}
      <div className="session-row-action">
        <button
          type="button"
          className="session-retry-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRetry?.(session);
          }}
          title={`Revisit ${session.scenarioTitle}`}
        >
          <RefreshIcon size={13} className="session-retry-icon" />
          <span>Practice again</span>
        </button>
      </div>
    </div>
  );
};
