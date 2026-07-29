import { useRef, useState, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ThunderboltOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import styles from '@/styles/interview.module.scss';
import {
  FREE_INTERVIEW_SESSIONS,
  getFreeRemaining,
  hasFreeSessionsLeft,
} from '@/utils/interview-storage';
import InterviewPaymentModal from '@/components/client/interview/payment-modal';
import { useAppSelector } from '@/redux/hooks';

const TOPIC_GROUPS = [
  { title: 'Nền tảng', tags: ['Java Core', 'OOP', 'Linux', 'Git'] },
  { title: 'Backend', tags: ['Spring Boot', 'REST API', 'Security', 'JPA/Hibernate'] },
  { title: 'Frontend', tags: ['React', 'TypeScript', 'HTML/CSS', 'Performance'] },
  { title: 'DevOps & Cloud', tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'] },
  { title: 'Dữ liệu', tags: ['SQL', 'PostgreSQL', 'Redis', 'MongoDB'] },
];

export default function InterviewLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const userEmail = useAppSelector((s) => s.account.user?.email);
  const pricingRef = useRef<HTMLElement>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'year' | 'lifetime'>('year');
  const remaining = getFreeRemaining(isAuthenticated ? userEmail : undefined);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (location.hash === '#pricing') {
      requestAnimationFrame(() => {
        pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.pathname, location.hash]);

  const onStartPractice = () => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để bắt đầu luyện phỏng vấn');
      navigate(`/login?callback=${encodeURIComponent('/interview/setup')}`);
      return;
    }
    setStartOpen(true);
  };

  const confirmStart = () => {
    if (!hasFreeSessionsLeft(userEmail)) {
      message.warning('Bạn đã hết lượt Free. Vui lòng nâng cấp gói Pro.');
      setStartOpen(false);
      scrollToPricing();
      return;
    }
    setStartOpen(false);
    navigate('/interview/setup');
  };

  const openPayment = (plan: 'year' | 'lifetime') => {
    setPaymentPlan(plan);
    setPaymentOpen(true);
  };

  return (
    <div className={`${styles.page} ${styles.pageInterview}`}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.badge}>
                <ThunderboltOutlined /> Luyện phỏng vấn IT
              </div>
              <h1 className={styles.heroTitle}>
                Luyện phỏng vấn AI, Backend, Frontend, DevOps, QA, QC.{' '}
                <span className={styles.highlight}>Tự tin chinh phục mọi cơ hội IT</span>
              </h1>
              <p className={styles.heroDesc}>
                Hơn 1.000+ câu hỏi trắc nghiệm & tự luận, 22+ chủ đề. Mỗi phiên 30 câu / 45 phút,
                chấm điểm tức thì và giải thích chi tiết (gói Pro).
              </p>
              <div className={styles.heroActions}>
                <Button
                  type="primary"
                  size="large"
                  className={styles.btnPrimary}
                  icon={<PlayCircleOutlined />}
                  onClick={onStartPractice}
                >
                  Bắt đầu luyện ngay
                </Button>
                <Button size="large" className={styles.btnOutline} onClick={scrollToPricing}>
                  Xem bảng giá
                </Button>
              </div>
              <div className={styles.statsRow}>
                <div><strong>1.000+</strong><span>Câu hỏi</span></div>
                <div><strong>22+</strong><span>Chủ đề</span></div>
                <div><strong>30</strong><span>Câu / phiên</span></div>
                <div><strong>45</strong><span>Phút / phiên</span></div>
              </div>
            </div>
            <div className={styles.heroMock}>
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
                alt="Dashboard luyện phỏng vấn"
                style={{ width: '100%', borderRadius: 12, objectFit: 'cover', height: 260 }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <p className={styles.sectionTitle}>Cách thức</p>
          <h2 className={styles.sectionHeading}>Luyện tập trong 3 bước</h2>
          <div className={styles.steps}>
            <div className={styles.stepCard}>
              <div className={styles.num}>01</div>
              <h3>Chọn chủ đề</h3>
              <p>Chọn lĩnh vực (Backend, DevOps…) và level Junior → Senior.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.num}>02</div>
              <h3>Làm bài có giới hạn thời gian</h3>
              <p>30 câu trong 45 phút — giống phỏng vấn thật.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.num}>03</div>
              <h3>Phân tích & học từ giải thích</h3>
              <p>Xem điểm, đúng/sai và giải thích chi tiết (Pro).</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <div className={styles.topicsGrid}>
            <div>
              <p className={styles.sectionTitle} style={{ textAlign: 'left' }}>Ngân hàng câu hỏi</p>
              <h2 className={styles.sectionHeading} style={{ textAlign: 'left', marginBottom: 24 }}>
                Chủ đề & kỹ năng
              </h2>
              {TOPIC_GROUPS.map((g) => (
                <div key={g.title} className={styles.topicGroup}>
                  <h4>{g.title}</h4>
                  <div className={styles.tags}>
                    {g.tags.map((t) => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.sideCard}>
              <h3>Thống kê mẫu (sau khi luyện)</h3>
              <p>
                Tổng câu đã làm, tỉ lệ đúng, điểm trung bình và biểu đồ theo chủ đề — hiển thị trên trang luyện tập.
              </p>
              <div className={styles.statsPreview}>
                <div className={styles.statsPreviewItem}>
                  <strong>240</strong>
                  <span>Câu đã làm</span>
                </div>
                <div className={styles.statsPreviewItem}>
                  <strong>78%</strong>
                  <span>Tỉ lệ đúng</span>
                </div>
                <div className={styles.statsPreviewItem}>
                  <strong>8.2</strong>
                  <span>Điểm TB</span>
                </div>
              </div>
              <div className={styles.statsPreviewChart} aria-hidden>
                <span style={{ height: '45%' }} />
                <span style={{ height: '70%' }} />
                <span style={{ height: '55%' }} />
                <span style={{ height: '90%' }} />
                <span style={{ height: '60%' }} />
                <span style={{ height: '75%' }} />
              </div>
              <Button type="link" className={styles.sideCardLink} onClick={() => navigate('/interview/practice')}>
                Vào trang luyện tập →
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionLight}`} id="pricing" ref={pricingRef}>
        <div className={styles.container}>
          <p className={styles.sectionTitle}>Bảng giá</p>
          <h2 className={styles.sectionHeading}>Chọn gói phù hợp</h2>
          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <div className={styles.priceName}>FREE</div>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Dùng thử miễn phí</p>
              <div className={styles.priceAmount}>0đ</div>
              <ul className={styles.priceFeatures}>
                <li>{FREE_INTERVIEW_SESSIONS} lượt luyện (tổng)</li>
                <li>10 câu / phiên</li>
                <li>Giải thích đầy đủ sau mỗi câu</li>
                <li>Lưu lịch sử 3 phiên gần nhất</li>
              </ul>
              <Button block size="large" className={styles.btnOutline} onClick={onStartPractice}>
                Dùng thử ngay
              </Button>
            </div>

            <div className={`${styles.priceCard} ${styles.popular}`}>
              <span className={styles.popularBadge}>Phổ biến</span>
              <div className={styles.priceName}>PRO NĂM</div>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Luyện không giới hạn 12 tháng</p>
              <div className={styles.priceAmount}>
                199.000<small>đ / năm</small>
              </div>
              <ul className={styles.priceFeatures}>
                <li>Không giới hạn lượt trong 12 tháng</li>
                <li>30 câu / phiên</li>
                <li>1.500+ câu hỏi premium</li>
                <li>Lịch sử & phân tích chi tiết</li>
              </ul>
              <Button
                block
                type="primary"
                size="large"
                className={styles.btnPrimary}
                onClick={() => openPayment('year')}
              >
                Mua 1 năm
              </Button>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.priceName}>PRO TRỌN ĐỜI</div>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Một lần thanh toán</p>
              <div className={styles.priceAmount}>
                499.000<small>đ một lần</small>
              </div>
              <ul className={styles.priceFeatures}>
                <li>Mọi quyền lợi Pro, không hết hạn</li>
                <li>Cập nhật ngân hàng câu hỏi mới</li>
                <li>Ưu tiên hỗ trợ</li>
              </ul>
              <Button block size="large" className={styles.btnOutline} onClick={() => openPayment('lifetime')}>
                Mua trọn đời
              </Button>
            </div>
          </div>

          <div className={styles.compareWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Tính năng</th>
                  <th>Free</th>
                  <th>Pro Năm</th>
                  <th>Pro Trọn đời</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Số lượt luyện</td>
                  <td>{FREE_INTERVIEW_SESSIONS} lượt</td>
                  <td>12 tháng không giới hạn</td>
                  <td>Vĩnh viễn</td>
                </tr>
                <tr>
                  <td>Câu / phiên</td>
                  <td>10</td>
                  <td>30</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>Giải thích chi tiết</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td>Có</td>
                </tr>
                <tr>
                  <td>Lịch sử</td>
                  <td>3 phiên</td>
                  <td>Đầy đủ</td>
                  <td>Đầy đủ</td>
                </tr>
                <tr>
                  <td>Giá</td>
                  <td>0đ</td>
                  <td>199.000đ/năm</td>
                  <td>499.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className={styles.ctaBottom}>
        <h2>Sẵn sàng cho buổi phỏng vấn tiếp theo?</h2>
        <p>Bắt đầu với {FREE_INTERVIEW_SESSIONS} lượt miễn phí — không cần thẻ.</p>
        <Button size="large" className={styles.ctaBottomBtn} onClick={onStartPractice}>
          Bắt đầu luyện ngay
        </Button>
      </div>

      <Modal
        title="Lượt luyện miễn phí"
        open={startOpen}
        onCancel={() => setStartOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setStartOpen(false)}>Đóng</Button>,
          <Button key="go" type="primary" className={styles.btnPrimary} onClick={confirmStart}>
            Vào trang luyện tập
          </Button>,
        ]}
      >
        <p>
          Gói <strong>Free</strong> cho phép <strong>{FREE_INTERVIEW_SESSIONS} lượt</strong> luyện phỏng vấn miễn phí.
          Sau khi dùng hết, bạn cần nâng cấp Pro để tiếp tục.
        </p>
        <p style={{ marginTop: 12, fontSize: 16 }}>
          Bạn còn: <strong style={{ color: '#6366f1' }}>{remaining}/{FREE_INTERVIEW_SESSIONS}</strong> lượt.
        </p>
      </Modal>

      <InterviewPaymentModal
        open={paymentOpen}
        plan={paymentPlan}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  );
}
