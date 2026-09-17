export type ScenarioType =
  | 'job-interview'
  | 'talk-to-professor'
  | 'meet-someone-new'
  | 'phone-call'
  | 'group-conversation'
  | 'handle-conflict'
  | 'ask-for-help'
  | 'talk-to-manager'
  | 'set-boundary';

export interface DifficultyLevel {
  level: number;
  description: string;
  aiOpeningLine: string;
}

export interface RuleRecord {
  scenarioType: ScenarioType;
  systemPromptTemplate: string;
  difficultyLevels: DifficultyLevel[];
}

export interface SessionMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  scenarioType: ScenarioType;
  difficultyLevel: number;
  messages: SessionMessage[];
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}
