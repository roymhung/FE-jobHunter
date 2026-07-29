import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, notification, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { callFetchAccount } from '@/config/api';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';

const OAuthCallbackPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const run = async () => {
            const error = params.get('error');
            if (error) {
                const desc =
                    error === 'user_not_found'
                        ? 'Backend không tìm/thêm được tài khoản sau OAuth. Thử đăng ký email trước hoặc liên hệ admin; nếu vừa cập nhật BE hãy restart server.'
                        : error;
                notification.error({ message: 'Đăng nhập OAuth thất bại', description: desc });
                navigate('/login', { replace: true });
                return;
            }
            const accessToken = params.get('access_token');
            if (!accessToken) {
                notification.error({ message: 'Thiếu access_token từ server' });
                navigate('/login', { replace: true });
                return;
            }
            localStorage.setItem('access_token', accessToken);
            const res = await callFetchAccount();
            if (res?.data?.user) {
                dispatch(setUserLoginInfo(res.data.user as any));
                message.success('Đăng nhập Google/GitHub thành công!');
                navigate('/', { replace: true });
            } else {
                notification.error({ message: 'Không lấy được thông tin tài khoản' });
                navigate('/login', { replace: true });
            }
        };
        run();
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spin tip="Đang hoàn tất đăng nhập..." />
        </div>
    );
};

export default OAuthCallbackPage;
