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
  icon: 'interview' | 'conflict' | 'boundary' | 'raise' | 'professor' | 'help' | 'phone' | 'meet' | 'custom';
  isFeatured?: boolean;
  duration?: string;
  tagline?: string;
}

export type DimensionRating = 'strong' | 'developing' | 'needs practice';

export interface FeedbackDimension {
  rating: DimensionRating;
  note: string;
}

export interface FeedbackEvaluation {
  summary: string;
  dimensions: {
    clarity: FeedbackDimension;
    tone: FeedbackDimension;
    responsiveness: FeedbackDimension;
    composure: FeedbackDimension;
  };
  whatWentWell: string;
  tryImproving: string;
  encouragement: string;
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
  feedback: string;
  evaluation?: FeedbackEvaluation;
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
  userName?: string;
  onSignOut: () => void;
  onOpenComfort?: () => void;
}

export interface DashboardHeaderProps {
  userDisplayName: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  onStartPracticing?: () => void;
  onOpenComfort?: () => void;
}


