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

export const SessionRow: React.FC<SessionRowProps> = ({ session, onRetry }) => {

  const computeScore = (dimensions: any) => {
    if (!dimensions) return 0;
    const map: Record<string, number> = { strong: 3, developing: 2, 'needs practice': 1 };
    return (
      (map[dimensions.clarity?.rating] || 0) +
      (map[dimensions.tone?.rating] || 0) +
      (map[dimensions.responsiveness?.rating] || 0) +
      (map[dimensions.composure?.rating] || 0)
    );
  };
  const score = session.evaluation?.dimensions ? computeScore(session.evaluation.dimensions) : null;

  const getScenarioIcon = () => {
    switch (session.scenarioType) {
      case 'job-interview':
        return <BriefcaseIcon size={15} />;
      case 'handle-conflict':
        return <UsersIcon size={15} />;
      case 'set-boundary':
        return <ShieldIcon size={15} />;
      case 'talk-to-manager':
        return <TrendingUpIcon size={15} />;
      default:
        return <SparklesIcon size={15} />;
    }
  };

  return (
    <tr className="session-table-row">
      {/* Scenario Column */}
      <td className="session-col-scenario">
        <div className="session-scenario-cell">
          <div className="session-icon-wrapper">
            {getScenarioIcon()}
          </div>
          <span className="session-scenario-name">{session.scenarioTitle}</span>
        </div>
      </td>

      {/* Date Column */}
      <td className="session-col-date">
        <span className="session-date-text">{session.formattedDate}</span>
      </td>

      {/* Feedback Column */}
      <td className="session-col-feedback">
        <div className="session-feedback-cell">
          <span className="session-score-pill session-score--sage" style={score ? { background: 'var(--nb-emerald-surface)', color: 'var(--nb-emerald)', border: '1px solid var(--nb-emerald-border)' } : {}}>
            {score ? ${score} / 12 : 'Completed'}
          </span>
          <span className="session-feedback-text">{session.feedback}</span>
        </div>
      </td>

      {/* Action Column */}
      <td className="session-col-action">
        <button
          type="button"
          className="session-retry-btn"
          onClick={() => onRetry?.(session)}
          title={`Revisit ${session.scenarioTitle}`}
        >
          <RefreshIcon size={13} className="session-retry-icon" />
          <span>Practice again</span>
        </button>
      </td>
    </tr>
  );
};

