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
  const scoreVal = score !== null ? score : 0;
  const ringRadius = 11;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (Math.min(12, Math.max(0, scoreVal)) / 12) * ringCircumference;

  const getScenarioIcon = () => {
    switch (session.scenarioType) {
      case 'job-interview':
        return <BriefcaseIcon size={15} strokeWidth={1.25} />;
      case 'handle-conflict':
        return <UsersIcon size={15} strokeWidth={1.25} />;
      case 'set-boundary':
        return <ShieldIcon size={15} strokeWidth={1.25} />;
      case 'talk-to-manager':
        return <TrendingUpIcon size={15} strokeWidth={1.25} />;
      default:
        return <SparklesIcon size={15} strokeWidth={1.25} />;
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
        <div className="session-score-ring-badge" title={score ? `Score: ${score}/12` : 'Session Completed'}>
          <svg width="26" height="26" viewBox="0 0 26 26" className="session-mini-ring-svg">
            <circle
              cx="13"
              cy="13"
              r={ringRadius}
              className="session-mini-ring-track"
              strokeWidth="1.5"
            />
            <circle
              cx="13"
              cy="13"
              r={ringRadius}
              className="session-mini-ring-fill"
              strokeWidth="1.5"
              strokeDasharray={ringCircumference}
              strokeDashoffset={score !== null ? ringOffset : 0}
              transform="rotate(-90 13 13)"
            />
          </svg>
          <span className="session-score-ring-label">
            {score !== null ? `${score}/12` : 'DONE'}
          </span>
        </div>
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
          <RefreshIcon size={13} strokeWidth={1.25} className="session-retry-icon" />
          <span>Practice again</span>
        </button>
      </div>
    </div>
  );
};
