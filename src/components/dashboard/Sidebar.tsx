import React from 'react';
import {
  BrainLogo,
  DashboardIcon,
  PracticeIcon,
  ScenariosIcon,
  ProgressIcon,
  SettingsIcon,
  LogOutIcon,
  ComfortSlidersIcon,
} from './Icons';
import type { SidebarProps } from './types';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', path: '/app', label: 'Dashboard', icon: DashboardIcon },
  { id: 'practice', path: '/app/practice', label: 'Practice', icon: PracticeIcon },
  { id: 'scenarios', path: '/app/scenarios', label: 'Scenarios', icon: ScenariosIcon },
  { id: 'progress', path: '/app/progress', label: 'Progress', icon: ProgressIcon },
  { id: 'settings', path: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userEmail,
  userName,
  onSignOut,
  onOpenComfort,
  hasActiveSession,
}) => {
  // Extract initials dynamically from user's email/name, or fallback to 'NB'
  const getInitials = () => {
    if (userName && userName !== 'Guest') {
      const parts = userName.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return userName.slice(0, 2).toUpperCase();
    }
    if (userEmail) {
      const handle = userEmail.split('@')[0].replace(/[^a-zA-Z]/g, '');
      return handle.slice(0, 2).toUpperCase() || 'NB';
    }
    return 'NB';
  };

  const initials = getInitials();
  const displayEmail = userEmail || 'guest@neurobridge.app';
  const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Guest User');

  return (
    <aside className="dashboard-sidebar" aria-label="Main Navigation Sidebar">
      {/* Brand Header */}
      <a
        href="/app"
        className="sidebar-brand"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('dashboard');
        }}
      >
        <BrainLogo size={28} className="sidebar-brand-icon" />
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">NeuroBridge</span>
          <span className="sidebar-brand-sub">AI Conversation Coach</span>
        </div>
      </a>

      {/* Navigation List */}
      <div className="sidebar-nav-section">
        <span className="sidebar-nav-heading">MENU</span>
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            if (item.id === 'practice' && !hasActiveSession) return null;
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === 'dashboard' && currentTab === '') ||
              window.location.pathname === item.path;

            return (
              <a
                key={item.id}
                href={item.path}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange(item.id);
                }}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active jewel-tone tick marker */}
                <span className="sidebar-active-tick" aria-hidden="true" />
                <span className="sidebar-nav-icon-wrap">
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.6} />
                </span>
                <span className="sidebar-nav-label">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Sensory Comfort Quick Control */}
      {onOpenComfort && (
        <div className="sidebar-comfort-trigger-wrap">
          <button
            type="button"
            className="sidebar-comfort-trigger-btn"
            onClick={onOpenComfort}
            title="Open Sensory Comfort Controls"
          >
            <ComfortSlidersIcon size={16} />
            <span>Comfort Modes</span>
          </button>
        </div>
      )}

      {/* Quiet Physical Notebook style helper note */}
      <div className="sidebar-companion-note">
        <div className="sidebar-companion-title">Quiet Space</div>
        <p className="sidebar-companion-text">
          Paced rehearsals with no pressure or timed constraints.
        </p>
      </div>

      {/* Bottom Pinned User Info & Sign Out */}
      <div className="sidebar-footer">
        <div className="sidebar-user" title={displayEmail}>
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-email">{displayEmail}</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-signout-btn"
          onClick={onSignOut}
          title="Sign out of NeuroBridge"
        >
          <LogOutIcon size={15} />
          <span className="sidebar-signout-text">Sign out</span>
        </button>
      </div>
    </aside>
  );
};


