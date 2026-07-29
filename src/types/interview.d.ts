export interface IInterviewConfig {
  freeSessions: number;
  freeQuestionsPerSession: number;
  proQuestionsPerSession: number;
  durationMinutes: number;
  passPercent: number;
  maxTopics: number;
}

export interface IInterviewTopic {
  code: string;
  name: string;
  groupName: string;
  questionCount?: number;
}

export interface IInterviewMe {
  proActive: boolean;
  freeSessionsLeft: number;
  freeSessionsTotal: number;
  recentSessions: {
    sessionId: string;
    submittedAt?: string;
    scorePercent?: number;
    passed: boolean;
  }[];
}

export interface IInterviewQuestionApi {
  orderIndex: number;
  questionId: number;
  topicCode: string;
  content: string;
  options: string[];
  selectedIndex?: number | null;
  correctIndex?: number | null;
  explanation?: string | null;
}

export type InterviewSessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface IInterviewSessionApi {
  id: string;
  status: InterviewSessionStatus;
  topics: string[];
  questionType: string;
  level: string;
  startedAt: string;
  endsAt: string;
  submittedAt?: string | null;
  scorePercent?: number | null;
  passed: boolean;
  questions: IInterviewQuestionApi[];
}
