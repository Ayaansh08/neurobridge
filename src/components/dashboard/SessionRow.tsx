import React from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  ShieldIcon,
  TrendingUpIcon,
  SparklesIcon,
} from './Icons';
import type { SessionRowProps } from './types';

export const SessionRow: React.FC<SessionRowProps> = ({ session, onRetry }) => {
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

  // Determine score badge color
  const getScoreTheme = (score: number) => {
    if (score >= 8.5) return 'score-badge--emerald';
    if (score >= 7.5) return 'score-badge--cyan';
    return 'score-badge--blue';
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

      {/* Score / Feedback Column */}
      <td className="session-col-feedback">
        <div className="session-feedback-cell">
          <span className={`session-score-badge ${getScoreTheme(session.score)}`}>
            {session.score.toFixed(1)} / {session.maxScore}
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
        >
          Retry
        </button>
      </td>
    </tr>
  );
};
