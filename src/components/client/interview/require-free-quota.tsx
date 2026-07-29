import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import { useInterviewProfile } from '@/hooks/useInterviewProfile';

/** Chặn setup/ready khi hết lượt Free (trừ tài khoản Pro). */
export default function InterviewRequireFreeQuota({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const { loading, canStart, proActive, refresh } = useInterviewProfile(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) void refresh();
  }, [isAuthenticated, refresh]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!proActive && !canStart) {
    message.warning('Bạn đã dùng hết lượt Free. Vui lòng nâng cấp Pro để tiếp tục.');
    return <Navigate to="/interview#pricing" replace />;
  }

  return <>{children}</>;
}
