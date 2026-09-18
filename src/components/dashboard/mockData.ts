import type { ScenarioItem, SessionSummary, UserStats } from './types';

export const mockUserStats: UserStats = {
  sessionsCompleted: 12,
  weeklySessionsChange: '+3 this week',
  currentStreak: 5,
  streakStatus: 'Keep it going!',
  totalXp: 1240,
  weeklyXpChange: '+180 this week',
  currentLevel: 4,
  currentLevelXp: 320,
  nextLevelXp: 500,
};

export const mockScenarios: ScenarioItem[] = [
  {
    id: 'sc-1',
    scenarioType: 'job-interview',
    title: 'Job Interview',
    description: 'Practice structured questions, salary framing, and pacing under calm AI feedback.',
    difficulty: 'Beginner',
    icon: 'interview',
    isFeatured: true,
    duration: '10–12 min',
    tagline: 'Recommended for you today',
  },
  {
    id: 'sc-3',
    scenarioType: 'set-boundary',
    title: 'Setting Boundaries',
    description: 'Communicate limits and personal capacity clearly without unnecessary apologies.',
    difficulty: 'Intermediate',
    icon: 'boundary',
    duration: '8 min',
  },
  {
    id: 'sc-2',
    scenarioType: 'handle-conflict',
    title: 'Workplace Conflict',
    description: 'De-escalate tension and express differing viewpoints respectfully.',
    difficulty: 'Intermediate',
    icon: 'conflict',
    duration: '10 min',
  },
  {
    id: 'sc-4',
    scenarioType: 'talk-to-manager',
    title: 'Asking for a Raise',
    description: 'Frame your demonstrated impact, tangible value, and negotiate with quiet poise.',
    difficulty: 'Advanced',
    icon: 'raise',
    duration: '12 min',
  },
  {
    id: 'sc-5',
    scenarioType: 'meet-someone-new',
    title: 'Custom Scenario',
    description: 'Design a bespoke prompt for an upcoming difficult conversation.',
    difficulty: 'Beginner',
    icon: 'custom',
    duration: 'Flexible',
  },
];

export const mockRecentSessions: SessionSummary[] = [
  {
    sessionId: 'sess-001',
    userId: 'user-krishna',
    scenarioType: 'job-interview',
    scenarioTitle: 'Job Interview',
    difficultyLevel: 1,
    formattedDate: 'Jul 21, 2025 • 7:42 PM',
    score: 8.5,
    maxScore: 10,
    feedback: 'Great confidence and clear answers!',
    status: 'completed',
    createdAt: '2025-07-21T19:42:00Z',
  },
  {
    sessionId: 'sess-002',
    userId: 'user-krishna',
    scenarioType: 'handle-conflict',
    scenarioTitle: 'Workplace Conflict',
    difficultyLevel: 2,
    formattedDate: 'Jul 20, 2025 • 5:16 PM',
    score: 7.8,
    maxScore: 10,
    feedback: 'Good points, try to be more assertive.',
    status: 'completed',
    createdAt: '2025-07-20T17:16:00Z',
  },
  {
    sessionId: 'sess-003',
    userId: 'user-krishna',
    scenarioType: 'set-boundary',
    scenarioTitle: 'Setting Boundaries',
    difficultyLevel: 2,
    formattedDate: 'Jul 19, 2025 • 8:33 PM',
    score: 9.2,
    maxScore: 10,
    feedback: 'Excellent! Very natural response.',
    status: 'completed',
    createdAt: '2025-07-19T20:33:00Z',
  },
  {
    sessionId: 'sess-004',
    userId: 'user-krishna',
    scenarioType: 'talk-to-manager',
    scenarioTitle: 'Asking for a Raise',
    difficultyLevel: 3,
    formattedDate: 'Jul 17, 2025 • 6:21 PM',
    score: 7.1,
    maxScore: 10,
    feedback: 'Solid structure, work on your closing.',
    status: 'completed',
    createdAt: '2025-07-17T18:21:00Z',
  },
  {
    sessionId: 'sess-005',
    userId: 'user-krishna',
    scenarioType: 'meet-someone-new',
    scenarioTitle: 'Custom Scenario',
    difficultyLevel: 1,
    formattedDate: 'Jul 15, 2025 • 4:03 PM',
    score: 8.9,
    maxScore: 10,
    feedback: 'Well handled! Great composure.',
    status: 'completed',
    createdAt: '2025-07-15T16:03:00Z',
  },
];

/**
 * Placeholder async helper that can be connected to real API Gateway endpoints:
 * e.g. GET ${import.meta.env.VITE_API_GATEWAY_URL}/sessions
 */
export async function getDashboardData(): Promise<{
  stats: UserStats;
  scenarios: ScenarioItem[];
  recentSessions: SessionSummary[];
}> {
  // Can be plugged into fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/sessions`)
  return Promise.resolve({
    stats: mockUserStats,
    scenarios: mockScenarios,
    recentSessions: mockRecentSessions,
  });
}
