import { Button, Checkbox, message } from 'antd';
import { PlayCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '@/styles/interview.module.scss';
import InterviewBreadcrumb from '@/components/client/interview/interview-breadcrumb';
import {
  FREE_INTERVIEW_SESSIONS,
  consumeFreeSession,
  getFreeRemaining,
  hasFreeSessionsLeft,
  loadSetupSelection,
} from '@/utils/interview-storage';
import { createExamSession } from '@/utils/interview-exam-session';
import { EXAM_PASS_PERCENT, EXAM_QUESTION_COUNT, EXAM_DURATION_SEC } from '@/utils/interview-questions';
import { useAppSelector } from '@/redux/hooks';
import { useMemo, useState } from 'react';
import {
  formatQuestionTypeChip,
  INTERVIEW_TOPIC_TITLES,
} from '@/utils/interview-setup-options';

export default function InterviewReadyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = useAppSelector((s) => s.account.user?.email);
  const setup = useMemo(() => loadSetupSelection(), [location.key]);
  const [hideCorrect, setHideCorrect] = useState(false);

  const remaining = getFreeRemaining(email);

  const topicLabels = useMemo(
    () => setup?.topics?.map((id) => INTERVIEW_TOPIC_TITLES[id] ?? id) ?? [],
    [setup]
  );

  if (!setup?.topics?.length) {
    navigate('/interview/setup', { replace: true });
    return null;
  }

  const startExam = () => {
    if (!email) return;
    const freshSetup = loadSetupSelection();
    if (!freshSetup?.topics?.length) {
      message.error('Chọn lại tiêu chí bài test');
      navigate('/interview/setup');
      return;
    }
    if (!hasFreeSessionsLeft(email)) {
      message.error(`Đã hết ${FREE_INTERVIEW_SESSIONS} lượt Free`);
      navigate('/interview#pricing');
      return;
    }
    if (!consumeFreeSession(email)) {
      message.error('Không thể trừ lượt. Vui lòng thử lại.');
      return;
    }
    createExamSession(freshSetup);
    navigate('/interview/exam');
  };

  return (
    <div className={`${styles.page} ${styles.pageInterview} ${styles.practicePage}`}>
      <div className={styles.container}>
        <InterviewBreadcrumb step="ready" />

        <h1 className={styles.practiceTitle}>Sẵn sàng làm bài?</h1>
        <p className={styles.practiceDesc}>Thời gian tính từ lúc nhấn bắt đầu làm bài.</p>

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
              <div className={styles.paramValue}>{EXAM_QUESTION_COUNT}</div>
            </div>
            <div className={styles.paramCard}>
              <div className={styles.paramLabel}>Thời gian</div>
              <div className={styles.paramValue}>{EXAM_DURATION_SEC / 60} phút</div>
            </div>
            <div className={styles.paramCard}>
              <div className={styles.paramLabel}>Ngưỡng đạt</div>
              <div className={styles.paramValue}>{EXAM_PASS_PERCENT}%</div>
            </div>
          </div>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.setupSectionHead}>
            <span className={styles.sectionNum}>02</span>
            <h2>Lượt làm bài</h2>
          </div>
          <p className={styles.infoLine}>
            Bài này trừ <strong>1 lượt Free</strong> (còn {remaining}/{FREE_INTERVIEW_SESSIONS} lượt).
            Sau khi nộp: xem điểm và đáp án từng câu.
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
            onClick={startExam}
          >
            Bắt đầu làm bài
          </Button>
        </div>
      </div>
    </div>
  );
}
