import type { IInterviewSessionApi } from '@/types/interview';
import type { InterviewQuestion } from './interview-questions';
import type { InterviewSetupSelection } from './interview-storage';

const SESSION_KEY = 'jobgohunter_interview_exam_session';

export interface ExamSession {
  id: string;
  setup: InterviewSetupSelection;
  questions: InterviewQuestion[];
  answers: (number | null)[];
  startedAt: number;
  endsAt: number;
  submitted: boolean;
  submittedAt?: number;
  /** Phiên tạo từ backend */
  apiBacked?: boolean;
  scorePercent?: number;
  passPercent?: number;
}

export function examSessionFromApi(dto: IInterviewSessionApi, passPercent?: number): ExamSession {
  const questions: InterviewQuestion[] = dto.questions
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((q) => ({
      id: String(q.questionId),
      topic: q.topicCode,
      text: q.content,
      options: q.options ?? [],
      correctIndex: q.correctIndex ?? -1,
      explanation: q.explanation ?? '',
    }));

  const answers = dto.questions
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((q) => (q.selectedIndex != null ? q.selectedIndex : null));

  return {
    id: dto.id,
    setup: {
      topics: dto.topics ?? [],
      difficulty: dto.questionType,
      level: dto.level,
    },
    questions,
    answers,
    startedAt: Date.parse(dto.startedAt),
    endsAt: Date.parse(dto.endsAt),
    submitted: dto.status === 'SUBMITTED',
    submittedAt: dto.submittedAt ? Date.parse(dto.submittedAt) : undefined,
    apiBacked: true,
    scorePercent: dto.scorePercent ?? undefined,
    passPercent,
  };
}

export function buildAnswersPayload(session: ExamSession) {
  return session.questions.map((_, orderIndex) => ({
    orderIndex,
    selectedIndex: session.answers[orderIndex],
  }));
}

export function getExamSession(): ExamSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExamSession;
  } catch {
    return null;
  }
}

export function saveExamSession(session: ExamSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearExamSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function countAnswered(session: ExamSession) {
  return session.answers.filter((a) => a !== null).length;
}

export function gradeSession(session: ExamSession) {
  if (session.submitted && session.scorePercent != null && session.apiBacked) {
    const total = session.questions.length;
    let correct = 0;
    let unanswered = 0;
    session.questions.forEach((q, i) => {
      const a = session.answers[i];
      if (a === null) unanswered++;
      else if (q.correctIndex >= 0 && a === q.correctIndex) correct++;
    });
    const wrong = total - correct - unanswered;
    return {
      correct,
      wrong,
      unanswered,
      total,
      percent: session.scorePercent,
    };
  }
  let correct = 0;
  let unanswered = 0;
  session.questions.forEach((q, i) => {
    const a = session.answers[i];
    if (a === null) unanswered++;
    else if (a === q.correctIndex) correct++;
  });
  const total = session.questions.length;
  const wrong = total - correct - unanswered;
  const percent = Math.round((correct / total) * 100);
  return { correct, wrong, unanswered, total, percent };
}
