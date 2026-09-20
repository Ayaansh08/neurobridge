import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { BriefcaseIcon } from './Icons';
import { DashboardHeader } from './DashboardHeader';
import { StatCard } from './StatCard';
import { ScenarioCard } from './ScenarioCard';
import { SessionRow } from './SessionRow';
import { PracticeView } from './PracticeView';
import { ProgressView } from './ProgressView';
import { SettingsView } from './SettingsView';

import { defaultScenarios, userProgressService } from '../../services/userProgressService';
import type { ScenarioItem, SessionSummary, UserStats } from './types';
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
    const [hasActiveSession, setHasActiveSession] = useState(!!restoredSessionData || !!localStorage.getItem(`nb_active_session_${user?.email || 'guest'}`));
  useEffect(() => {
    const checkSession = () => setHasActiveSession(!!restoredSessionData || !!localStorage.getItem(`nb_active_session_${user?.email || 'guest'}`));
    window.addEventListener('storage', checkSession);
    const interval = setInterval(checkSession, 1000);
    return () => { window.removeEventListener('storage', checkSession); clearInterval(interval); };
  }, [user?.email, restoredSessionData]);

  // Sync tab if initialTab prop changes via browser popstate
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialScenarioId) {
      setActiveScenarioId(initialScenarioId);
    }
  }, [initialScenarioId]);

  // Derive display name dynamically from user's email or account object

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

  // Real, persistent user progress and session history state
  const [userStats, setUserStats] = useState<UserStats>(() =>
    userProgressService.getUserStats(userEmail)
  );
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>(() =>
    userProgressService.getUserSessions(userEmail)
  );

  const refreshUserData = useCallback(() => {
    setUserStats(userProgressService.getUserStats(userEmail));
    setRecentSessions(userProgressService.getUserSessions(userEmail));
  }, [userEmail]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

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

  const handleSignOut = () => {
    logout();
    const targetPath = '/login';
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
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
                  {scenariosNotice && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--nb-rose-subtle)', color: 'var(--nb-rose)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>&#9888;</span>
                      <span>{scenariosNotice}</span>
                    </div>
                  )}
                  {!scenariosNotice && !restoredSessionData && !hasActiveSession && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--nb-charcoal-subtle)', color: 'var(--nb-gray-400)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>&#128161;</span>
                      <span>Choose a scenario to start practicing.</span>
                    </div>
                  )}
              </div>

                              <div className="scenario-banner-card">
                  <div className="scenario-banner-left">
                    <div className="scenario-banner-header">
                      <div className="scenario-banner-icon">
                        <BriefcaseIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--nb-gray-400)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Good place to start
                        </div>
                        <h3 className="scenario-banner-title">{featuredScenario.title}</h3>
                      </div>
                    </div>
                    <p className="scenario-banner-desc">
                      {featuredScenario.description}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="dashboard-cta-btn" 
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleSelectScenario(featuredScenario)}
                  >
                    <span>Start this scenario</span>
                  </button>
                </div>

                <div className="dashboard-scenarios-grid">
                  {secondaryScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={handleSelectScenario}
                    />
                  ))}
                </div>
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

              {/* Choose a Scenario Section: Asymmetric 2-Column Editorial Layout */}
              <section className="dashboard-section" aria-labelledby="scenarios-title">
                <div className="dashboard-section-header">
                  <span className="dashboard-section-eyebrow">REHEARSAL PROMPTS</span>
                  <h2 id="scenarios-title" className="dashboard-section-title">
                    Choose a Scenario
                  </h2>
                  <p className="dashboard-section-subtitle">
                    Select a real-world scenario to practice with real-time, low-stimulation feedback.
                  </p>
                </div>

                <div style={{ width: '100%', maxWidth: '100%' }}>
                  <ScenarioCard
                    scenario={featuredScenario}
                    onSelect={handleSelectScenario}
                  />
                </div>
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
                      Review your recent conversational pacing, assertions, and key takeaways.
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
    </div>
  );
};

export default Dashboard;


