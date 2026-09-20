import React from 'react';
import {
  Logo,
  DashboardIcon,
  ScenariosIcon,
  ProgressIcon,
  SettingsIcon,
  LogOutIcon,
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

  const isTabActive = (itemId: string) => {
    if (itemId === 'dashboard') {
      return currentTab === 'dashboard' || currentTab === '';
    }
    if (itemId === 'scenarios') {
      return currentTab === 'scenarios' || currentTab === 'practice';
    }
    return currentTab === itemId;
  };

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
        aria-label="NeuroBridge Home"
      >
        <Logo size={28} className="sidebar-brand-icon" />
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
            const Icon = item.icon;
            const isActive = isTabActive(item.id);

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
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-nav-icon-wrap">
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.6} />
                </span>
                <span className="sidebar-nav-label">{item.label}</span>
              </a>
            );
          })}
        </nav>
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
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOutIcon size={15} />
          <span className="sidebar-signout-text">Sign out</span>
        </button>
      </div>
    </aside>
  );
};



