export const QUESTION_TYPES = ['Lý thuyết', 'Thực hành', 'Hệ thống', 'Tình huống'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const CAREER_LEVELS = ['Fresher', 'Junior', 'Middle', 'Senior', 'Expert'] as const;
export type CareerLevel = (typeof CAREER_LEVELS)[number];

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'Lý thuyết': 'Bộ câu hỏi lý thuyết',
  'Thực hành': 'Bộ câu hỏi thực hành',
  'Hệ thống': 'Bộ câu hỏi hệ thống',
  'Tình huống': 'Bộ câu hỏi tình huống',
};

export function formatQuestionTypeChip(type: string): string {
  if (type in QUESTION_TYPE_LABELS) {
    return QUESTION_TYPE_LABELS[type as QuestionType];
  }
  return `Bộ câu hỏi ${type.toLowerCase()}`;
}

export function normalizeQuestionType(value: string | undefined): QuestionType {
  if (value && QUESTION_TYPES.includes(value as QuestionType)) {
    return value as QuestionType;
  }
  return 'Lý thuyết';
}

export function normalizeCareerLevel(value: string | undefined): CareerLevel {
  if (value && CAREER_LEVELS.includes(value as CareerLevel)) {
    return value as CareerLevel;
  }
  return 'Junior';
}

/** id chủ đề trên trang setup → tên hiển thị */
export const INTERVIEW_TOPIC_TITLES: Record<string, string> = {
  java: 'Java',
  networking: 'Networking',
  git: 'Git',
  linux: 'Linux',
  spring: 'Spring Boot',
  security: 'Security',
  testing: 'Testing',
  api: 'API Design',
  pattern: 'Design Pattern',
  ddd: 'DDD',
  micro: 'Microservices',
  sysdesign: 'System Design',
  sql: 'SQL',
  nosql: 'NoSQL',
  redis: 'Redis',
  messaging: 'Messaging',
  docker: 'Docker',
  k8s: 'Kubernetes',
  aws: 'AWS',
  cicd: 'CI/CD',
  monitor: 'Monitoring',
  nginx: 'Nginx',
};

export function formatTopicLabels(topicIds: string[]): string {
  return topicIds.map((id) => INTERVIEW_TOPIC_TITLES[id] ?? id).join(' · ');
}
