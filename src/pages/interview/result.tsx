import { Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/interview.module.scss';
import { getExamSession, gradeSession, clearExamSession, type ExamSession } from '@/utils/interview-exam-session';
import { EXAM_PASS_PERCENT } from '@/utils/interview-questions';

export default function InterviewResultPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    const s = getExamSession();
    if (!s?.submitted) {
      navigate('/interview/setup', { replace: true });
      return;
    }
    setSession(s);
  }, [navigate]);

  const grade = useMemo(() => (session ? gradeSession(session) : null), [session]);

  if (!session || !grade) return null;

  const passed = grade.percent >= EXAM_PASS_PERCENT;

  return (
    <div className={`${styles.page} ${styles.pageInterview} ${styles.resultPage}`}>
      <div className={styles.container}>
        <p className={styles.resultKicker}>KẾT QUẢ BÀI TEST</p>
        <h1 className={styles.practiceTitle}>
          {passed ? 'Chúc mừng!' : 'Cần cố gắng thêm'} — {grade.percent}% đúng
        </h1>

        <div className={styles.resultSummary}>
          <div className={styles.donutWrap}>
            <div
              className={styles.donut}
              style={{
                background: `conic-gradient(#10b981 0 ${grade.percent}%, #ef4444 ${grade.percent}% 100%)`,
              }}
            >
              <span>{grade.percent}%</span>
            </div>
          </div>
          <div className={styles.resultStats}>
            <div className={styles.statOk}>Đúng {grade.correct}/{grade.total}</div>
            <div className={styles.statBad}>
              Sai {grade.total - grade.correct - grade.unanswered}/{grade.total}
            </div>
            <div className={styles.statMuted}>Chưa trả lời {grade.unanswered}/{grade.total}</div>
          </div>
        </div>

        <div className={styles.resultList}>
          {session.questions.map((q, i) => {
            const user = session.answers[i];
            const isCorrect = user === q.correctIndex;
            const isWrong = user !== null && user !== q.correctIndex;
            return (
              <div key={q.id} className={styles.resultItem}>
                <div className={styles.resultItemHead}>
                  {isCorrect && <CheckCircleOutlined style={{ color: '#10b981' }} />}
                  {isWrong && <CloseCircleOutlined style={{ color: '#ef4444' }} />}
                  <strong>Câu {i + 1}:</strong> {q.text}
                </div>
                <div className={styles.resultOptions}>
                  {q.options.map((opt, idx) => {
                    const isUser = user === idx;
                    const isRight = idx === q.correctIndex;
                    let cls = styles.resultOpt;
                    if (isRight) cls += ` ${styles.resultOptCorrect}`;
                    if (isUser && !isRight) cls += ` ${styles.resultOptWrong}`;
                    return (
                      <div key={idx} className={cls}>
                        {String.fromCharCode(65 + idx)}. {opt}
                        {isUser && ' (Bạn chọn)'}
                        {isRight && ' ✓'}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.explainBox}>
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.setupFooter}>
          <Button size="large" onClick={() => { clearExamSession(); navigate('/interview/practice'); }}>
            Về trang luyện tập
          </Button>
          <Button
            type="primary"
            size="large"
            className={styles.btnPrimary}
            onClick={() => { clearExamSession(); navigate('/interview/setup'); }}
          >
            Làm bài mới
          </Button>
        </div>
      </div>
    </div>
  );
}
