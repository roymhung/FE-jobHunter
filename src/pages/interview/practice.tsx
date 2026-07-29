import { useMemo, useEffect } from 'react';
import { Button, Spin, Tabs, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlayCircleOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TagOutlined,
} from '@ant-design/icons';
import styles from '@/styles/interview.module.scss';
import { loadSetupSelection } from '@/utils/interview-storage';
import InterviewPaymentModal from '@/components/client/interview/payment-modal';
import InterviewBreadcrumb from '@/components/client/interview/interview-breadcrumb';
import { useAppSelector } from '@/redux/hooks';
import { useInterviewProfile } from '@/hooks/useInterviewProfile';
import { useState } from 'react';

function formatSessionDateShort(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('vi-VN');
  } catch {
    return iso;
  }
}

function formatSessionDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

export default function InterviewPracticePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const { me, loading, freeLeft, freeTotal, proActive, canStart, config, refresh } =
    useInterviewProfile(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) void refresh();
  }, [isAuthenticated, refresh]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'year' | 'lifetime'>('year');

  const history = me?.recentSessions ?? [];

  const bestScore = useMemo(() => {
    const scores = history.map((h) => h.scorePercent).filter((s): s is number => s != null);
    return scores.length ? Math.max(...scores) : null;
  }, [history]);

  const lastDate = history[0]?.submittedAt;

  const openPayment = (plan: 'year' | 'lifetime') => {
    setPaymentPlan(plan);
    setPaymentOpen(true);
  };

  const goSetup = () => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập');
      navigate(`/login?callback=${encodeURIComponent('/interview/setup')}`);
      return;
    }
    if (!canStart) {
      message.error('Đã hết lượt Free. Nâng cấp Pro để tiếp tục.');
      openPayment('year');
      return;
    }
    navigate('/interview/setup');
  };

  const goReady = () => {
    if (!canStart) {
      openPayment('year');
      return;
    }
    const setup = loadSetupSelection();
    if (!setup?.topics?.length) {
      message.info('Hãy thiết lập tiêu chí bài test trước');
      navigate('/interview/setup');
      return;
    }
    navigate('/interview/ready');
  };

  const questionsPerSession = proActive
    ? (config?.proQuestionsPerSession ?? 30)
    : (config?.freeQuestionsPerSession ?? 10);

  const progressStats = useMemo(() => {
    let totalQuestions = 0;
    let correctQuestions = 0;
    for (const h of history) {
      if (h.scorePercent == null) continue;
      const perSession = questionsPerSession;
      totalQuestions += perSession;
      correctQuestions += Math.round((perSession * h.scorePercent) / 100);
    }
    const wrongQuestions = Math.max(0, totalQuestions - correctQuestions);
    const correctPct = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
    const wrongPct = totalQuestions > 0 ? 100 - correctPct : 0;
    return { totalQuestions, correctQuestions, wrongQuestions, correctPct, wrongPct };
  }, [history, questionsPerSession]);

  return (
    <div className={`${styles.page} ${styles.practicePage}`}>
      <div className={styles.container}>
        <InterviewBreadcrumb step="interview" />

        <h1 className={styles.practiceTitle}>
          Luyện phỏng vấn IT — theo dõi tiến độ, lấp khoảng trống
        </h1>
        <p className={styles.practiceDesc}>
          Phiên thi thật qua server: {questionsPerSession} câu / {config?.durationMinutes ?? 45} phút.
          Pro: không giới hạn lượt trong kỳ hiệu lực.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <>
            {me?.pendingOrder && !proActive ? (
              <div className={styles.card} style={{ marginBottom: 16, borderColor: '#c7d2fe' }}>
                <strong>Đơn Pro đang chờ duyệt</strong>
                <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                  Mã đơn #{me.pendingOrder.id}
                  {me.pendingOrder.transferSubmitted ? ' · Đã báo chuyển khoản' : ' · Hãy hoàn tất chuyển khoản'}
                </p>
              </div>
            ) : null}
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <PlayCircleOutlined style={{ fontSize: 22, color: '#3f3ab3' }} />
                    <strong style={{ fontSize: 17 }}>Bắt đầu luyện</strong>
                    <span className={styles.freePill}>
                      {proActive ? 'Pro · không giới hạn lượt' : `Free · còn ${freeLeft}/${freeTotal} lượt`}
                    </span>
                  </div>
                  <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
                    Chọn tối đa {config?.maxTopics ?? 3} chủ đề, loại câu và cấp bậc — rồi xác nhận tại trang sẵn sàng.
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                block
                size="large"
                className={styles.btnPrimary}
                style={{ marginTop: 20 }}
                onClick={canStart ? goSetup : () => openPayment('year')}
              >
                {!canStart ? 'Đã hết lượt Free — Nâng cấp Pro' : 'Chọn đề & tiếp tục →'}
              </Button>
              {loadSetupSelection()?.topics?.length ? (
                <Button block size="large" style={{ marginTop: 8 }} onClick={goReady}>
                  Đi tới sẵn sàng làm bài (đã có tiêu chí)
                </Button>
              ) : null}
            </div>

            <div className={styles.card}>
              <div className={styles.progressCardHead}>
                <span className={styles.progressCardIcon}>
                  <BarChartOutlined />
                </span>
                Tiến độ của bạn
              </div>
              <div className={styles.progressDashboard}>
                <div className={styles.progressChartBlock}>
                  <div
                    className={styles.progressDonut}
                    style={{
                      background:
                        progressStats.totalQuestions > 0
                          ? `conic-gradient(#22c55e 0 ${progressStats.correctPct}%, #f97316 ${progressStats.correctPct}% 100%)`
                          : '#e2e8f0',
                    }}
                  >
                    <div className={styles.progressDonutInner}>
                      <strong>{progressStats.totalQuestions}</strong>
                      <span>câu</span>
                    </div>
                  </div>
                  <div className={styles.progressLegend}>
                    <div className={styles.progressLegendItem}>
                      <span className={`${styles.progressLegendDot} ${styles.ok}`} />
                      {progressStats.correctQuestions} Đúng · {progressStats.correctPct}%
                    </div>
                    <div className={styles.progressLegendItem}>
                      <span className={`${styles.progressLegendDot} ${styles.bad}`} />
                      {progressStats.wrongQuestions} Sai · {progressStats.wrongPct}%
                    </div>
                  </div>
                </div>
                <div className={styles.progressStats}>
                  <div className={styles.progressStatRow}>
                    <span className={styles.progressStatIcon}>
                      <TagOutlined />
                    </span>
                    <div className={styles.progressStatText}>
                      <span>Lượt free còn</span>
                      <strong>{proActive ? '∞ (Pro)' : `${freeLeft}/${freeTotal}`}</strong>
                    </div>
                  </div>
                  <div className={styles.progressStatRow}>
                    <span className={styles.progressStatIcon}>
                      <CalendarOutlined />
                    </span>
                    <div className={styles.progressStatText}>
                      <span>Lần làm gần nhất</span>
                      <strong>{formatSessionDateShort(lastDate)}</strong>
                    </div>
                  </div>
                  <div className={styles.progressStatRow}>
                    <span className={styles.progressStatIcon}>
                      <TrophyOutlined />
                    </span>
                    <div className={styles.progressStatText}>
                      <span>Điểm cao nhất</span>
                      <strong>{bestScore != null ? `${bestScore}%` : '—'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <Tabs
                items={[
                  {
                    key: 'history',
                    label: 'Lịch sử làm bài',
                    children:
                      history.length === 0 ? (
                        <div className={styles.historyEmpty}>Chưa có lịch sử làm bài trên server.</div>
                      ) : (
                        <ul style={{ padding: 0, listStyle: 'none' }}>
                          {history.map((h) => (
                            <li key={h.sessionId} className={styles.statLine}>
                              <span>{formatSessionDate(h.submittedAt)}</span>
                              <strong>
                                {h.scorePercent != null ? `${h.scorePercent}%` : '—'}
                                {h.passed ? ' · Đạt' : ''}
                              </strong>
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
                    <span className={styles.planTierBadge}>{proActive ? 'PRO' : 'FREE'}</span>
                    <span className={styles.planTierMeta}>
                      {proActive
                        ? 'Luyện không giới hạn lượt'
                        : `Còn ${freeLeft}/${freeTotal} lượt luyện`}
                    </span>
                  </div>
                  <p className={styles.planHint}>
                    Nâng cấp Pro để luyện không giới hạn, {config?.proQuestionsPerSession ?? 30} câu/phiên và giải
                    thích chi tiết sau mỗi câu.
                  </p>
                </div>
                <div className={styles.planActions}>
                  {!proActive && (
                    <Button
                      type="primary"
                      size="large"
                      block
                      className={styles.btnPrimary}
                      onClick={() => openPayment('year')}
                    >
                      Nâng cấp Pro Năm
                    </Button>
                  )}
                  <Link to="/interview#pricing" className={styles.planLink}>
                    Xem gói & nâng cấp →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <InterviewPaymentModal
        open={paymentOpen}
        plan={paymentPlan}
        onClose={() => setPaymentOpen(false)}
        onSubmitted={() => void refresh()}
      />
    </div>
  );
}
