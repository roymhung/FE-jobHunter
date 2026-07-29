import { Button, Form, Input, Spin, message, notification } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { callResetPassword, callValidateResetToken } from 'config/api';
import styles from 'styles/auth.module.scss';

const ResetPasswordPage = () => {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setChecking(false);
            setValid(false);
            return;
        }
        callValidateResetToken(token).then(res => {
            const payload = res?.data;
            setValid(!!payload?.valid);
            setChecking(false);
            if (!payload?.valid) {
                notification.error({
                    message: 'Link không hợp lệ',
                    description: payload?.message ?? 'Yêu cầu link mới từ trang quên mật khẩu.',
                });
            }
        });
    }, [token]);

    const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        const res = await callResetPassword(token, values.newPassword);
        setLoading(false);
        if (res && +res.statusCode === 200) {
            message.success('Đặt lại mật khẩu thành công!');
            navigate('/login', { replace: true });
            return;
        }
        notification.error({
            message: 'Thất bại',
            description: Array.isArray(res.message) ? res.message[0] : res.message,
        });
    };

    if (checking) {
        return (
            <div className={styles['login-page']}>
                <Spin tip="Đang kiểm tra link..." />
            </div>
        );
    }

    if (!valid) {
        return (
            <div className={styles['login-page']}>
                <div className={styles['login-shell']}>
                    <div className={styles['login-card']}>
                        <h1 className={styles['login-title']}>Link hết hạn</h1>
                        <p className={styles['login-footer']}>
                            <Link to="/forgot-password">Yêu cầu link mới</Link> · <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['login-page']}>
            <div className={styles['login-shell']}>
                <div className={styles['login-card']}>
                    <header className={styles['login-header']}>
                        <h1 className={styles['login-title']}>Mật khẩu mới</h1>
                        <p className={styles['login-desc']}>Nhập mật khẩu mới (tối thiểu 6 ký tự)</p>
                    </header>
                    <Form layout="vertical" requiredMark={false} onFinish={onFinish} className={styles['login-form']}>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            rules={[{ required: true, message: 'Nhập lại mật khẩu' }]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" className={styles['login-submit']}>
                            Cập nhật mật khẩu
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
