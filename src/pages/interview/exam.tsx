import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, Radio, message } from 'antd';
import {
  ClockCircleOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/interview.module.scss';
import InterviewBreadcrumb from '@/components/client/interview/interview-breadcrumb';
import {
  formatQuestionTypeChip,
  formatTopicLabels,
} from '@/utils/interview-setup-options';
import {
  callInterviewSaveAnswers,
  callInterviewSubmitSession,
  interviewApiError,
  unwrapInterviewData,
} from '@/utils/interview-api';
import {
  buildAnswersPayload,
  countAnswered,
  examSessionFromApi,
  getExamSession,
  saveExamSession,
  type ExamSession,
} from '@/utils/interview-exam-session';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getRemainingSec(s: ExamSession) {
  return Math.max(0, Math.floor((s.endsAt - Date.now()) / 1000));
}

export default function InterviewExamPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ExamSession | null>(() => getExamSession());
  const [current, setCurrent] = useState(0);
  const [remainingSec, setRemainingSec] = useState(() => {
    const s = getExamSession();
    return s ? getRemainingSec(s) : 0;
  });
  const [submitModal, setSubmitModal] = useState<'none' | 'confirm'>('none');
  const autoSubmittedRef = useRef(false);
  const timerSyncedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      message.info('Hãy bắt đầu bài từ trang sẵn sàng làm bài');
      navigate('/interview/ready', { replace: true });
      return;
    }
    if (session.submitted) {
      navigate('/interview/result', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session) return;
    timerSyncedRef.current = false;
    const tick = () => {
      const left = getRemainingSec(session);
      setRemainingSec(left);
      timerSyncedRef.current = true;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  const answered = session ? countAnswered(session) : 0;
  const total = session?.questions.length ?? 30;
  const allAnswered = answered === total;

  const persist = useCallback((next: ExamSession) => {
    setSession(next);
    saveExamSession(next);
    if (next.apiBacked) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const res = await callInterviewSaveAnswers(next.id, buildAnswersPayload(next));
        const dto = unwrapInterviewData(res);
        if (dto) {
          const synced = examSessionFromApi(dto, next.passPercent);
          saveExamSession(synced);
          setSession((cur) => (cur?.id === synced.id ? synced : cur));
        }
      }, 400);
    }
  }, []);

  const selectAnswer = (optionIndex: number) => {
    if (!session) return;
    const answers = [...session.answers];
    answers[current] = optionIndex;
    persist({ ...session, answers });
  };

  const onSubmitClick = () => {
    if (!session) return;
    setSubmitModal('confirm');
  };

  const finalizeSubmit = useCallback(async () => {
    if (!session) return;
    setSubmitting(true);
    if (session.apiBacked) {
      await callInterviewSaveAnswers(session.id, buildAnswersPayload(session));
      const res = await callInterviewSubmitSession(session.id);
      const dto = unwrapInterviewData(res);
      if (!dto) {
        message.error(interviewApiError(res));
        setSubmitting(false);
        return;
      }
      const submitted = examSessionFromApi(dto, session.passPercent);
      saveExamSession(submitted);
      setSubmitModal('none');
      setSubmitting(false);
      navigate('/interview/result');
      return;
    }
    const submitted: ExamSession = {
      ...session,
      submitted: true,
      submittedAt: Date.now(),
    };
    saveExamSession(submitted);
    setSubmitModal('none');
    setSubmitting(false);
    navigate('/interview/result');
  }, [session, navigate]);

  useEffect(() => {
    if (!session || session.submitted) return;
    if (!timerSyncedRef.current) return;
    if (remainingSec > 0) return;
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    message.warning('Hết giờ — hệ thống đang nộp bài');
    finalizeSubmit();
  }, [remainingSec, session, finalizeSubmit]);

  const tags = useMemo(() => {
    if (!session) return '';
    const topics = formatTopicLabels(session.setup.topics);
    const type = formatQuestionTypeChip(session.setup.difficulty);
    return `${topics} · ${type} · Cấp bậc ${session.setup.level}`;
  }, [session]);

  const timerUrgent = remainingSec > 0 && remainingSec <= 300;

  if (!session) return null;

  const q = session.questions[current];
  const selected = session.answers[current];

  return (
    <div className={`${styles.page} ${styles.pageInterview} ${styles.examPage}`}>
      <div className={styles.examTopBar}>
        <div className={styles.examTags}>
          <span className={styles.examTagPrimary}>Luyện phỏng vấn</span>
          <span className={styles.examTagMuted}>{tags}</span>
        </div>
        <div className={`${styles.examTimer} ${timerUrgent ? styles.examTimerUrgent : ''}`}>
          <ClockCircleOutlined /> Còn lại {formatTime(remainingSec)}
        </div>
      </div>

      <div className={styles.container}>
        <InterviewBreadcrumb step="exam" />
        <h2 className={styles.examHeading}>Câu {current + 1} / {total}</h2>

        <div className={styles.examLayout}>
          <div className={styles.examMain}>
            <div className={styles.questionCard}>
              <span className={styles.qNum}>{current + 1}</span>
              <h3 className={styles.qText}>{q.text}</h3>
              <p className={styles.qHint}>Chọn một đáp án đúng</p>
              <Radio.Group
                value={selected ?? undefined}
                onChange={(e) => selectAnswer(e.target.value)}
                className={styles.optionsGroup}
              >
                {q.options.map((opt, idx) => (
                  <Radio key={idx} value={idx} className={styles.optionRadio}>
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </Radio>
                ))}
              </Radio.Group>
              <div className={styles.qNav}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}
                >
                  Câu trước
                </Button>
                <Button
                  type="primary"
                  className={styles.btnPrimary}
                  icon={<ArrowRightOutlined />}
                  disabled={current >= total - 1}
                  onClick={() => setCurrent((c) => c + 1)}
                >
                  Câu sau
                </Button>
              </div>
            </div>
          </div>

          <aside className={styles.examSide}>
            <div className={styles.sideBlock}>
              <strong>Tiến độ làm bài</strong>
              <p>Đã trả lời {answered}/{total}</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(answered / total) * 100}%` }} />
              </div>
            </div>
            <div className={styles.sideBlock}>
              <strong>Danh sách câu hỏi</strong>
              <div className={styles.qGrid}>
                {session.questions.map((_, i) => {
                  const done = session.answers[i] !== null;
                  const isCur = i === current;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.qCell} ${isCur ? styles.qCellActive : ''} ${done ? styles.qCellDone : ''}`}
                      onClick={() => setCurrent(i)}
                    >
                      {i + 1}
                      {done && <CheckOutlined className={styles.qCellCheck} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              type="primary"
              block
              size="large"
              className={styles.btnPrimary}
              icon={<UploadOutlined />}
              onClick={onSubmitClick}
            >
              Nộp bài
            </Button>
          </aside>
        </div>
      </div>

      <Modal
        title="Xác nhận nộp bài"
        open={submitModal === 'confirm'}
        onCancel={() => setSubmitModal('none')}
        okText="Nộp bài"
        cancelText="Hủy"
        confirmLoading={submitting}
        onOk={() => void finalizeSubmit()}
      >
        <p>
          Bạn đã trả lời <strong>{answered}</strong> / {total} câu.
        </p>
        {!allAnswered ? (
          <p>
            Còn <strong>{total - answered}</strong> câu chưa trả lời — bạn vẫn có thể nộp; câu trống sẽ tính là
            sai.
          </p>
        ) : null}
        <p>Sau khi nộp bài sẽ <strong>không được sửa</strong> nữa. Bạn có chắc muốn nộp?</p>
      </Modal>
    </div>
  );
}
