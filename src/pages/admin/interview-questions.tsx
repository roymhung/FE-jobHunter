import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
  notification,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import type { IInterviewQuestionAdmin, IInterviewTopic } from '@/types/interview';
import {
  callInterviewAdminCreateQuestion,
  callInterviewAdminDeleteQuestion,
  callInterviewAdminListQuestions,
  callInterviewAdminUpdateQuestion,
  callInterviewTopics,
  interviewApiError,
  unwrapInterviewData,
} from '@/utils/interview-api';
import { CAREER_LEVELS, QUESTION_TYPES, INTERVIEW_TOPIC_TITLES } from '@/utils/interview-setup-options';
import type { IBackendRes, IModelPaginate } from '@/types/backend';

type QuestionForm = {
  topicCode: string;
  questionType: string;
  level: string;
  content: string;
  option0: string;
  option1: string;
  option2: string;
  option3: string;
  correctIndex: number;
  explanation?: string;
  active: boolean;
};

const emptyForm = (): QuestionForm => ({
  topicCode: 'java',
  questionType: 'Lý thuyết',
  level: 'Junior',
  content: '',
  option0: '',
  option1: '',
  option2: '',
  option3: '',
  correctIndex: 0,
  explanation: '',
  active: true,
});

function formToPayload(values: QuestionForm) {
  const options = [values.option0, values.option1, values.option2, values.option3]
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    topicCode: values.topicCode,
    questionType: values.questionType,
    level: values.level,
    content: values.content.trim(),
    options,
    correctIndex: values.correctIndex,
    explanation: values.explanation?.trim() || undefined,
    active: values.active,
  };
}

function rowToForm(row: IInterviewQuestionAdmin): QuestionForm {
  const opts = row.options ?? [];
  return {
    topicCode: row.topicCode,
    questionType: row.questionType,
    level: row.level,
    content: row.content,
    option0: opts[0] ?? '',
    option1: opts[1] ?? '',
    option2: opts[2] ?? '',
    option3: opts[3] ?? '',
    correctIndex: row.correctIndex ?? 0,
    explanation: row.explanation ?? '',
    active: row.active !== false,
  };
}

export default function AdminInterviewQuestionsPage() {
  const navigate = useNavigate();
  const roleName = useAppSelector((s) => s.account.user?.role?.name);
  const isSuperAdmin = roleName === 'SUPER_ADMIN';

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IInterviewQuestionAdmin[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [topicFilter, setTopicFilter] = useState<string | undefined>(undefined);
  const [topicOptions, setTopicOptions] = useState<{ value: string; label: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IInterviewQuestionAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<QuestionForm>();

  useEffect(() => {
    void (async () => {
      const res = (await callInterviewTopics()) as IBackendRes<IInterviewTopic[]>;
      const topics = unwrapInterviewData(res);
      if (topics?.length) {
        setTopicOptions(topics.map((t) => ({ value: t.code, label: t.name })));
      } else {
        setTopicOptions(
          Object.entries(INTERVIEW_TOPIC_TITLES).map(([value, label]) => ({ value, label })),
        );
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = (await callInterviewAdminListQuestions({
      topicCode: topicFilter,
      page: page - 1,
      size: pageSize,
    })) as IBackendRes<IModelPaginate<IInterviewQuestionAdmin>>;
    setLoading(false);
    const data = unwrapInterviewData(res);
    if (!data || res?.error) {
      notification.error({
        message: 'Không tải được câu hỏi',
        description: interviewApiError(res),
      });
      setRows([]);
      setTotal(0);
      return;
    }
    setRows(data.result ?? []);
    setTotal(data.meta?.total ?? 0);
  }, [page, pageSize, topicFilter]);

  useEffect(() => {
    if (!isSuperAdmin) {
      message.warning('Chỉ SUPER_ADMIN được quản lý câu hỏi phỏng vấn');
      navigate('/admin');
      return;
    }
    void load();
  }, [isSuperAdmin, load, navigate]);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row: IInterviewQuestionAdmin) => {
    setEditing(row);
    form.setFieldsValue(rowToForm(row));
    setModalOpen(true);
  };

  const save = async () => {
    const values = await form.validateFields();
    const body = formToPayload(values);
    if (body.options.length < 2) {
      message.error('Nhập ít nhất 2 đáp án');
      return;
    }
    if (body.correctIndex >= body.options.length) {
      message.error('Chọn đáp án đúng trong phạm vi các lựa chọn đã nhập');
      return;
    }
    setSaving(true);
    const res = editing?.id
      ? await callInterviewAdminUpdateQuestion(editing.id, body)
      : await callInterviewAdminCreateQuestion(body);
    setSaving(false);
    const data = unwrapInterviewData(res);
    if (!data) {
      message.error(interviewApiError(res));
      return;
    }
    message.success(editing ? 'Đã cập nhật câu hỏi' : 'Đã tạo câu hỏi mới');
    setModalOpen(false);
    void load();
  };

  const remove = async (id: number) => {
    const res = await callInterviewAdminDeleteQuestion(id);
    if (res?.error || (res?.statusCode && +res.statusCode >= 400)) {
      message.error(interviewApiError(res));
      return;
    }
    message.success('Đã xóa câu hỏi');
    void load();
  };

  const columns: ColumnsType<IInterviewQuestionAdmin> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: 'Chủ đề',
      dataIndex: 'topicCode',
      width: 120,
      render: (code: string) => INTERVIEW_TOPIC_TITLES[code] ?? code,
    },
    { title: 'Loại', dataIndex: 'questionType', width: 100, ellipsis: true },
    { title: 'Level', dataIndex: 'level', width: 90 },
    { title: 'Nội dung', dataIndex: 'content', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 90,
      render: (v: boolean) => (v !== false ? <Tag color="green">Bật</Tag> : <Tag>Tắt</Tag>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa câu hỏi này?" onConfirm={() => void remove(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Câu hỏi phỏng vấn"
      extra={
        <Space wrap>
          <Select
            allowClear
            placeholder="Lọc chủ đề"
            style={{ minWidth: 160 }}
            options={topicOptions}
            value={topicFilter}
            onChange={(v) => {
              setTopicFilter(v);
              setPage(1);
            }}
          />
          <Button onClick={() => void load()} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm câu hỏi
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title={editing ? `Sửa câu hỏi #${editing.id}` : 'Thêm câu hỏi phỏng vấn'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void save()}
        confirmLoading={saving}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={emptyForm()}>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="topicCode" label="Chủ đề" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={topicOptions} showSearch optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="questionType" label="Loại câu" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={QUESTION_TYPES.map((v) => ({ value: v, label: v }))} />
            </Form.Item>
            <Form.Item name="level" label="Level" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={CAREER_LEVELS.map((v) => ({ value: v, label: v }))} />
            </Form.Item>
          </Space>
          <Form.Item name="content" label="Câu hỏi" rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="option0" label="Đáp án A" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="option1" label="Đáp án B" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="option2" label="Đáp án C">
            <Input />
          </Form.Item>
          <Form.Item name="option3" label="Đáp án D">
            <Input />
          </Form.Item>
          <Form.Item name="correctIndex" label="Đáp án đúng" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 0, label: 'A' },
                { value: 1, label: 'B' },
                { value: 2, label: 'C' },
                { value: 3, label: 'D' },
              ]}
            />
          </Form.Item>
          <Form.Item name="explanation" label="Giải thích (tuỳ chọn)">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="active" label="Đang dùng trong đề" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
