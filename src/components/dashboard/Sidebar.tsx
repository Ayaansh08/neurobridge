import React from 'react';
import {
  BrainLogo,
  DashboardIcon,
  PracticeIcon,
  ScenariosIcon,
  ProgressIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
} from './Icons';
import type { SidebarProps } from './types';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'practice', label: 'Practice', icon: PracticeIcon },
  { id: 'scenarios', label: 'Scenarios', icon: ScenariosIcon },
  { id: 'progress', label: 'Progress', icon: ProgressIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userEmail = 'krishnagoeljpkw@gmail.com',
  onSignOut,
}) => {
  // Extract initials from email or fallback
  const getInitials = (email: string) => {
    const namePart = email.split('@')[0];
    if (namePart.toLowerCase().includes('krishna')) {
      return 'KG';
    }
    const clean = namePart.replace(/[^a-zA-Z]/g, '');
    return clean.slice(0, 2).toUpperCase() || 'NB';
  };

  const initials = getInitials(userEmail);

  return (
    <aside className="dashboard-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <BrainLogo size={34} className="sidebar-brand-icon" />
        <span className="sidebar-brand-title">NeuroBridge</span>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sidebar-nav-icon-wrap">
                <Icon size={18} />
              </span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Pinned User Info & Sign Out */}
      <div className="sidebar-footer">
        <div className="sidebar-user" title={userEmail}>
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-email">{userEmail}</span>
          </div>
          <ChevronRightIcon size={16} className="sidebar-user-arrow" />
        </div>

        <button
          type="button"
          className="sidebar-signout-btn"
          onClick={onSignOut}
          title="Sign out"
        >
          <LogOutIcon size={18} />
          <span className="sidebar-signout-text">Sign out</span>
        </button>
      </div>
    </aside>
  );
};
