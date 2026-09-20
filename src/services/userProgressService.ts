import type { ScenarioType } from '../../backend/lambdas/shared/types';
import type { UserStats, ScenarioItem, SessionSummary, FeedbackEvaluation, UnfinishedSession } from '../components/dashboard/types';

const STORAGE_KEYS = {
  STATS: 'neurobridge_user_stats',
  SESSIONS: 'neurobridge_user_sessions',
  DISPLAY_NAME: 'neurobridge_display_name',
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
    duration: '10-12 min',
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
    icon: 'professor',
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
    icon: 'help',
    duration: '10 min',
  },
  {
    id: 'phone-call',
    scenarioType: 'phone-call',
    title: 'Clinic Phone Call',
    description: 'Schedule appointments and navigate real-time calendar constraints with receptionist Morgan.',
    difficulty: 'Beginner',
    icon: 'phone',
    duration: '6 min',
  },
  {
    id: 'meet-someone-new',
    scenarioType: 'meet-someone-new',
    title: 'Meet Someone New',
    description: 'Start a casual, low-pressure conversation at a tech meetup with attendee Alex.',
    difficulty: 'Beginner',
    icon: 'meet',
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
  getDisplayName(userEmail?: string): string {
    const key = userEmail ? `${STORAGE_KEYS.DISPLAY_NAME}_${userEmail}` : STORAGE_KEYS.DISPLAY_NAME;
    return localStorage.getItem(key) || '';
  },

  saveDisplayName(name: string, userEmail?: string): void {
    const key = userEmail ? `${STORAGE_KEYS.DISPLAY_NAME}_${userEmail}` : STORAGE_KEYS.DISPLAY_NAME;
    localStorage.setItem(key, name);
  },

  recomputeStatsFromSessions(sessions: SessionSummary[], currentStats: UserStats): UserStats {
    if (!sessions || sessions.length === 0) {
      return { ...currentStats, sessionsCompleted: 0, currentStreak: 0, streakStatus: 'Ready to begin your practice', totalXp: 0, weeklyXpChange: '+0 XP today', currentLevel: 1, currentLevelXp: 0, nextLevelXp: 250 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let xpToday = 0;
    const uniqueDays: number[] = [];

    // Sessions are mostly recent first, but sort to be safe
    const sorted = [...sessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sorted.forEach((session) => {
      const d = new Date(session.createdAt);
      d.setHours(0, 0, 0, 0);
      const time = d.getTime();

      if (time === today.getTime()) {
        xpToday += 100; // Fixed 100 XP per session
      }

      if (uniqueDays.length === 0 || uniqueDays[uniqueDays.length - 1] !== time) {
        uniqueDays.push(time);
      }
    });

    let streak = 0;
    if (uniqueDays.length > 0) {
      const firstDayTime = uniqueDays[0];
      const diffDaysFromToday = Math.round((today.getTime() - firstDayTime) / (1000 * 60 * 60 * 24));
      
      if (diffDaysFromToday <= 1) {
        streak = 1;
        let currentCheck = firstDayTime;
        for (let i = 1; i < uniqueDays.length; i++) {
          const nextDayTime = uniqueDays[i];
          const diff = Math.round((currentCheck - nextDayTime) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            streak++;
            currentCheck = nextDayTime;
          } else {
            break;
          }
        }
      }
    }

    const totalXp = sorted.length * 100;
    let level = 1;
    let currentXp = totalXp;
    let nextLevelXp = 250;

    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      level += 1;
      nextLevelXp = Math.round(nextLevelXp * 1.5);
    }

    return {
      ...currentStats,
      sessionsCompleted: sorted.length,
      weeklySessionsChange: '',
      currentStreak: streak,
      streakStatus: streak > 1 ? 'Momentum active — keep it going' : (streak === 1 ? 'Streak started — come back tomorrow' : 'Ready to build momentum'),
      totalXp: totalXp,
      weeklyXpChange: `+${xpToday} XP today`,
      currentLevel: level,
      currentLevelXp: currentXp,
      nextLevelXp: nextLevelXp,
    };
  },

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
    let newLevel = currentStats.currentLevel || 1;
    let newCurrentXp = (currentStats.currentLevelXp || 0) + xpGained;
    let newNextLevelXp = currentStats.nextLevelXp || 250;

    while (newCurrentXp >= newNextLevelXp) {
      newCurrentXp -= newNextLevelXp;
      newLevel += 1;
      newNextLevelXp = Math.round(newNextLevelXp * 1.5);
    }

    const todayStr = new Date().toDateString();
    const lastActiveKey = userEmail ? `nb_last_active_${userEmail}` : 'nb_last_active';
    const xpTodayKey = userEmail ? `nb_xp_today_${userEmail}` : 'nb_xp_today';
    
    const lastActiveDate = localStorage.getItem(lastActiveKey);
    let streak = currentStats.currentStreak || 0;
    let xpToday = parseInt(localStorage.getItem(xpTodayKey) || '0', 10);

    if (lastActiveDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActiveDate === yesterday.toDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
      xpToday = 0;
      localStorage.setItem(lastActiveKey, todayStr);
    }

    xpToday += xpGained;
    localStorage.setItem(xpTodayKey, xpToday.toString());

    const updatedStats: UserStats = {
      ...currentStats,
      sessionsCompleted: (currentStats.sessionsCompleted || 0) + 1,
      weeklySessionsChange: '',
      currentStreak: streak,
      streakStatus: streak > 1 ? 'Momentum active — keep it going' : 'Ready to build momentum',
      totalXp: newTotalXp,
      weeklyXpChange: `+${xpToday} XP today`,
      currentLevel: newLevel,
      currentLevelXp: newCurrentXp,
      nextLevelXp: newNextLevelXp,
    };

    this.saveUserStats(updatedStats, userEmail);

    return { updatedStats, newSession };
  },

  getUnfinishedSessions(userEmail?: string): UnfinishedSession[] {
    const key = `nb_unfinished_sessions_${userEmail || 'guest'}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 3);
        }
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveUnfinishedSession(session: UnfinishedSession, userEmail?: string): { success: boolean; error?: string } {
    const key = `nb_unfinished_sessions_${userEmail || 'guest'}`;
    const list = this.getUnfinishedSessions(userEmail);
    const existingIndex = list.findIndex((s) => s.sessionId === session.sessionId);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...session };
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('nb_unfinished_sessions_changed'));
      return { success: true };
    }

    if (list.length >= 3) {
      return {
        success: false,
        error: 'You have 3 unfinished sessions. Finish or discard one to start another.',
      };
    }

    const updated = [session, ...list];
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nb_unfinished_sessions_changed'));
    return { success: true };
  },

  updateSessionTurns(sessionId: string, userTurns: number, userEmail?: string): void {
    const key = `nb_unfinished_sessions_${userEmail || 'guest'}`;
    const list = this.getUnfinishedSessions(userEmail);
    const item = list.find((s) => s.sessionId === sessionId);
    if (item) {
      item.userTurns = userTurns;
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('nb_unfinished_sessions_changed'));
    }
  },

  removeUnfinishedSession(sessionId: string, userEmail?: string): void {
    const key = `nb_unfinished_sessions_${userEmail || 'guest'}`;
    const list = this.getUnfinishedSessions(userEmail);
    const filtered = list.filter((s) => s.sessionId !== sessionId);
    localStorage.setItem(key, JSON.stringify(filtered));

    // Also remove single active session key if matching
    const activeKey = `nb_active_session_${userEmail || 'guest'}`;
    try {
      const activeRaw = localStorage.getItem(activeKey);
      if (activeRaw && JSON.parse(activeRaw).sessionId === sessionId) {
        localStorage.removeItem(activeKey);
      }
    } catch {
      // ignore
    }

    window.dispatchEvent(new CustomEvent('nb_unfinished_sessions_changed'));
  },

  clearUnfinishedSessions(userEmail?: string): void {
    const key = `nb_unfinished_sessions_${userEmail || 'guest'}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`nb_active_session_${userEmail || 'guest'}`);
    window.dispatchEvent(new CustomEvent('nb_unfinished_sessions_changed'));
  },
};

