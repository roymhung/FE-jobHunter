import { Button, Form, Input, message, notification } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { callLogin, callOAuthStatus, getOAuthLoginUrl } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';

const GoogleIcon = () => (
    <svg className={styles['oauth-icon']} viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const GitHubIcon = () => (
    <svg className={styles['oauth-icon']} viewBox="0 0 24 24" aria-hidden>
        <path
            fill="currentColor"
            d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.09 3.3 9.4 7.88 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.01-2.03-3.2.7-3.88-1.55-3.88-1.55-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.72.08-.72 1.17.08 1.8 1.2 1.8 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.8.41-1.27.75-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.28 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A10.996 10.996 0 0023.5 12C23.5 5.65 18.35 0.5 12 0.5z"
        />
    </svg>
);

const LoginPage = () => {
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const [oauthReady, setOauthReady] = useState({ google: false, github: false, facebook: false });

    const location = useLocation();
    const callback = new URLSearchParams(location.search).get('callback');

    useEffect(() => {
        if (isAuthenticated) window.location.href = '/';
    }, [isAuthenticated]);

    useEffect(() => {
        callOAuthStatus().then(res => {
            if (res?.data) {
                setOauthReady({
                    google: !!res.data.google,
                    github: !!res.data.github,
                    facebook: !!res.data.facebook,
                });
            }
        });
    }, []);

    const goOAuth = (provider: 'google' | 'github' | 'facebook') => {
        const ready =
            provider === 'google'
                ? oauthReady.google
                : provider === 'github'
                  ? oauthReady.github
                  : oauthReady.facebook;
        if (!ready) {
            notification.warning({
                message: 'BE chưa cấu hình OAuth cho provider này',
                description:
                    'Copy application-oauth.local.properties.example → application-oauth.local.properties, dán Client ID & Secret, restart Spring Boot.',
                duration: 8,
            });
        }
        window.location.href = getOAuthLoginUrl(provider);
    };

    const onFinish = async (values: { username: string; password: string }) => {
        setIsSubmit(true);
        const res = await callLogin(values.username, values.password);
        setIsSubmit(false);

        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user));
            message.success('Đăng nhập thành công!');
            window.location.href = callback ?? '/';
            return;
        }
        notification.error({
            message: 'Đăng nhập thất bại',
            description:
                res.message && Array.isArray(res.message) ? res.message[0] : res.message,
        });
    };

    return (
        <div className={styles['login-page']}>
            <div className={styles['login-shell']}>
                

                <div className={styles['login-card']}>
                    <header className={styles['login-header']}>

                        <h1 className={styles['login-title']}>Chào mừng trở lại</h1>
                        <p className={styles['login-desc']}>Đăng nhập để xem job và quản lý hồ sơ</p>
                    </header>

                    <Form
                        layout="vertical"
                        requiredMark={false}
                        onFinish={onFinish}
                        autoComplete="off"
                        className={styles['login-form']}
                    >
                        <Form.Item
                            label="Email"
                            name="username"
                            rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
                        >
                            <Input size="large" placeholder="name@company.com" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
                        >
                            <Input.Password size="large" placeholder="Mật khẩu của bạn" />
                        </Form.Item>

                        <div style={{ textAlign: 'right', marginBottom: 8 }}>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>

                        <Button type="primary" htmlType="submit" loading={isSubmit} block size="large" className={styles['login-submit']}>
                            Đăng nhập
                        </Button>
                    </Form>

                    <div className={styles['login-divider']}>
                        <span />
                        <em>hoặc</em>
                        <span />
                    </div>

                    <div className={styles['oauth-row']}>
                        <button type="button" className={styles['oauth-btn']} onClick={() => goOAuth('google')}>
                            <GoogleIcon />
                            Google
                        </button>
                        <button type="button" className={`${styles['oauth-btn']} ${styles['oauth-btn-dark']}`} onClick={() => goOAuth('github')}>
                            <GitHubIcon />
                            GitHub
                        </button>
                        <button type="button" className={`${styles['oauth-btn']} ${styles['oauth-btn-fb']}`} onClick={() => goOAuth('facebook')}>
                            Facebook
                        </button>
                    </div>

                    <p className={styles['login-footer']}>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
