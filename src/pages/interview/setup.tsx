import { useEffect, useMemo, useState } from 'react';
import { Button, message, Spin } from 'antd';
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
import { callInterviewTopics, unwrapInterviewData } from '@/utils/interview-api';
import type { IInterviewTopic } from '@/types/interview';
import { useInterviewProfile } from '@/hooks/useInterviewProfile';
import { useAppSelector } from '@/redux/hooks';

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

function groupTopics(list: IInterviewTopic[]) {
  const order: string[] = [];
  const map = new Map<string, IInterviewTopic[]>();
  for (const t of list) {
    const key = t.groupName || 'Khác';
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(t);
  }
  return order.map((label) => ({ label: label.toUpperCase(), topics: map.get(label)! }));
}

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const { config, loading: profileLoading } = useInterviewProfile(isAuthenticated);
  const initial = useMemo(() => readInitialSetup(), []);
  const [topics, setTopics] = useState<string[]>(initial.topics);
  const [questionType, setQuestionType] = useState(initial.questionType);
  const [level, setLevel] = useState(initial.level);
  const [apiTopics, setApiTopics] = useState<IInterviewTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  const maxTopics = config?.maxTopics ?? 3;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTopicsLoading(true);
      const res = await callInterviewTopics();
      const list = unwrapInterviewData(res) ?? [];
      if (!cancelled) {
        setApiTopics(list);
        setTopicsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const knowledge = useMemo(() => groupTopics(apiTopics), [apiTopics]);

  const topicTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    apiTopics.forEach((t) => m.set(t.code, t.name));
    return m;
  }, [apiTopics]);

  const toggleTopic = (id: string) => {
    setTopics((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxTopics) return prev;
      return [...prev, id];
    });
  };

  const atTopicLimit = topics.length >= maxTopics;

  const onContinue = () => {
    if (topics.length === 0) {
      message.error('Chọn ít nhất 1 chủ đề');
      return;
    }
    saveSetupSelection({ topics, difficulty: questionType, level });
    navigate('/interview/ready');
  };

  const loading = topicsLoading || profileLoading;

  return (
    <div className={`${styles.page} ${styles.pageInterview} ${styles.practicePage}`}>
      <div className={styles.container}>
        <InterviewBreadcrumb step="setup" />

        <h1 className={styles.practiceTitle}>Thiết lập tiêu chí bài test</h1>
        <p className={styles.practiceDesc}>Chọn chủ đề, level và loại câu hỏi (dữ liệu từ server).</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin size="large" />
          </div>
        ) : apiTopics.length === 0 ? (
          <p className={styles.infoLine}>Chưa có chủ đề trên server. Hãy chạy backend và seed dữ liệu.</p>
        ) : (
          <>
            <div className={styles.criteriaBar}>
              <span style={{ fontWeight: 600 }}>Tiêu chí đang chọn</span>
              <span className={styles.criteriaChip}>{formatQuestionTypeChip(questionType)}</span>
              <span className={styles.criteriaChip}>Cấp bậc {level}</span>
              {topics.map((id) => (
                <span key={id} className={styles.criteriaChip}>
                  {topicTitleMap.get(id) ?? id}
                </span>
              ))}
            </div>

            <section className={styles.setupSection}>
              <div className={styles.setupSectionHead}>
                <DesktopOutlined style={{ color: '#3f3ab3', fontSize: 20 }} />
                <h2>01 Theo kiến thức</h2>
              </div>
              <p className={styles.setupHint}>
                Chọn tối đa {maxTopics} chủ đề để đảm bảo câu hỏi không bị pha loãng
              </p>
              {knowledge.map((group) => (
                <div key={group.label} className={styles.categoryBlock}>
                  <h4>{group.label}</h4>
                  <div className={styles.topicGrid}>
                    {group.topics.map((t) => {
                      const selected = topics.includes(t.code);
                      const disabled = atTopicLimit && !selected;
                      const count = t.questionCount ?? 0;
                      return (
                        <button
                          key={t.code}
                          type="button"
                          disabled={disabled}
                          className={`${styles.topicCard} ${selected ? styles.selected : ''} ${disabled ? styles.topicDisabled : ''}`}
                          onClick={() => toggleTopic(t.code)}
                        >
                          <div className={styles.topicTitle}>{t.name}</div>
                          <div className={styles.topicCount}>
                            {count > 0 ? `${count.toLocaleString('vi-VN')} câu` : 'Đang cập nhật'}
                          </div>
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
          </>
        )}
      </div>
    </div>
  );
}
