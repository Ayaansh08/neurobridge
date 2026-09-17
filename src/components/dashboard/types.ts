import type { ScenarioType } from '../../../backend/lambdas/shared/types';

export type DifficultyTag = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserStats {
  sessionsCompleted: number;
  weeklySessionsChange: string;
  currentStreak: number;
  streakStatus: string;
  totalXp: number;
  weeklyXpChange: string;
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export interface ScenarioItem {
  id: string;
  scenarioType: ScenarioType;
  title: string;
  description: string;
  difficulty: DifficultyTag;
  icon: 'interview' | 'conflict' | 'boundary' | 'raise' | 'custom';
}

/**
 * Matches DynamoDB SessionRecord structure from backend/lambdas/shared/types.ts
 * with additional evaluation/feedback fields for UI display.
 */
export interface SessionSummary {
  sessionId: string;
  userId: string;
  scenarioType: ScenarioType;
  scenarioTitle: string;
  difficultyLevel: number;
  formattedDate: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  iconType: 'sessions' | 'streak' | 'xp';
}

export interface ScenarioCardProps {
  scenario: ScenarioItem;
  onSelect?: (scenario: ScenarioItem) => void;
}

export interface SessionRowProps {
  session: SessionSummary;
  onRetry?: (session: SessionSummary) => void;
}

export interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
  onSignOut: () => void;
}

export interface DashboardHeaderProps {
  userDisplayName: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  onStartPracticing?: () => void;
}
