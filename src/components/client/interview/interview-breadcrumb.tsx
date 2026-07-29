import { Link } from 'react-router-dom';
import { HomeOutlined, ThunderboltOutlined, FormOutlined, PlayCircleOutlined, EditOutlined } from '@ant-design/icons';
import styles from '@/styles/interview.module.scss';

type Step = 'home' | 'interview' | 'setup' | 'ready' | 'exam';

interface Props {
  step: Step;
}

export default function InterviewBreadcrumb({ step }: Props) {
  return (
    <nav className={styles.chevronNav} aria-label="Breadcrumb">
      <Link to="/" className={styles.chevronItem}>
        <HomeOutlined /> Trang chủ
      </Link>
      <Link
        to="/interview"
        className={`${styles.chevronItem} ${step === 'interview' ? styles.chevronActive : ''}`}
      >
        <ThunderboltOutlined /> Luyện phỏng vấn
      </Link>
      {step === 'setup' && (
        <span className={`${styles.chevronItem} ${styles.chevronActive}`}>
          <FormOutlined /> Thiết lập tiêu chí bài test
        </span>
      )}
      {step === 'ready' && (
        <>
          <Link to="/interview/setup" className={styles.chevronItem}>
            <FormOutlined /> Thiết lập tiêu chí
          </Link>
          <span className={`${styles.chevronItem} ${styles.chevronActive}`}>
            <PlayCircleOutlined /> Sẵn sàng làm bài?
          </span>
        </>
      )}
      {step === 'exam' && (
        <>
          <Link to="/interview/setup" className={styles.chevronItem}>
            <FormOutlined /> Thiết lập tiêu chí
          </Link>
          <span className={`${styles.chevronItem} ${styles.chevronActive}`}>
            <EditOutlined /> Làm bài
          </span>
        </>
      )}
    </nav>
  );
}
