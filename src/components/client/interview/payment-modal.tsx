import { Modal, Typography, Divider, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const PLANS = {
  year: {
    title: 'Pro Năm — 199.000đ',
    amount: '199.000',
    note: 'Nội dung chuyển khoản: JGH PRO NAM + email của bạn',
  },
  lifetime: {
    title: 'Pro Trọn đời — 499.000đ',
    amount: '499.000',
    note: 'Nội dung chuyển khoản: JGH PRO LIFE + email của bạn',
  },
};

const BANK = {
  bank: 'Vietcombank (VCB)',
  account: '1029384756',
  holder: 'CONG TY JOBGOHUNTER',
};

interface Props {
  open: boolean;
  plan: 'year' | 'lifetime';
  onClose: () => void;
}

export default function InterviewPaymentModal({ open, plan, onClose }: Props) {
  const info = PLANS[plan];

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã copy');
  };

  return (
    <Modal
      title="Thanh toán chuyển khoản"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Tôi đã chuyển khoản
        </Button>,
      ]}
      width={520}
    >
      <Paragraph>
        Gói: <Text strong>{info.title}</Text>
      </Paragraph>
      <Paragraph type="secondary">
        Quét QR hoặc chuyển khoản theo thông tin bên dưới. Sau 1–24h (giờ làm việc) tài khoản sẽ được kích hoạt Pro.
      </Paragraph>
      <Divider />
      <p><Text type="secondary">Ngân hàng</Text><br /><Text strong>{BANK.bank}</Text></p>
      <p>
        <Text type="secondary">Số tài khoản</Text><br />
        <Text strong copyable>{BANK.account}</Text>
        <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copy(BANK.account)} />
      </p>
      <p><Text type="secondary">Chủ tài khoản</Text><br /><Text strong>{BANK.holder}</Text></p>
      <p>
        <Text type="secondary">Số tiền</Text><br />
        <Text strong style={{ fontSize: 22, color: '#1e3a5f' }}>{info.amount} VND</Text>
      </p>
      <p><Text type="secondary">Nội dung CK</Text><br /><Text code>{info.note}</Text></p>
      <div
        style={{
          marginTop: 16,
          height: 160,
          background: '#f1f5f9',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: 13,
        }}
      >
        [ QR VietQR — tích hợp API ngân hàng sau ]
      </div>
    </Modal>
  );
}
