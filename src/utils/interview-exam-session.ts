import { InterviewQuestion, pickExamQuestions, EXAM_DURATION_SEC } from './interview-questions';
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
}

export function createExamSession(setup: InterviewSetupSelection): ExamSession {
  const questions = pickExamQuestions(setup.topics);
  const now = Date.now();
  const session: ExamSession = {
    id: `exam-${now}`,
    setup,
    questions,
    answers: Array(questions.length).fill(null),
    startedAt: now,
    endsAt: now + EXAM_DURATION_SEC * 1000,
    submitted: false,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
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
