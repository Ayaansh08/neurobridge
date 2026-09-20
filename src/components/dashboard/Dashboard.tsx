import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { BriefcaseIcon, SparklesIcon } from './Icons';
import { DashboardHeader } from './DashboardHeader';
import { StatCard } from './StatCard';
import { ScenarioCard } from './ScenarioCard';
import { SessionRow } from './SessionRow';
import { PracticeView } from './PracticeView';
import { ProgressView } from './ProgressView';
import { SettingsView } from './SettingsView';
import { authConfig } from '../../config/auth';

import { defaultScenarios, userProgressService } from '../../services/userProgressService';
import type { ScenarioItem, SessionSummary, UserStats, UnfinishedSession } from './types';
import './Dashboard.css';

interface DashboardProps {
  initialTab?: string;
  initialScenarioId?: string;
  onNavigate?: (path: string) => void;
  restoredSessionData?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({
  initialTab = 'dashboard',
  initialScenarioId,
  onNavigate,
  restoredSessionData,
}) => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>(initialScenarioId);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  // Sync tab if initialTab prop changes via browser popstate
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialScenarioId) {
      setActiveScenarioId(initialScenarioId);
    }
  }, [initialScenarioId]);

  // Custom display name derived dynamically from service
  const [customDisplayName, setCustomDisplayName] = useState(() => userProgressService.getDisplayName(user?.email));

  useEffect(() => {
    const handleNameChange = () => setCustomDisplayName(userProgressService.getDisplayName(user?.email));
    window.addEventListener('nb_displayname_changed', handleNameChange);

    return () => {
      window.removeEventListener('nb_displayname_changed', handleNameChange);
    };
  }, [user?.email]);

  const getDisplayName = (email?: string): string => {
    if (customDisplayName) return customDisplayName;
    if (!email) return 'Guest';
    const localPart = email.split('@')[0];
    const nameOnly = localPart.split(/[._-]/)[0];
    return nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);
  };

  const displayName = getDisplayName(user?.email);
  const userEmail = user?.email;

  // Real persistent user stats and session history
  const [userStats, setUserStats] = useState<UserStats>(() =>
    userProgressService.getUserStats(userEmail)
  );
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>(() =>
    userProgressService.getUserSessions(userEmail)
  );

  // Unfinished sessions management
  const [unfinishedSessions, setUnfinishedSessions] = useState<UnfinishedSession[]>(() =>
    userProgressService.getUnfinishedSessions(userEmail)
  );
  const [discardModalSession, setDiscardModalSession] = useState<UnfinishedSession | null>(null);
  const [restoreErrorNotice, setRestoreErrorNotice] = useState<{ message: string; sessionId: string } | null>(null);
  const [currentRestoredData, setCurrentRestoredData] = useState<any>(restoredSessionData);

  useEffect(() => {
    if (restoredSessionData) {
      setCurrentRestoredData(restoredSessionData);
    }
  }, [restoredSessionData]);

  const refreshUserData = useCallback(() => {
    setUserStats(userProgressService.getUserStats(userEmail));
    setRecentSessions(userProgressService.getUserSessions(userEmail));
    setUnfinishedSessions(userProgressService.getUnfinishedSessions(userEmail));
  }, [userEmail]);

  useEffect(() => {
    refreshUserData();
    const handleUnfinishedChanged = () => {
      setUnfinishedSessions(userProgressService.getUnfinishedSessions(userEmail));
    };
    window.addEventListener('nb_unfinished_sessions_changed', handleUnfinishedChanged);
    return () => window.removeEventListener('nb_unfinished_sessions_changed', handleUnfinishedChanged);
  }, [refreshUserData, userEmail]);

  const [scenariosNotice, setScenariosNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleFailed = () => {
      setScenariosNotice("We couldn't restore your last practice session. Choose a scenario to start a new one.");
    };
    window.addEventListener('nb_session_restore_failed', handleFailed);
    return () => window.removeEventListener('nb_session_restore_failed', handleFailed);
  }, []);

  const handleTabNavigate = (tab: string) => {
    setCurrentTab(tab);
    const targetPath = tab === 'dashboard' ? '/app' : `/app/${tab}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleStartPracticing = () => {
    setActiveScenarioId('job-interview');
    handleTabNavigate('practice');
  };

  const handleSelectScenario = (scenario: ScenarioItem) => {
    setActiveScenarioId(scenario.id);
    const targetPath = `/app/practice/${scenario.id}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setCurrentTab('practice');
  };

  const handleRetrySession = (session: SessionSummary) => {
    setActiveScenarioId(session.scenarioType);
    setCurrentTab('practice');
    const targetPath = `/app/practice/${session.scenarioType}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleResumeSession = async (session: UnfinishedSession) => {
    setRestoreErrorNotice(null);
    const endpoint = authConfig.apiEndpoint.replace(/\/+$/, '');
    if (!endpoint) {
      setRestoreErrorNotice({
        message: 'We could not restore this session.',
        sessionId: session.sessionId,
      });
      return;
    }
    try {
      const res = await fetch(`${endpoint}/sessions/${session.sessionId}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        throw new Error('Session not found or expired');
      }
      const data = await res.json();
      if (!data.messages || data.messages.length === 0) {
        throw new Error('No conversation history available');
      }
      setCurrentRestoredData({
        scenarioId: session.scenarioId,
        sessionRecord: data,
      });
      setActiveScenarioId(session.scenarioId);
      handleTabNavigate('practice');
      const targetPath = `/app/practice/${session.scenarioId}`;
      if (onNavigate) {
        onNavigate(targetPath);
      } else {
        window.history.pushState({}, '', targetPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (err) {
      console.warn('Could not restore session:', err);
      setRestoreErrorNotice({
        message: 'We could not restore this session.',
        sessionId: session.sessionId,
      });
    }
  };

  const handleDiscardSession = (sessionId: string) => {
    userProgressService.removeUnfinishedSession(sessionId, userEmail);
    setDiscardModalSession(null);
    if (restoreErrorNotice?.sessionId === sessionId) {
      setRestoreErrorNotice(null);
    }
  };

  const handleSignOut = () => {
    userProgressService.clearUnfinishedSessions(userEmail);
    logout();
    const targetPath = '/login';
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const formatStartedAt = (iso: string) => {
    try {
      const d = new Date(iso);
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `Started ${month} ${day}, ${hours}:${mins}`;
    } catch {
      return 'Started recently';
    }
  };

  // Dynamically map scenarios and select featured item
  const featuredScenario = defaultScenarios.find((s) => s.isFeatured) || defaultScenarios[0];
  const secondaryScenarios = defaultScenarios.filter((s) => s.id !== featuredScenario.id);

  return (
    <div className="dashboard-layout">
      {/* Subtle organic paper grain texture overlay */}
      <div className="dashboard-paper-grain" aria-hidden="true" />

      {/* Fixed Quiet Left Sidebar with real navigation links and active route reflection */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabNavigate}
        userEmail={userEmail}
        userName={displayName}
        onSignOut={handleSignOut}
      />

      {/* Main Low-Stimulation Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Notification Toast if an action is triggered */}
          {activeMessage && (
            <div className="dashboard-toast" role="status">
              <span className="toast-dot" />
              <span>{activeMessage}</span>
            </div>
          )}

          {/* Sub-Views for Navigation Tabs */}
          {currentTab === 'practice' && (
            <PracticeView
              initialScenarioId={activeScenarioId}
              restoredSessionData={currentRestoredData}
              onSessionComplete={() => {
                refreshUserData();
                setActiveMessage('Session completed! XP and stats updated.');
                setTimeout(() => setActiveMessage(null), 3500);
              }}
              onNavigate={handleTabNavigate}
            />
          )}

          {currentTab === 'scenarios' && (
            <section className="dashboard-section" aria-labelledby="scenarios-all-title">
              <div className="dashboard-section-header">
                <span className="dashboard-section-eyebrow">CURATED CONVERSATIONS</span>
                <h2 id="scenarios-all-title" className="dashboard-section-title">
                  All Practice Scenarios
                </h2>
                <p className="dashboard-section-subtitle">
                  Choose any scenario to practice low-stimulation rehearsals with your AI coach.
                </p>
                {(scenariosNotice || (typeof window !== 'undefined' && window.location.search.includes('redirect=no_session'))) && (
                  <div className="dashboard-notice" style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--nb-surface-card)', border: '1px solid var(--nb-border-subtle)', borderRadius: 'var(--nb-radius-card)', color: 'var(--nb-ink-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SparklesIcon size={16} style={{ color: 'var(--nb-accent)', flexShrink: 0 }} />
                    <span>{scenariosNotice || 'Choose a scenario to start practicing.'}</span>
                  </div>
                )}
              </div>

              {/* Slim Top Banner for Unfinished Practice if any exist */}
              {unfinishedSessions.length > 0 && (
                <div
                  className="unfinished-top-banner"
                  style={{
                    padding: '14px 20px',
                    background: 'var(--nb-surface-card)',
                    border: '1px solid var(--nb-accent-border)',
                    borderRadius: 'var(--nb-radius-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    boxShadow: '0 2px 8px rgba(168, 92, 140, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SparklesIcon size={16} style={{ color: 'var(--nb-accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--nb-ink-primary)' }}>
                      You have an unfinished practice: <strong>{unfinishedSessions[0].scenarioTitle}</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="dashboard-btn dashboard-btn--primary"
                    style={{ padding: '7px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                    onClick={() => handleResumeSession(unfinishedSessions[0])}
                  >
                    Resume
                  </button>
                </div>
              )}

              {/* Inline Restore Error Notice if restore fails */}
              {restoreErrorNotice && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px 18px',
                    background: 'var(--nb-surface-card)',
                    border: '1px solid var(--nb-rose, #D97070)',
                    borderRadius: 'var(--nb-radius-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ color: 'var(--nb-ink-primary)', fontSize: '13.5px' }}>{restoreErrorNotice.message}</span>
                  <button
                    type="button"
                    className="dashboard-btn dashboard-btn--secondary"
                    style={{ padding: '6px 14px', fontSize: '12.5px' }}
                    onClick={() => handleDiscardSession(restoreErrorNotice.sessionId)}
                  >
                    Remove it
                  </button>
                </div>
              )}

              {/* Good place to start banner card */}
              <div className="scenario-banner-card">
                <div className="scenario-banner-left">
                  <div className="scenario-banner-medallion">
                    <BriefcaseIcon size={22} />
                  </div>
                  <div className="scenario-banner-content">
                    <span className="scenario-banner-eyebrow">Good place to start</span>
                    <div className="scenario-banner-title-row">
                      <h3 className="scenario-banner-title">{featuredScenario.title}</h3>
                      {featuredScenario.duration && (
                        <span className="scenario-banner-duration">{featuredScenario.duration}</span>
                      )}
                    </div>
                    <p className="scenario-banner-desc">{featuredScenario.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="dashboard-cta-btn"
                  onClick={() => handleSelectScenario(featuredScenario)}
                >
                  <span>Start this scenario</span>
                </button>
              </div>

              {/* 2-Column Responsive Scenario Grid */}
              <div className="dashboard-scenarios-grid">
                {secondaryScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onSelect={handleSelectScenario}
                  />
                ))}
              </div>

              {/* Unfinished Sessions Logbook Section */}
              {unfinishedSessions.length > 0 && (
                <div className="unfinished-sessions-section" style={{ marginTop: '48px' }}>
                  <div className="dashboard-section-header">
                    <span className="dashboard-section-eyebrow">LOGBOOK</span>
                    <h3 className="dashboard-section-title" style={{ fontSize: '20px' }}>
                      Unfinished sessions
                    </h3>
                    <p className="dashboard-section-subtitle">
                      Pick up right where you left off. Up to 3 recent practice sessions are saved here.
                    </p>
                  </div>

                  <div className="unfinished-sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {unfinishedSessions.map((s) => (
                      <div
                        key={s.sessionId}
                        className="unfinished-session-card"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'var(--nb-surface-card)',
                          border: '1px solid var(--nb-border-subtle)',
                          borderRadius: 'var(--nb-radius-card)',
                          padding: '16px 20px',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
                          <div className="scenario-banner-medallion" style={{ width: 40, height: 40 }}>
                            <BriefcaseIcon size={18} />
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 3px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--nb-ink-primary)' }}>
                              {s.scenarioTitle}
                            </h4>
                            <div style={{ fontSize: '12px', color: 'var(--nb-ink-secondary)' }}>
                              {formatStartedAt(s.startedAt)} · Turn {s.userTurns} of 30
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="dashboard-btn dashboard-btn--primary"
                            style={{ padding: '7px 14px', fontSize: '12.5px' }}
                            onClick={() => handleResumeSession(s)}
                          >
                            Resume
                          </button>
                          <button
                            type="button"
                            className="dashboard-btn dashboard-btn--secondary"
                            style={{ padding: '7px 12px', fontSize: '12.5px' }}
                            onClick={() => setDiscardModalSession(s)}
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {currentTab === 'progress' && (
            <ProgressView
              stats={userStats}
              sessions={recentSessions}
              onNavigate={handleTabNavigate}
              onRetrySession={handleRetrySession}
            />
          )}

          {currentTab === 'settings' && <SettingsView />}

          {/* Main Dashboard Overview */}
          {(currentTab === 'dashboard' || currentTab === '') && (
            <>
              {/* Top Header */}
              <DashboardHeader
                userDisplayName={displayName}
                level={userStats.currentLevel}
                currentXp={userStats.currentLevelXp}
                nextLevelXp={userStats.nextLevelXp}
                onStartPracticing={handleStartPracticing}
              />

              {/* Asymmetric Stats Section: 1 Bespoke Streak Card + 2 Compact Stat Chips */}
              {userStats.sessionsCompleted > 0 ? (
                <section className="dashboard-stats-asymmetric" aria-label="Personal Momentum and Stats">
                  <StatCard
                    title="Current Streak"
                    value={userStats.currentStreak}
                    subtitle={userStats.streakStatus}
                    iconType="streak"
                  />
                  <div className="dashboard-stats-chips-column">
                    <StatCard
                      title="Sessions Completed"
                      value={userStats.sessionsCompleted}
                      subtitle=""
                      iconType="sessions"
                    />
                    <StatCard
                      title="Practice XP Points"
                      value={userStats.totalXp.toLocaleString()}
                      subtitle={userStats.weeklyXpChange}
                      iconType="xp"
                    />
                  </div>
                </section>
              ) : (
                <section className="dashboard-welcome-firstrun" style={{ padding: '24px', background: 'var(--nb-charcoal-subtle)', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--nb-charcoal-border)' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--nb-sage)', fontWeight: 500, fontFamily: 'Fraunces, serif' }}>Ready when you are</h3>
                  <p style={{ margin: 0, color: 'var(--nb-gray-400)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Your practice stats and momentum streak will appear here once you complete your first rehearsal. Pick a scenario below to start.
                  </p>
                </section>
              )}

              {/* Choose a Scenario / Continue Practice Section */}
              <section className="dashboard-section" aria-labelledby="scenarios-title">
                <div className="dashboard-section-header">
                  <span className="dashboard-section-eyebrow">
                    {unfinishedSessions.length > 0 ? 'CONTINUE PRACTICE' : 'REHEARSAL PROMPTS'}
                  </span>
                  <h2 id="scenarios-title" className="dashboard-section-title">
                    {unfinishedSessions.length > 0 ? 'Pick Up Where You Left Off' : 'Choose a Scenario'}
                  </h2>
                  <p className="dashboard-section-subtitle">
                    {unfinishedSessions.length > 0
                      ? 'Resume your active rehearsal or explore new conversational situations.'
                      : 'Select a real-world scenario to practice with real-time, low-stimulation feedback.'}
                  </p>
                </div>

                {unfinishedSessions.length > 0 ? (
                  <div className="scenario-banner-card">
                    <div className="scenario-banner-left">
                      <div className="scenario-banner-medallion">
                        <BriefcaseIcon size={22} />
                      </div>
                      <div className="scenario-banner-content">
                        <span className="scenario-banner-eyebrow">Continue practice</span>
                        <div className="scenario-banner-title-row">
                          <h3 className="scenario-banner-title">{unfinishedSessions[0].scenarioTitle}</h3>
                        </div>
                        <p className="scenario-banner-desc">
                          {formatStartedAt(unfinishedSessions[0].startedAt)} · Turn {unfinishedSessions[0].userTurns} of 30
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="dashboard-cta-btn"
                      onClick={() => handleResumeSession(unfinishedSessions[0])}
                    >
                      <span>Resume</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', maxWidth: '100%' }}>
                    <ScenarioCard
                      scenario={featuredScenario}
                      onSelect={handleSelectScenario}
                    />
                  </div>
                )}
              </section>

              {/* Recent Sessions List with Empty State Support */}
              <section className="dashboard-section" aria-labelledby="sessions-title">
                <div className="dashboard-section-header dashboard-section-header--split">
                  <div>
                    <span className="dashboard-section-eyebrow">LOGBOOK</span>
                    <h2 id="sessions-title" className="dashboard-section-title">
                      Recent Sessions
                    </h2>
                    <p className="dashboard-section-subtitle">
                      Your most recent practice sessions.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="dashboard-view-all-btn"
                    onClick={() => handleTabNavigate('progress')}
                  >
                    <span>View all sessions</span>
                    <span className="view-all-arrow">→</span>
                  </button>
                </div>

                <div className="dashboard-table-card">
                  {recentSessions.length === 0 ? (
                    <div className="dashboard-empty-state">
                      <div className="empty-state-dot" />
                      <h4 className="empty-state-title">No sessions recorded yet</h4>
                      <p className="empty-state-desc">
                        Your practice feedback and conversational scores will appear here after your first rehearsal.
                      </p>
                      <button
                        type="button"
                        className="dashboard-cta-btn"
                        onClick={handleStartPracticing}
                      >
                        <span>Start Your First Practice</span>
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
                          {recentSessions.slice(0, 1).map((session) => (
                            <SessionRow
                              key={session.sessionId}
                              session={session}
                              onRetry={handleRetrySession}
                              onRowClick={() => handleTabNavigate('progress')}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Discard Confirmation Dialog Modal */}
      {discardModalSession && (
        <div
          className="comfort-modal-overlay"
          onClick={() => setDiscardModalSession(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="comfort-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              background: 'var(--nb-surface-card)',
              border: '1px solid var(--nb-border-subtle)',
              borderRadius: 'var(--nb-radius-card)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <h3
              id="discard-modal-title"
              style={{
                margin: '0 0 10px 0',
                fontSize: '19px',
                fontFamily: 'var(--font-serif-display)',
                color: 'var(--nb-ink-primary)',
              }}
            >
              Discard unfinished session?
            </h3>
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: 'var(--nb-ink-secondary)',
                lineHeight: 1.5,
              }}
            >
              Discard this unfinished session? This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={() => setDiscardModalSession(null)}
              >
                Keep Session
              </button>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                style={{
                  background: 'var(--nb-accent)',
                  borderColor: 'var(--nb-accent)',
                }}
                onClick={() => handleDiscardSession(discardModalSession.sessionId)}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
