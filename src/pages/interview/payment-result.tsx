import { useCallback, useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import type { IInterviewOrder } from '@/types/interview';
import {
  callInterviewGetOrder,
  interviewApiError,
  unwrapInterviewData,
} from '@/utils/interview-api';
import { useInterviewProfile } from '@/hooks/useInterviewProfile';

export default function InterviewPaymentResultPage() {
  const { orderId: orderIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = Number(orderIdParam ?? searchParams.get('orderId'));
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const { refresh } = useInterviewProfile(isAuthenticated);
  const [order, setOrder] = useState<IInterviewOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollOrder = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setError('Thiếu mã đơn hàng');
      setLoading(false);
      return;
    }
    const res = await callInterviewGetOrder(orderId);
    const data = unwrapInterviewData(res);
    if (!data) {
      setError(interviewApiError(res));
      setLoading(false);
      return;
    }
    setOrder(data);
    setLoading(false);
    if (data.status === 'ACTIVE') {
      void refresh();
    }
  }, [orderId, refresh]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    const run = async () => {
      if (cancelled) return;
      await pollOrder();
      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(run, 2500);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pollOrder]);

  if (loading && !order) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#64748b' }}>Đang xác nhận thanh toán VNPay...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Không tải được đơn hàng"
        subTitle={error}
        extra={
          <Link to="/interview">
            <Button type="primary">Về trang Interview</Button>
          </Link>
        }
      />
    );
  }

  if (order?.status === 'ACTIVE') {
    return (
      <Result
        status="success"
        title="Thanh toán thành công!"
        subTitle={`Gói ${order.planCode === 'PRO_LIFETIME' ? 'Pro Trọn đời' : 'Pro Năm'} đã được kích hoạt.`}
        extra={[
          <Link key="practice" to="/interview/practice">
            <Button type="primary">Luyện tập ngay</Button>
          </Link>,
          <Link key="landing" to="/interview">
            <Button>Về trang Interview</Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <Result
      status="info"
      title="Đang xử lý thanh toán"
      subTitle="VNPay đang xác nhận giao dịch. Nếu đã trừ tiền, gói Pro sẽ được kích hoạt trong vài phút."
      extra={[
        <Button key="refresh" type="primary" loading={loading} onClick={() => void pollOrder()}>
          Kiểm tra lại
        </Button>,
        <Link key="landing" to="/interview">
          <Button>Về trang Interview</Button>
        </Link>,
      ]}
    />
  );
}
