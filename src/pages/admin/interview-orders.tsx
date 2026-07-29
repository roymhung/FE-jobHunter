import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Space, Table, Tag, message, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { IInterviewOrder } from '@/types/interview';
import {
  callInterviewActivateOrder,
  callInterviewListPendingOrders,
  formatVnd,
  interviewApiError,
  unwrapInterviewData,
} from '@/utils/interview-api';
import { useAppSelector } from '@/redux/hooks';
import { useNavigate } from 'react-router-dom';

export default function AdminInterviewOrdersPage() {
  const navigate = useNavigate();
  const roleName = useAppSelector((s) => s.account.user?.role?.name);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IInterviewOrder[]>([]);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const isSuperAdmin = roleName === 'SUPER_ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    const res = await callInterviewListPendingOrders();
    const data = unwrapInterviewData(res);
    setLoading(false);
    if (!data) {
      notification.error({
        message: 'Không tải được danh sách đơn',
        description: interviewApiError(res),
      });
      setRows([]);
      return;
    }
    setRows(data);
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      message.warning('Chỉ SUPER_ADMIN được duyệt đơn Pro');
      navigate('/admin');
      return;
    }
    void load();
  }, [isSuperAdmin, load, navigate]);

  const activate = async (id: number) => {
    setActivatingId(id);
    const res = await callInterviewActivateOrder(id);
    const data = unwrapInterviewData(res);
    setActivatingId(null);
    if (!data) {
      message.error(interviewApiError(res));
      return;
    }
    message.success(`Đã kích hoạt Pro cho ${data.userEmail ?? 'user #' + data.userId}`);
    void load();
  };

  const columns: ColumnsType<IInterviewOrder> = [
    { title: 'Mã đơn', dataIndex: 'id', width: 80 },
    { title: 'Email', dataIndex: 'userEmail', render: (v) => v || '—' },
    {
      title: 'Gói',
      dataIndex: 'planCode',
      render: (v) => (v === 'PRO_LIFETIME' ? 'Pro Trọn đời' : 'Pro Năm'),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amountVnd',
      render: (v: number) => `${formatVnd(v)} đ`,
    },
    {
      title: 'Đã báo CK',
      dataIndex: 'transferSubmittedAt',
      render: (v) => (v ? <Tag color="blue">Có</Tag> : <Tag>Chưa</Tag>),
    },
    {
      title: 'Nội dung CK',
      dataIndex: 'transferContent',
      ellipsis: true,
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      render: (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          loading={activatingId === record.id}
          onClick={() => void activate(record.id)}
        >
          Kích hoạt Pro
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Đơn Pro chờ duyệt (Interview)"
      extra={
        <Space>
          <Button onClick={() => void load()} loading={loading}>
            Làm mới
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Không có đơn PENDING' }}
      />
    </Card>
  );
}
