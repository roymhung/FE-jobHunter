import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import Loading from '@/components/share/loading';

/** Yêu cầu đăng nhập cho luồng luyện phỏng vấn */
export default function InterviewRequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const isLoading = useAppSelector((s) => s.account.isLoading);
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    const callback = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?callback=${callback}`} replace />;
  }

  return <>{children}</>;
}
