import { Button, Form, Input, message, notification } from 'antd';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { callForgotPassword } from 'config/api';
import styles from 'styles/auth.module.scss';

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            const res = await callForgotPassword(values.email);
            if (res && +res.statusCode >= 400) {
                throw new Error(typeof res.message === 'string' ? res.message : 'Gửi email thất bại');
            }
            setSent(true);
            message.success('Kiểm tra hộp thư (và spam) của bạn.');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Không gửi được email. Kiểm tra cấu hình SMTP trên BE.';
            notification.error({ message: 'Gửi email thất bại', description: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['login-page']}>
            <div className={styles['login-shell']}>
                <div className={styles['login-card']}>
                    <header className={styles['login-header']}>
                        <h1 className={styles['login-title']}>Quên mật khẩu</h1>
                        <p className={styles['login-desc']}>
                            Nhập email đăng ký bằng <strong>mật khẩu</strong> (không áp dụng tài khoản đăng nhập bằng Google/GitHub/Facebook).
                        </p>
                    </header>

                    {sent ? (
                        <p className={styles['login-desc']}>
                            Nếu email hợp lệ, bạn sẽ nhận hướng dẫn trong vài phút.
                        </p>
                    ) : (
                        <Form layout="vertical" requiredMark={false} onFinish={onFinish} className={styles['login-form']}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' },
                                ]}
                            >
                                <Input size="large" placeholder="name@company.com" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" className={styles['login-submit']}>
                                Gửi link đặt lại
                            </Button>
                        </Form>
                    )}

                    <p className={styles['login-footer']}>
                        <Link to="/login">← Quay lại đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
