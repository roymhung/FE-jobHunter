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
  freeSessionsUsed?: number;
  recentSessions: {
    sessionId: string;
    submittedAt?: string;
    scorePercent?: number;
    passed: boolean;
  }[];
  pendingOrder?: IInterviewPendingOrder | null;
}

export type InterviewPlanCode = 'PRO_YEAR' | 'PRO_LIFETIME';
export type InterviewOrderStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED';
export type InterviewPaymentMethod = 'BANK_TRANSFER' | 'VNPAY';

export interface IInterviewPendingOrder {
  id: number;
  planCode: InterviewPlanCode;
  status: InterviewOrderStatus;
  transferSubmitted: boolean;
  paymentMethod?: InterviewPaymentMethod | null;
}

export interface IInterviewOrder {
  id: number;
  planCode: InterviewPlanCode;
  status: InterviewOrderStatus;
  amountVnd: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  transferContent: string;
  createdAt?: string;
  transferSubmittedAt?: string | null;
  userId?: number;
  userEmail?: string;
  paymentMethod?: InterviewPaymentMethod | null;
  paidAt?: string | null;
  vnpayEnabled?: boolean;
}

export interface IVnpayPayment {
  orderId: number;
  payUrl: string;
  txnRef: string;
}

export interface IInterviewQuestionAdmin {
  id: number;
  topicCode: string;
  questionType: string;
  level: string;
  content: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  active?: boolean;
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
