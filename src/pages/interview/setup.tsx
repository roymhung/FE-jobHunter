import { useMemo, useState } from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DesktopOutlined,
  BarChartOutlined,
  CodeOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import styles from '@/styles/interview.module.scss';
import InterviewBreadcrumb from '@/components/client/interview/interview-breadcrumb';
import { saveSetupSelection, loadSetupSelection } from '@/utils/interview-storage';
import {
  CAREER_LEVELS,
  QUESTION_TYPES,
  formatQuestionTypeChip,
  normalizeCareerLevel,
  normalizeQuestionType,
} from '@/utils/interview-setup-options';

type Topic = { id: string; title: string; count: number };

const KNOWLEDGE: { label: string; topics: Topic[] }[] = [
  {
    label: 'NỀN TẢNG',
    topics: [
      { id: 'java', title: 'Java', count: 1174 },
      { id: 'networking', title: 'Networking', count: 312 },
      { id: 'git', title: 'Git', count: 186 },
      { id: 'linux', title: 'Linux', count: 245 },
    ],
  },
  {
    label: 'BACKEND',
    topics: [
      { id: 'spring', title: 'Spring Boot', count: 892 },
      { id: 'security', title: 'Security', count: 421 },
      { id: 'testing', title: 'Testing', count: 298 },
      { id: 'api', title: 'API Design', count: 356 },
    ],
  },
  {
    label: 'KIẾN TRÚC',
    topics: [
      { id: 'pattern', title: 'Design Pattern', count: 534 },
      { id: 'ddd', title: 'DDD', count: 187 },
      { id: 'micro', title: 'Microservices', count: 412 },
      { id: 'sysdesign', title: 'System Design', count: 623 },
    ],
  },
  {
    label: 'DỮ LIỆU',
    topics: [
      { id: 'sql', title: 'SQL', count: 445 },
      { id: 'nosql', title: 'NoSQL', count: 278 },
      { id: 'redis', title: 'Redis', count: 198 },
      { id: 'messaging', title: 'Messaging', count: 156 },
    ],
  },
  {
    label: 'DEVOPS & CLOUD',
    topics: [
      { id: 'docker', title: 'Docker', count: 367 },
      { id: 'k8s', title: 'Kubernetes', count: 289 },
      { id: 'aws', title: 'AWS', count: 512 },
      { id: 'cicd', title: 'CI/CD', count: 234 },
      { id: 'monitor', title: 'Monitoring', count: 167 },
      { id: 'nginx', title: 'Nginx', count: 143 },
    ],
  },
];

const DIFFICULTIES = QUESTION_TYPES;
const LEVELS = [...CAREER_LEVELS];

function readInitialSetup() {
  const saved = loadSetupSelection();
  return {
    topics: saved?.topics?.length ? saved.topics : [],
    questionType: normalizeQuestionType(saved?.difficulty),
    level: normalizeCareerLevel(saved?.level),
  };
}

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const initial = useMemo(() => readInitialSetup(), []);
  const [topics, setTopics] = useState<string[]>(initial.topics);
  const [questionType, setQuestionType] = useState(initial.questionType);
  const [level, setLevel] = useState(initial.level);

  const topicTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    KNOWLEDGE.forEach((g) => g.topics.forEach((t) => m.set(t.id, t.title)));
    return m;
  }, []);

  const toggleTopic = (id: string) => {
    setTopics((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const atTopicLimit = topics.length >= 3;

  const onContinue = () => {
    if (topics.length === 0) {
      message.error('Chọn ít nhất 1 chủ đề');
      return;
    }
    saveSetupSelection({ topics, difficulty: questionType, level });
    navigate('/interview/ready');
  };

  return (
    <div className={`${styles.page} ${styles.pageInterview} ${styles.practicePage}`}>
      <div className={styles.container}>
        <InterviewBreadcrumb step="setup" />

        <h1 className={styles.practiceTitle}>Thiết lập tiêu chí bài test</h1>
        <p className={styles.practiceDesc}>Chọn chủ đề, level và độ khó cho bài test.</p>

        <div className={styles.criteriaBar}>
          <span style={{ fontWeight: 600 }}>Tiêu chí đang chọn</span>
          <span className={styles.criteriaChip}>{formatQuestionTypeChip(questionType)}</span>
          <span className={styles.criteriaChip}>Cấp bậc {level}</span>
          {topics.map((id) => (
            <span key={id} className={styles.criteriaChip}>
              {topicTitleMap.get(id)}
            </span>
          ))}
        </div>

        <section className={styles.setupSection}>
          <div className={styles.setupSectionHead}>
            <DesktopOutlined style={{ color: '#3f3ab3', fontSize: 20 }} />
            <h2>01 Theo kiến thức</h2>
          </div>
          <p className={styles.setupHint}>
            Chọn tối đa 3 chủ đề để đảm bảo câu hỏi không bị pha loãng
          </p>
          {KNOWLEDGE.map((group) => (
            <div key={group.label} className={styles.categoryBlock}>
              <h4>{group.label}</h4>
              <div className={styles.topicGrid}>
                {group.topics.map((t) => {
                  const selected = topics.includes(t.id);
                  const disabled = atTopicLimit && !selected;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={disabled}
                      className={`${styles.topicCard} ${selected ? styles.selected : ''} ${disabled ? styles.topicDisabled : ''}`}
                      onClick={() => toggleTopic(t.id)}
                    >
                      <div className={styles.topicTitle}>{t.title}</div>
                      <div className={styles.topicCount}>{t.count.toLocaleString('vi-VN')} câu</div>
                      {selected && (
                        <span className={styles.checkMark}>
                          <CheckOutlined />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className={styles.setupSection}>
          <div className={styles.setupSectionHead}>
            <BarChartOutlined style={{ color: '#3f3ab3', fontSize: 20 }} />
            <h2>02 Loại câu hỏi</h2>
          </div>
          <div className={styles.optionRow}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={questionType === d}
                className={`${styles.optionCard} ${questionType === d ? styles.selected : ''}`}
                onClick={() => setQuestionType(d)}
              >
                {d}
                {questionType === d && (
                  <span className={styles.checkMark}>
                    <CheckOutlined />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.setupSectionHead}>
            <CodeOutlined style={{ color: '#3f3ab3', fontSize: 20 }} />
            <h2>03 Cấp bậc</h2>
          </div>
          <div className={styles.optionRow}>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={level === l}
                className={`${styles.optionCard} ${level === l ? styles.selected : ''}`}
                onClick={() => setLevel(l)}
              >
                {l}
                {level === l && (
                  <span className={styles.checkMark}>
                    <CheckOutlined />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.setupFooter}>
          <Button size="large" onClick={() => navigate('/interview/practice')}>
            Quay lại
          </Button>
          <Button
            type="primary"
            size="large"
            className={styles.btnPrimary}
            icon={<ArrowRightOutlined />}
            onClick={onContinue}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}
