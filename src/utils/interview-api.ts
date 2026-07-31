import axios from 'config/axios-customize';
import { IBackendRes, IModelPaginate } from '@/types/backend';
import type {
  IInterviewConfig,
  IInterviewMe,
  IVnpayPayment,
  IInterviewOrder,
  IInterviewQuestionAdmin,
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

export const callInterviewCreateOrder = (plan: 'year' | 'lifetime') => {
  return axios.post<IBackendRes<IInterviewOrder>>('/api/v1/interview/subscriptions/orders', { plan });
};

export const callInterviewTransferSubmitted = (orderId: number) => {
  return axios.post<IBackendRes<IInterviewOrder>>(
    `/api/v1/interview/subscriptions/orders/${orderId}/transfer-submitted`,
  );
};

export const callInterviewInitiateVnpay = (orderId: number) => {
  return axios.post<IBackendRes<IVnpayPayment>>(
    `/api/v1/interview/subscriptions/orders/${orderId}/vnpay`,
  );
};

export const callInterviewGetOrder = (orderId: number) => {
  return axios.get<IBackendRes<IInterviewOrder>>(`/api/v1/interview/subscriptions/orders/${orderId}`);
};

export const callInterviewListPendingOrders = () => {
  return axios.get<IBackendRes<IInterviewOrder[]>>('/api/v1/interview/subscriptions/orders/pending');
};

export const callInterviewActivateOrder = (orderId: number) => {
  return axios.post<IBackendRes<IInterviewOrder>>(
    `/api/v1/interview/subscriptions/orders/${orderId}/activate`,
  );
};

export type InterviewQuestionUpsertBody = {
  topicCode: string;
  questionType: string;
  level: string;
  content: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  active?: boolean;
};

export const callInterviewAdminListQuestions = (params: {
  topicCode?: string;
  page?: number;
  size?: number;
}) => {
  const q = new URLSearchParams();
  if (params.topicCode) q.set('topicCode', params.topicCode);
  q.set('page', String(params.page ?? 0));
  q.set('size', String(params.size ?? 10));
  return axios.get<IBackendRes<IModelPaginate<IInterviewQuestionAdmin>>>(
    `/api/v1/interview/admin/questions?${q.toString()}`,
  );
};

export const callInterviewAdminCreateQuestion = (body: InterviewQuestionUpsertBody) => {
  return axios.post<IBackendRes<IInterviewQuestionAdmin>>('/api/v1/interview/admin/questions', body);
};

export const callInterviewAdminUpdateQuestion = (id: number, body: InterviewQuestionUpsertBody) => {
  return axios.put<IBackendRes<IInterviewQuestionAdmin>>(`/api/v1/interview/admin/questions/${id}`, body);
};

export const callInterviewAdminDeleteQuestion = (id: number) => {
  return axios.delete<IBackendRes<unknown>>(`/api/v1/interview/admin/questions/${id}`);
};

export function formatVnd(amount: number) {
  return amount.toLocaleString('vi-VN');
}

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
