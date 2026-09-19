import type { ScenarioType } from '../../backend/lambdas/shared/types';
import type { UserStats, ScenarioItem, SessionSummary } from '../components/dashboard/types';

const STORAGE_KEYS = {
  STATS: 'neurobridge_user_stats',
  SESSIONS: 'neurobridge_user_sessions',
};

export const defaultScenarios: ScenarioItem[] = [
  {
    id: 'job-interview',
    scenarioType: 'job-interview',
    title: 'Job Interview',
    description: 'Practice answering technical and behavioral questions with Taylor, an engineering hiring manager.',
    difficulty: 'Beginner',
    icon: 'interview',
    isFeatured: true,
    duration: '10–12 min',
    tagline: 'Recommended for you today',
  },
  {
    id: 'talk-to-manager',
    scenarioType: 'talk-to-manager',
    title: 'Asking for a Raise',
    description: 'Discuss compensation, promotion, and performance with Marcus, an engineering director.',
    difficulty: 'Advanced',
    icon: 'raise',
    duration: '12 min',
  },
  {
    id: 'talk-to-professor',
    scenarioType: 'talk-to-professor',
    title: 'Talk to Professor',
    description: 'Discuss coursework, extensions, and research during office hours with Professor Vance.',
    difficulty: 'Intermediate',
    icon: 'custom',
    duration: '8 min',
  },
  {
    id: 'set-boundary',
    scenarioType: 'set-boundary',
    title: 'Setting Boundaries',
    description: 'Hold professional boundaries and resist unreasonable favor requests from coworker Sam.',
    difficulty: 'Intermediate',
    icon: 'boundary',
    duration: '8 min',
  },
  {
    id: 'ask-for-help',
    scenarioType: 'ask-for-help',
    title: 'Asking for Help',
    description: 'Reach out to senior engineer Jordan to unblock a complex technical issue respectfully.',
    difficulty: 'Beginner',
    icon: 'conflict',
    duration: '10 min',
  },
  {
    id: 'phone-call',
    scenarioType: 'phone-call',
    title: 'Clinic Phone Call',
    description: 'Schedule appointments and navigate real-time calendar constraints with receptionist Morgan.',
    difficulty: 'Beginner',
    icon: 'custom',
    duration: '6 min',
  },
  {
    id: 'meet-someone-new',
    scenarioType: 'meet-someone-new',
    title: 'Meet Someone New',
    description: 'Start a casual, low-pressure conversation at a tech meetup with attendee Alex.',
    difficulty: 'Beginner',
    icon: 'custom',
    duration: '8 min',
  },
  {
    id: 'handle-conflict',
    scenarioType: 'handle-conflict',
    title: 'Handle Product Conflict',
    description: 'Navigate a tense disagreement over product direction with stressed startup co-founder Riley.',
    difficulty: 'Advanced',
    icon: 'conflict',
    duration: '15 min',
  },
];

export const userProgressService = {
  getUserStats(userEmail?: string): UserStats {
    const key = userEmail ? `${STORAGE_KEYS.STATS}_${userEmail}` : STORAGE_KEYS.STATS;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Default initial progress for any newly authenticated user
    return {
      sessionsCompleted: 0,
      weeklySessionsChange: '0 this week',
      currentStreak: 0,
      streakStatus: 'Ready to begin your practice',
      totalXp: 0,
      weeklyXpChange: '0 this week',
      currentLevel: 1,
      currentLevelXp: 0,
      nextLevelXp: 250,
    };
  },

  saveUserStats(stats: UserStats, userEmail?: string): void {
    const key = userEmail ? `${STORAGE_KEYS.STATS}_${userEmail}` : STORAGE_KEYS.STATS;
    localStorage.setItem(key, JSON.stringify(stats));
  },

  getUserSessions(userEmail?: string): SessionSummary[] {
    const key = userEmail ? `${STORAGE_KEYS.SESSIONS}_${userEmail}` : STORAGE_KEYS.SESSIONS;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  },

  recordCompletedSession(
    scenarioType: ScenarioType,
    scenarioTitle: string,
    feedback: string,
    evaluation?: FeedbackEvaluation,
    userEmail?: string
  ): { updatedStats: UserStats; newSession: SessionSummary } {
    const currentSessions = this.getUserSessions(userEmail);
    const currentStats = this.getUserStats(userEmail);

    const newSession: SessionSummary = {
      sessionId: `sess-${Date.now()}`,
      userId: userEmail || 'guest',
      scenarioType,
      scenarioTitle,
      difficultyLevel: 1,
      formattedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      feedback,
      evaluation,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const updatedSessions = [newSession, ...currentSessions];
    const keySessions = userEmail ? `${STORAGE_KEYS.SESSIONS}_${userEmail}` : STORAGE_KEYS.SESSIONS;
    localStorage.setItem(keySessions, JSON.stringify(updatedSessions));

    // Fixed session completion reward (+100 XP) — non-judgmental progression
    const xpGained = 100;
    const newTotalXp = currentStats.totalXp + xpGained;
    let newLevel = currentStats.currentLevel;
    let newCurrentXp = currentStats.currentLevelXp + xpGained;
    let newNextLevelXp = currentStats.nextLevelXp;

    while (newCurrentXp >= newNextLevelXp) {
      newCurrentXp -= newNextLevelXp;
      newLevel += 1;
      newNextLevelXp = Math.round(newNextLevelXp * 1.5);
    }

    const updatedStats: UserStats = {
      ...currentStats,
      sessionsCompleted: currentStats.sessionsCompleted + 1,
      weeklySessionsChange: `+${currentStats.sessionsCompleted + 1} total`,
      currentStreak: Math.max(1, currentStats.currentStreak + 1),
      streakStatus: 'Momentum active · keep it going',
      totalXp: newTotalXp,
      weeklyXpChange: `+${xpGained} XP today`,
      currentLevel: newLevel,
      currentLevelXp: newCurrentXp,
      nextLevelXp: newNextLevelXp,
    };

    this.saveUserStats(updatedStats, userEmail);

    return { updatedStats, newSession };
  },
};
