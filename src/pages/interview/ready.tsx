import { Button, Checkbox, message, Spin } from 'antd';
import { PlayCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '@/styles/interview.module.scss';
import InterviewBreadcrumb from '@/components/client/interview/interview-breadcrumb';
import { loadSetupSelection } from '@/utils/interview-storage';
import {
  examSessionFromApi,
  saveExamSession,
} from '@/utils/interview-exam-session';
import { useAppSelector } from '@/redux/hooks';
import { useMemo, useState } from 'react';
import {
  formatQuestionTypeChip,
  INTERVIEW_TOPIC_TITLES,
} from '@/utils/interview-setup-options';
import { useInterviewProfile } from '@/hooks/useInterviewProfile';
import {
  callInterviewCreateSession,
  interviewApiError,
  unwrapInterviewData,
} from '@/utils/interview-api';

export default function InterviewReadyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = useAppSelector((s) => s.account.user?.email);
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const { config, loading: loadingMeta, freeLeft, freeTotal, proActive } =
    useInterviewProfile(isAuthenticated);
  const setup = useMemo(() => loadSetupSelection(), [location.key]);
  const [hideCorrect, setHideCorrect] = useState(false);
  const [starting, setStarting] = useState(false);

  const remaining = freeLeft;
  const questionCount = proActive
    ? (config?.proQuestionsPerSession ?? 30)
    : (config?.freeQuestionsPerSession ?? 10);
  const durationMin = config?.durationMinutes ?? 45;
  const passPercent = config?.passPercent ?? 80;

  const topicLabels = useMemo(
    () => setup?.topics?.map((id) => INTERVIEW_TOPIC_TITLES[id] ?? id) ?? [],
    [setup],
  );

  if (!setup?.topics?.length) {
    navigate('/interview/setup', { replace: true });
    return null;
  }

  const startExam = async () => {
    if (!email) return;
    const freshSetup = loadSetupSelection();
    if (!freshSetup?.topics?.length) {
      message.error('Chọn lại tiêu chí bài test');
      navigate('/interview/setup');
      return;
    }
    if (!proActive && remaining <= 0) {
      message.error(`Đã hết ${freeTotal} lượt Free`);
      navigate('/interview#pricing');
      return;
    }
    setStarting(true);
    const res = await callInterviewCreateSession({
      topics: freshSetup.topics,
      questionType: freshSetup.difficulty,
      level: freshSetup.level,
    });
    const dto = unwrapInterviewData(res);
    if (!dto) {
      message.error(interviewApiError(res));
      setStarting(false);
      return;
    }
    const session = examSessionFromApi(dto, passPercent);
    saveExamSession(session);
    setStarting(false);
    navigate('/interview/exam');
  };

  return (
    <div className={`${styles.page} ${styles.pageInterview} ${styles.practicePage}`}>
      <div className={styles.container}>
        <InterviewBreadcrumb step="ready" />

        <h1 className={styles.practiceTitle}>Sẵn sàng làm bài?</h1>
        <p className={styles.practiceDesc}>Thời gian tính từ lúc nhấn bắt đầu làm bài.</p>

        {loadingMeta ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <>
            <div className={styles.criteriaBar}>
              <span style={{ fontWeight: 600 }}>Tiêu chí đang chọn</span>
              {topicLabels.map((t) => (
                <span key={t} className={styles.criteriaChip}>{t}</span>
              ))}
              <span className={styles.criteriaChip}>{formatQuestionTypeChip(setup.difficulty)}</span>
              <span className={styles.criteriaChip}>Cấp bậc {setup.level}</span>
              <div style={{ marginLeft: 'auto' }}>
                <Checkbox checked={hideCorrect} onChange={(e) => setHideCorrect(e.target.checked)}>
                  Ẩn câu đã trả lời đúng
                </Checkbox>
              </div>
            </div>

            <section className={styles.setupSection}>
              <div className={styles.setupSectionHead}>
                <span className={styles.sectionNum}>01</span>
                <h2>Thông số bài test</h2>
              </div>
              <div className={styles.paramGrid}>
                <div className={styles.paramCard}>
                  <div className={styles.paramLabel}>Số câu</div>
                  <div className={styles.paramValue}>{questionCount}</div>
                </div>
                <div className={styles.paramCard}>
                  <div className={styles.paramLabel}>Thời gian</div>
                  <div className={styles.paramValue}>{durationMin} phút</div>
                </div>
                <div className={styles.paramCard}>
                  <div className={styles.paramLabel}>Ngưỡng đạt</div>
                  <div className={styles.paramValue}>{passPercent}%</div>
                </div>
              </div>
            </section>

            <section className={styles.setupSection}>
              <div className={styles.setupSectionHead}>
                <span className={styles.sectionNum}>02</span>
                <h2>Lượt làm bài</h2>
              </div>
              <p className={styles.infoLine}>
                {proActive ? (
                  <>Gói <strong>Pro</strong> — không giới hạn lượt trong kỳ hiệu lực.</>
                ) : (
                  <>
                    Bài này trừ <strong>1 lượt Free</strong> (còn {remaining}/{freeTotal} lượt).
                  </>
                )}
                {' '}Sau khi nộp: xem điểm và đáp án từng câu.
              </p>
            </section>

            <div className={styles.setupFooter}>
              <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate('/interview/setup')}>
                Đổi lựa chọn
              </Button>
              <Button
                type="primary"
                size="large"
                className={styles.btnPrimary}
                icon={<PlayCircleOutlined />}
                loading={starting}
                onClick={startExam}
              >
                Bắt đầu làm bài
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
