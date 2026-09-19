import React from 'react';
import type { UserStats, SessionSummary } from './types';
import { StatCard } from './StatCard';
import { SessionRow } from './SessionRow';

interface ProgressViewProps {
  stats: UserStats;
  sessions: SessionSummary[];
  onNavigate?: (path: string) => void;
  onRetrySession?: (session: SessionSummary) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  stats,
  sessions,
  onNavigate,
  onRetrySession,
}) => {
  return (
    <div className="progress-view-container">
      <div className="dashboard-section-header">
        <span className="dashboard-section-eyebrow">YOUR JOURNEY</span>
        <h2 className="dashboard-section-title">Progress & Momentum</h2>
        <p className="dashboard-section-subtitle">
          Track your confidence build-up, session evaluations, and steady consistency.
        </p>
      </div>

      <div className="progress-metrics-grid">
        <StatCard
          title="Current Streak"
          value={stats.currentStreak}
          subtitle={stats.streakStatus}
          iconType="streak"
        />
        <StatCard
          title="Sessions Completed"
          value={stats.sessionsCompleted}
          subtitle={stats.weeklySessionsChange}
          iconType="sessions"
        />
        <StatCard
          title="Practice XP Points"
          value={stats.totalXp.toLocaleString()}
          subtitle={stats.weeklyXpChange}
          iconType="xp"
        />
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <span className="dashboard-section-eyebrow">ALL REHEARSAL ENTRIES</span>
          <h3 className="dashboard-section-title">Complete Session History</h3>
        </div>

        <div className="dashboard-table-card">
          {sessions.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="empty-state-dot" />
              <h4 className="empty-state-title">No sessions recorded yet</h4>
              <p className="empty-state-desc">
                Start your first calm conversation practice to build your confidence logbook.
              </p>
              <button
                type="button"
                className="dashboard-cta-btn"
                onClick={() => onNavigate?.('/app/practice')}
              >
                <span>Start First Practice</span>
              </button>
            </div>
          ) : (
            <div className="dashboard-table-scroll">
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th scope="col" className="th-scenario">Scenario</th>
                    <th scope="col" className="th-date">Date</th>
                    <th scope="col" className="th-feedback">Score & Feedback</th>
                    <th scope="col" className="th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <SessionRow
                      key={session.sessionId}
                      session={session}
                      onRetry={onRetrySession}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

