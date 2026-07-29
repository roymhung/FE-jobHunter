import { useEffect, useState } from 'react';
import { Modal, Typography, Divider, Button, message, Spin } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';
import type { IInterviewOrder } from '@/types/interview';
import {
  callInterviewCreateOrder,
  callInterviewTransferSubmitted,
  formatVnd,
  interviewApiError,
  unwrapInterviewData,
} from '@/utils/interview-api';

const { Text, Paragraph } = Typography;

const PLAN_LABEL: Record<'year' | 'lifetime', string> = {
  year: 'Pro Năm',
  lifetime: 'Pro Trọn đời',
};

interface Props {
  open: boolean;
  plan: 'year' | 'lifetime';
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function InterviewPaymentModal({ open, plan, onClose, onSubmitted }: Props) {
  const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
  const [order, setOrder] = useState<IInterviewOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setOrder(null);
      return;
    }
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để đặt gói Pro');
      onClose();
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await callInterviewCreateOrder(plan);
      const data = unwrapInterviewData(res);
      if (cancelled) return;
      if (!data) {
        message.error(interviewApiError(res));
        setLoading(false);
        onClose();
        return;
      }
      setOrder(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, plan, isAuthenticated, onClose]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã copy');
  };

  const confirmTransfer = async () => {
    if (!order?.id) return;
    setSubmitting(true);
    const res = await callInterviewTransferSubmitted(order.id);
    const data = unwrapInterviewData(res);
    setSubmitting(false);
    if (!data) {
      message.error(interviewApiError(res));
      return;
    }
    message.success('Đã ghi nhận. Admin sẽ kích hoạt Pro trong 1–24h (giờ làm việc).');
    onSubmitted?.();
    onClose();
  };

  const planTitle = order
    ? order.planCode === 'PRO_LIFETIME'
      ? 'Pro Trọn đời'
      : 'Pro Năm'
    : PLAN_LABEL[plan];

  return (
    <Modal
      title="Thanh toán chuyển khoản"
      open={open}
      onCancel={onClose}
      footer={
        loading
          ? null
          : [
              <Button key="cancel" onClick={onClose}>
                Đóng
              </Button>,
              <Button
                key="done"
                type="primary"
                loading={submitting}
                disabled={!order?.id}
                onClick={() => void confirmTransfer()}
              >
                Tôi đã chuyển khoản
              </Button>,
            ]
      }
      width={520}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin />
        </div>
      ) : order ? (
        <>
          <Paragraph>
            Gói: <Text strong>{planTitle}</Text>
            {order.id ? (
              <>
                {' '}
                · Mã đơn <Text code>#{order.id}</Text>
              </>
            ) : null}
          </Paragraph>
          <Paragraph type="secondary">
            Chuyển khoản đúng số tiền và nội dung bên dưới. Sau khi admin xác nhận, gói Pro được kích hoạt trên tài
            khoản của bạn.
          </Paragraph>
          {order.transferSubmittedAt ? (
            <Paragraph type="warning">Bạn đã báo chuyển khoản — đang chờ duyệt.</Paragraph>
          ) : null}
          <Divider />
          <p>
            <Text type="secondary">Ngân hàng</Text>
            <br />
            <Text strong>{order.bankName}</Text>
          </p>
          <p>
            <Text type="secondary">Số tài khoản</Text>
            <br />
            <Text strong copyable>
              {order.bankAccount}
            </Text>
            <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copy(order.bankAccount)} />
          </p>
          <p>
            <Text type="secondary">Chủ tài khoản</Text>
            <br />
            <Text strong>{order.bankHolder}</Text>
          </p>
          <p>
            <Text type="secondary">Số tiền</Text>
            <br />
            <Text strong style={{ fontSize: 22, color: '#1e3a5f' }}>
              {formatVnd(order.amountVnd)} VND
            </Text>
          </p>
          <p>
            <Text type="secondary">Nội dung CK</Text>
            <br />
            <Text code>{order.transferContent}</Text>
            <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copy(order.transferContent)} />
          </p>
          <div
            style={{
              marginTop: 16,
              height: 120,
              background: '#f1f5f9',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: 13,
            }}
          >
            [ QR VietQR — tích hợp sau ]
          </div>
        </>
      ) : (
        <Paragraph>Không tải được thông tin đơn hàng.</Paragraph>
      )}
    </Modal>
  );
}
