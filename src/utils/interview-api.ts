import axios from 'config/axios-customize';
import { IBackendRes } from '@/types/backend';
import type {
  IInterviewConfig,
  IInterviewMe,
  IInterviewSessionApi,
  IInterviewTopic,
} from '@/types/interview';

export const callInterviewConfig = () => {
  return axios.get<IBackendRes<IInterviewConfig>>('/api/v1/interview/config');
};

export const callInterviewTopics = () => {
  return axios.get<IBackendRes<IInterviewTopic[]>>('/api/v1/interview/topics');
};

export const callInterviewMe = () => {
  return axios.get<IBackendRes<IInterviewMe>>('/api/v1/interview/me');
};

export const callInterviewCreateSession = (body: {
  topics: string[];
  questionType: string;
  level: string;
}) => {
  return axios.post<IBackendRes<IInterviewSessionApi>>('/api/v1/interview/sessions', body);
};

export const callInterviewGetSession = (id: string) => {
  return axios.get<IBackendRes<IInterviewSessionApi>>(`/api/v1/interview/sessions/${id}`);
};

export const callInterviewSaveAnswers = (
  id: string,
  answers: { orderIndex: number; selectedIndex: number | null }[],
) => {
  return axios.put<IBackendRes<IInterviewSessionApi>>(`/api/v1/interview/sessions/${id}/answers`, {
    answers,
  });
};

export const callInterviewSubmitSession = (id: string) => {
  return axios.post<IBackendRes<IInterviewSessionApi>>(`/api/v1/interview/sessions/${id}/submit`);
};

export function unwrapInterviewData<T>(res: IBackendRes<T> | undefined): T | undefined {
  if (!res || res.error || res.data === undefined) return undefined;
  return res.data;
}

export function interviewApiError(res: IBackendRes<unknown> | undefined): string {
  if (!res) return 'Không kết nối được server';
  if (typeof res.error === 'string') return res.error;
  if (Array.isArray(res.error)) return res.error.join(', ');
  return res.message || 'Có lỗi xảy ra';
}
