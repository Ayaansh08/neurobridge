import React, { useState } from 'react';
import Aurora from '../Aurora';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { StatCard } from './StatCard';
import { ScenarioCard } from './ScenarioCard';
import { SessionRow } from './SessionRow';
import { mockUserStats, mockScenarios, mockRecentSessions } from './mockData';
import type { ScenarioItem, SessionSummary } from './types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  // Derive display name from user's email or fallback to 'Krishna' as seen in the mockup
  const getDisplayName = (email?: string): string => {
    if (!email) return 'Krishna';
    const localPart = email.split('@')[0];
    if (localPart.toLowerCase().includes('krishna')) {
      return 'Krishna';
    }
    // Capitalize first letter of email handle
    const nameOnly = localPart.split(/[._-]/)[0];
    return nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);
  };

  const displayName = getDisplayName(user?.email);
  const userEmail = user?.email || 'krishnagoeljpkw@gmail.com';

  const handleStartPracticing = () => {
    setActiveMessage('Starting quick practice session with your AI coach...');
    setTimeout(() => setActiveMessage(null), 3500);
  };

  const handleSelectScenario = (scenario: ScenarioItem) => {
    setActiveMessage(`Launching "${scenario.title}" simulation...`);
    setTimeout(() => setActiveMessage(null), 3500);
  };

  const handleRetrySession = (session: SessionSummary) => {
    setActiveMessage(`Restarting session: "${session.scenarioTitle}"...`);
    setTimeout(() => setActiveMessage(null), 3500);
  };

  const handleSignOut = () => {
    logout();
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="dashboard-layout">
      {/* Background Aurora */}
      <div className="dashboard-aurora-wrapper" aria-hidden="true">
        <Aurora
          colorStops={['#1D4ED8', '#38BDF8', '#93C5FD']}
          amplitude={0.85}
          blend={0.42}
          speed={0.55}
        />
        <div className="dashboard-aurora-overlay" />
      </div>

      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'dashboard') {
            setActiveMessage(`Switched to ${tab.charAt(0).toUpperCase() + tab.slice(1)} view`);
            setTimeout(() => setActiveMessage(null), 2500);
          }
        }}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Notification Toast if an action is triggered */}
          {activeMessage && (
            <div className="dashboard-toast" role="status">
              <span className="toast-dot" />
              <span>{activeMessage}</span>
            </div>
          )}

          {/* Top Header */}
          <DashboardHeader
            userDisplayName={displayName}
            level={mockUserStats.currentLevel}
            currentXp={mockUserStats.currentLevelXp}
            nextLevelXp={mockUserStats.nextLevelXp}
            onStartPracticing={handleStartPracticing}
          />

          {/* 3-Card Stats Row */}
          <section className="dashboard-stats-row" aria-label="Key Statistics">
            <StatCard
              title="Sessions Completed"
              value={mockUserStats.sessionsCompleted}
              subtitle={mockUserStats.weeklySessionsChange}
              iconType="sessions"
            />
            <StatCard
              title="Current Streak"
              value={mockUserStats.currentStreak}
              subtitle={mockUserStats.streakStatus}
              iconType="streak"
            />
            <StatCard
              title="XP Points"
              value={mockUserStats.totalXp.toLocaleString()}
              subtitle={mockUserStats.weeklyXpChange}
              iconType="xp"
            />
          </section>

          {/* Choose a Scenario Grid */}
          <section className="dashboard-section" aria-labelledby="scenarios-title">
            <div className="dashboard-section-header">
              <h2 id="scenarios-title" className="dashboard-section-title">
                Choose a Scenario
              </h2>
              <p className="dashboard-section-subtitle">
                Pick a scenario and start practicing with your AI coach.
              </p>
            </div>

            <div className="dashboard-scenarios-grid">
              {mockScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={handleSelectScenario}
                />
              ))}
            </div>
          </section>

          {/* Recent Sessions Table */}
          <section className="dashboard-section" aria-labelledby="sessions-title">
            <div className="dashboard-section-header dashboard-section-header--split">
              <div>
                <h2 id="sessions-title" className="dashboard-section-title">
                  Recent Sessions
                </h2>
                <p className="dashboard-section-subtitle">
                  Your latest practice sessions and feedback.
                </p>
              </div>
              <button
                type="button"
                className="dashboard-view-all-btn"
                onClick={() => {
                  setActiveMessage('Loading all historical sessions...');
                  setTimeout(() => setActiveMessage(null), 2500);
                }}
              >
                View all →
              </button>
            </div>

            <div className="dashboard-table-card">
              <div className="dashboard-table-scroll">
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th scope="col" className="th-scenario">Scenario</th>
                      <th scope="col" className="th-date">Date</th>
                      <th scope="col" className="th-feedback">Score / Feedback</th>
                      <th scope="col" className="th-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRecentSessions.map((session) => (
                      <SessionRow
                        key={session.sessionId}
                        session={session}
                        onRetry={handleRetrySession}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
