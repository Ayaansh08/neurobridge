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
          subtitle=""
          iconType="sessions"
        />
        <StatCard
          title="Practice XP Points"
          value={stats.totalXp.toLocaleString()}
          subtitle={stats.weeklyXpChange}
          iconType="xp"
        />
      </div>

      <section className="dashboard-section" aria-labelledby="all-sessions-heading">
        <div className="dashboard-section-header">
          <span className="dashboard-section-eyebrow">ALL REHEARSAL ENTRIES</span>
          <h3 id="all-sessions-heading" className="dashboard-section-title">
            Complete Session History
          </h3>
          <p className="dashboard-section-subtitle">
            Your most recent practice sessions.
          </p>
        </div>

        <div className="sessions-table-card">
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
            <div className="sessions-list-container">
              <div className="sessions-table-header" aria-hidden="true">
                <div className="session-col-scenario">Scenario</div>
                <div className="session-col-date">Date</div>
                <div className="session-col-feedback">Score & Feedback</div>
                <div className="session-col-action">Action</div>
              </div>
              <div className="sessions-list-body" role="list">
                {sessions.map((session) => (
                  <SessionRow
                    key={session.sessionId}
                    session={session}
                    onRetry={onRetrySession}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
