import { Button, Modal } from 'antd';
import styles from '@/styles/interview.module.scss';
import { FREE_INTERVIEW_SESSIONS } from '@/utils/interview-storage';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'year' | 'lifetime') => void;
  onTryFree?: () => void;
}

export default function InterviewPricingModal({ open, onClose, onSelectPlan, onTryFree }: Props) {
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      destroyOnClose
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
    >
      <div className={styles.pricingModalHead}>
        <p className={styles.sectionTitle}>Bảng giá</p>
        <h2 className={styles.pricingModalTitle}>Chọn gói phù hợp</h2>
      </div>

      <div className={styles.pricingGrid}>
        <div className={styles.priceCard}>
          <div className={styles.priceName}>FREE</div>
          <p className={styles.priceSub}>Dùng thử miễn phí</p>
          <div className={styles.priceAmount}>0đ</div>
          <ul className={styles.priceFeatures}>
            <li>{FREE_INTERVIEW_SESSIONS} lượt luyện (tổng)</li>
            <li>10 câu / phiên</li>
            <li>Giải thích đầy đủ sau mỗi câu</li>
            <li>Lưu lịch sử 3 phiên gần nhất</li>
          </ul>
          <Button block size="large" className={styles.btnOutline} onClick={onTryFree}>
            Dùng thử ngay
          </Button>
        </div>

        <div className={`${styles.priceCard} ${styles.popular}`}>
          <span className={styles.popularBadge}>Phổ biến</span>
          <div className={styles.priceName}>PRO NĂM</div>
          <p className={styles.priceSub}>Luyện không giới hạn 12 tháng</p>
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
            onClick={() => onSelectPlan('year')}
          >
            Mua 1 năm
          </Button>
        </div>

        <div className={styles.priceCard}>
          <div className={styles.priceName}>PRO TRỌN ĐỜI</div>
          <p className={styles.priceSub}>Một lần thanh toán</p>
          <div className={styles.priceAmount}>
            499.000<small>đ một lần</small>
          </div>
          <ul className={styles.priceFeatures}>
            <li>Mọi quyền lợi Pro, không hết hạn</li>
            <li>Cập nhật ngân hàng câu hỏi mới</li>
            <li>Ưu tiên hỗ trợ</li>
          </ul>
          <Button block size="large" className={styles.btnOutline} onClick={() => onSelectPlan('lifetime')}>
            Mua trọn đời
          </Button>
        </div>
      </div>

      <div className={`${styles.compareWrap} ${styles.pricingModalCompare}`}>
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
    </Modal>
  );
}
