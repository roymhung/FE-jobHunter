import { useState } from 'react';
import { Button, Modal, Tabs, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircleOutlined } from '@ant-design/icons';
import styles from '@/styles/interview.module.scss';
import {
  FREE_INTERVIEW_SESSIONS,
  consumeFreeSession,
  getFreeRemaining,
  hasFreeSessionsLeft,
  loadSetupSelection,
} from '@/utils/interview-storage';
import InterviewPaymentModal from '@/components/client/interview/payment-modal';
import InterviewBreadcrumb from '@/components/client/interview/interview-breadcrumb';
import { useAppSelector } from '@/redux/hooks';

export default function InterviewPracticePage() {
  const navigate = useNavigate();
  const email = useAppSelector((s) => s.account.user?.email);
  const [remaining, setRemaining] = useState(() => getFreeRemaining(email));
  const [sessionOpen, setSessionOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'year' | 'lifetime'>('year');
  const [history, setHistory] = useState<{ id: number; date: string; score: number }[]>([]);

  const refreshRemaining = () => {
    setRemaining(getFreeRemaining(email));
  };

  const openPayment = (plan: 'year' | 'lifetime') => {
    setPaymentPlan(plan);
    setPaymentOpen(true);
  };

  const goSetup = () => {
    navigate('/interview/setup');
  };

  const startSession = () => {
    if (!hasFreeSessionsLeft(email)) {
      message.error(`Bạn đã hết ${FREE_INTERVIEW_SESSIONS} lượt Free. Vui lòng nâng cấp Pro.`);
      setPaymentOpen(true);
      return;
    }
    const setup = loadSetupSelection();
    if (!setup?.topics?.length) {
      message.info('Hãy thiết lập tiêu chí bài test trước');
      navigate('/interview/setup');
      return;
    }
    setSessionOpen(true);
  };

  const confirmSession = () => {
    if (!email) return;
    const ok = consumeFreeSession(email);
    setSessionOpen(false);
    if (!ok) {
      message.error('Không còn lượt miễn phí.');
      refreshRemaining();
      return;
    }
    const score = Math.floor(55 + Math.random() * 35);
    setHistory((h) => [
      { id: Date.now(), date: new Date().toLocaleString('vi-VN'), score },
      ...h,
    ].slice(0, 10));
    refreshRemaining();
    message.success(`Hoàn thành phiên luyện (demo). Điểm: ${score}/100. Còn ${getFreeRemaining(email)} lượt.`);
  };

  return (
    <div className={`${styles.page} ${styles.practicePage}`}>
      <div className={styles.container}>
        <InterviewBreadcrumb step="interview" />

        <h1 className={styles.practiceTitle}>
          Luyện phỏng vấn IT — theo dõi tiến độ, lấp khoảng trống
        </h1>
        <p className={styles.practiceDesc}>
          Chọn chủ đề AI, Backend, DevOps… Free: điểm & đúng/sai. Pro Năm / Trọn đời: giải thích chi tiết + luyện không giới hạn.
        </p>

        <div className={styles.card}>
          <div className={styles.cardRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <PlayCircleOutlined style={{ fontSize: 22, color: '#3f3ab3' }} />
                <strong style={{ fontSize: 17 }}>Bắt đầu luyện</strong>
                <span className={styles.freePill}>
                  Free · còn {remaining}/{FREE_INTERVIEW_SESSIONS} lượt
                </span>
              </div>
              <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
                Chọn tối đa 3 chủ đề, level và độ khó — rồi bắt đầu khi đã sẵn sàng.
              </p>
            </div>
          </div>
          <Button
            type="primary"
            block
            size="large"
            className={styles.btnPrimary}
            style={{ marginTop: 20 }}
            onClick={remaining <= 0 ? () => openPayment('year') : goSetup}
          >
            {remaining <= 0 ? 'Đã hết lượt Free — Nâng cấp Pro' : 'Chọn đề & bắt đầu →'}
          </Button>
          {loadSetupSelection()?.topics?.length ? (
            <Button block size="large" style={{ marginTop: 8 }} onClick={startSession}>
              Bắt đầu phiên (đã có tiêu chí)
            </Button>
          ) : null}
        </div>

        <div className={styles.card}>
          <strong>Tiến độ của bạn</strong>
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 16 }}>
            <div className={styles.progressPlaceholder} title="Biểu đồ tiến độ" />
            <div>
              <div className={styles.statLine}><span>Lượt free còn</span><strong>{remaining}/{FREE_INTERVIEW_SESSIONS}</strong></div>
              <div className={styles.statLine}><span>Lần làm gần nhất</span><strong>{history[0]?.date ?? '—'}</strong></div>
              <div className={styles.statLine}><span>Điểm cao nhất</span><strong>{history.length ? Math.max(...history.map((x) => x.score)) : '—'}</strong></div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <Tabs
            items={[
              {
                key: 'history',
                label: 'Lịch sử làm bài',
                children: history.length === 0 ? (
                  <div className={styles.historyEmpty}>Chưa có lịch sử làm bài.</div>
                ) : (
                  <ul style={{ padding: 0, listStyle: 'none' }}>
                    {history.map((h) => (
                      <li key={h.id} className={styles.statLine}>
                        <span>{h.date}</span>
                        <strong>{h.score}/100</strong>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                key: 'saved',
                label: 'Câu đã lưu',
                children: <div className={styles.historyEmpty}>Chưa có câu đã lưu.</div>,
              },
            ]}
          />
        </div>

        <div className={`${styles.card} ${styles.planCard}`}>
          <div className={styles.planBar}>
            <div className={styles.planInfo}>
              <span className={styles.planLabel}>Gói của bạn</span>
              <div className={styles.planTierRow}>
                <span className={styles.planTierBadge}>FREE</span>
                <span className={styles.planTierMeta}>
                  Còn {remaining}/{FREE_INTERVIEW_SESSIONS} lượt luyện
                </span>
              </div>
              <p className={styles.planHint}>
                Nâng cấp Pro để luyện không giới hạn, 30 câu/phiên và giải thích chi tiết sau mỗi câu.
              </p>
            </div>
            <div className={styles.planActions}>
              <Button
                type="primary"
                size="large"
                block
                className={styles.btnPrimary}
                onClick={() => openPayment('year')}
              >
                Nâng cấp Pro Năm
              </Button>
              <Link to="/interview#pricing" className={styles.planLink}>
                Xem gói & nâng cấp →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Bắt đầu phiên luyện"
        open={sessionOpen}
        onCancel={() => setSessionOpen(false)}
        onOk={confirmSession}
        okText="Bắt đầu (trừ 1 lượt)"
        cancelText="Hủy"
      >
        <p>Phiên demo: 10 câu (Free). Xác nhận sẽ trừ <strong>1</strong> trong số <strong>{remaining}</strong> lượt còn lại.</p>
      </Modal>

      <InterviewPaymentModal open={paymentOpen} plan={paymentPlan} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
