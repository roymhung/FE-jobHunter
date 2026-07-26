import { CodeOutlined, MailOutlined, RiseOutlined, TwitterOutlined } from '@ant-design/icons';
import { FaReact } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '@/styles/client.module.scss';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className={styles['footer-section']}>
            <div className={styles['container']}>
                <div className={styles['footer-grid']}>
                    <div className={styles['footer-brand']}>
                        <div className={styles['footer-logo']}>
                            <FaReact />
                            <span>Job Hunter IT</span>
                        </div>
                        <p>
                            Nền tảng tuyển dụng IT giúp developer tìm việc phù hợp và doanh nghiệp tiếp cận nhân tài nhanh hơn.
                        </p>
                    </div>

                    <div className={styles['footer-column']}>
                        <h4>Ứng viên</h4>
                        <Link to="/">Tìm việc làm</Link>
                        <Link to="/job">Việc làm IT</Link>
                        <Link to="/company">Công ty nổi bật</Link>
                    </div>

                    <div className={styles['footer-column']}>
                        <h4>Nhà tuyển dụng</h4>
                        <Link to="/login">Đăng nhập quản trị</Link>
                        <span>Đăng tin tuyển dụng</span>
                        <span>Gói dịch vụ</span>
                    </div>

                    <div className={styles['footer-column']}>
                        <h4>Liên hệ</h4>
                        <a href="mailto:support@jobhunter.local">
                            <MailOutlined /> support@jobhunter.local
                        </a>
                        <span>Hà Nội · TP. Hồ Chí Minh</span>
                    </div>
                </div>

                <div className={styles['footer-bottom']}>
                    <p>&copy; {year} Job Hunter IT. All rights reserved.</p>
                    <div className={styles['footer-social']}>
                        <TwitterOutlined title="Trang chủ" />
                        <CodeOutlined title="Việc làm" />
                        <RiseOutlined title="Công ty" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
