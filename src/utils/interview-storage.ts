const VERSION_KEY = 'jobgohunter_interview_free_version';
const VERSION = '5';

/** Số lượt luyện miễn phí (gói Free) */
export const FREE_INTERVIEW_SESSIONS = 5;

function remainingKey(email: string) {
  return `jobgohunter_interview_free_${email.toLowerCase()}`;
}

function usedKey(email: string) {
  return `jobgohunter_interview_used_${email.toLowerCase()}`;
}

function ensureVersion(email: string) {
  const v = localStorage.getItem(VERSION_KEY);
  if (v !== VERSION) {
    localStorage.setItem(remainingKey(email), String(FREE_INTERVIEW_SESSIONS));
    localStorage.setItem(VERSION_KEY, VERSION);
  }
}

export function getFreeRemaining(email: string | undefined): number {
  if (!email) return FREE_INTERVIEW_SESSIONS;
  ensureVersion(email);
  const raw = localStorage.getItem(remainingKey(email));
  if (raw === null) {
    localStorage.setItem(remainingKey(email), String(FREE_INTERVIEW_SESSIONS));
    return FREE_INTERVIEW_SESSIONS;
  }
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? FREE_INTERVIEW_SESSIONS : Math.max(0, n);
}

export function getFreeUsed(email: string): number {
  return FREE_INTERVIEW_SESSIONS - getFreeRemaining(email);
}

export function consumeFreeSession(email: string): boolean {
  const left = getFreeRemaining(email);
  if (left <= 0) return false;
  localStorage.setItem(remainingKey(email), String(left - 1));
  localStorage.setItem(usedKey(email), String(getFreeUsed(email) + 1));
  return true;
}

export function hasFreeSessionsLeft(email: string | undefined): boolean {
  if (!email) return false;
  return getFreeRemaining(email) > 0;
}

export const SETUP_STORAGE_KEY = 'jobgohunter_interview_setup';

export interface InterviewSetupSelection {
  topics: string[];
  difficulty: string;
  level: string;
}

export function saveSetupSelection(data: InterviewSetupSelection) {
  localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(data));
}

export function loadSetupSelection(): InterviewSetupSelection | null {
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InterviewSetupSelection) : null;
  } catch {
    return null;
  }
}
