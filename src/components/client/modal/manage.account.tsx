import { Alert, Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tabs, Tag, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, ISubscribers, IUser } from "@/types/backend";
import { useState, useEffect, useCallback } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callUpdateAccount, callChangePassword, callFetchAccount, callSendJobEmail, callUnsubscribeJobEmail } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { getResumeStatusTag, RESUME_STATUS_META, ResumeStatus } from "@/config/utils";
import { ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = ({ active }: { active?: boolean }) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<'ALL' | ResumeStatus>('ALL');

    const fetchList = useCallback(async () => {
        setIsFetching(true);
        const res = await callFetchResumeByUser();
        if (res?.data?.result) {
            setListCV(res.data.result as IResume[]);
        }
        setIsFetching(false);
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    useEffect(() => {
        if (active === false) return;
        const timer = window.setInterval(() => {
            fetchList();
        }, 20000);
        return () => window.clearInterval(timer);
    }, [active, fetchList]);

    const filteredList =
        statusFilter === 'ALL'
            ? listCV
            : listCV.filter(item => item.status === statusFilter);

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (_text, _record, index) => index + 1,
        },
        {
            title: 'Công ty',
            dataIndex: "companyName",
        },
        {
            title: 'Job',
            dataIndex: ["job", "name"],
        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
            render: (status: string) => {
                const meta = getResumeStatusTag(status);
                return <Tag color={meta.color}>{meta.label}</Tag>;
            },
        },
        {
            title: 'Ngày nộp CV',
            dataIndex: "createdAt",
            render: (_value, record) =>
                dayjs(record.createdAt).format('DD-MM-YYYY HH:mm'),
        },
        {
            title: 'Cập nhật',
            dataIndex: "updatedAt",
            render: (_value, record) =>
                record.updatedAt
                    ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm')
                    : '—',
        },
        {
            title: 'CV',
            key: 'cv',
            render: (_value, record) => (
                <a
                    href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    Tải PDF
                </a>
            ),
        },
    ];

    return (
        <div>
            <Space wrap style={{ marginBottom: 16 }} align="center">
                <span>Lọc trạng thái:</span>
                <Select
                    style={{ minWidth: 180 }}
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v)}
                    options={[
                        { value: 'ALL', label: 'Tất cả' },
                        ...(Object.keys(RESUME_STATUS_META) as ResumeStatus[]).map(key => ({
                            value: key,
                            label: RESUME_STATUS_META[key].label,
                        })),
                    ]}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchList} loading={isFetching}>
                    Làm mới
                </Button>
                <span style={{ color: '#888', fontSize: 13 }}>
                    Tự cập nhật mỗi 20s khi tab này đang mở
                </span>
            </Space>
            <Table<IResume>
                rowKey="id"
                columns={columns}
                dataSource={filteredList}
                loading={isFetching}
                pagination={{ pageSize: 5, showSizeChanger: false }}
            />
        </div>
    );
};

const UserUpdateInfo = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.account.user);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setFetching(true);
            const res = await callFetchAccount();
            if (res?.data?.user) {
                form.setFieldsValue({
                    name: res.data.user.name,
                    email: res.data.user.email,
                    age: res.data.user.age,
                    gender: res.data.user.gender,
                    address: res.data.user.address,
                });
            } else {
                form.setFieldsValue({
                    name: user.name,
                    email: user.email,
                });
            }
            setFetching(false);
        };
        fetchProfile();
    }, []);

    const onFinish = async (values: IUser) => {
        setLoading(true);
        const res = await callUpdateAccount({
            name: values.name,
            age: +values.age,
            gender: values.gender,
            address: values.address,
        });
        setLoading(false);

        if (res?.data) {
            message.success("Cập nhật thông tin thành công");
            dispatch(setUserLoginInfo({
                id: user.id,
                email: user.email,
                name: values.name,
                role: user.role,
            }));
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            disabled={fetching}
        >
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Họ tên"
                        name="name"
                        rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Email" name="email">
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Tuổi"
                        name="age"
                        rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                    >
                        <Input type="number" min={1} placeholder="Nhập tuổi" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                    >
                        <Select allowClear placeholder="Chọn giới tính">
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                    >
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cập nhật
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

const UserChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        setLoading(true);
        const res = await callChangePassword(values.currentPassword, values.newPassword);
        setLoading(false);

        if (+res.statusCode === 200 || res.statusCode === 201) {
            message.success("Đổi mật khẩu thành công");
            form.resetFields();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: Array.isArray(res.message) ? res.message[0] : res.message
            });
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: 480 }}
        >
            <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
            >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
            >
                <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};

const JobByEmail = () => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const selectedSkillIds = Form.useWatch('skills', form) ?? [];
    const [loading, setLoading] = useState(false);
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);
    const [unsubLoading, setUnsubLoading] = useState(false);

    const isUnsubscribed = subscriber?.id && subscriber.subscribed === false;

    const selectedSkillLabels = selectedSkillIds.map((id: string) => {
        const found = optionsSkills.find(item => item.value === String(id));
        return found?.label ?? id;
    });

    const sendJobEmail = async () => {
        const emailRes = await callSendJobEmail();
        if (emailRes?.data?.sent && emailRes.data.jobCount > 0) {
            notification.success({
                message: 'Đã gửi email job',
                description: `${emailRes.data.message}. Kiểm tra Gmail: ${user.email}`,
                duration: 6,
            });
        } else {
            notification.warning({
                message: 'Đã lưu kỹ năng',
                description: emailRes?.data?.message
                    ?? 'Chưa gửi email — chưa có job khớp skill bạn chọn.',
                duration: 6,
            });
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const skillIds = (res.data.skills ?? []).map((item: any) => String(item.id));
                form.setFieldValue("skills", skillIds);
            }
        }
        init();
    }, [])

    const normalizeSkillIds = (skills: any[]) => {
        return skills?.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
                const id = item.value ?? item.id;
                return { id: Number(id) };
            }
            return { id: Number(item) };
        }) ?? [];
    };

    const onFinish = async (values: any) => {
        const { skills } = values;
        const arr = normalizeSkillIds(skills);
        setLoading(true);

        try {
            if (!subscriber?.id) {
                const data = {
                    email: user.email,
                    name: user.name,
                    skills: arr
                }

                const res = await callCreateSubscriber(data);
                if (!res.data) {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                    return;
                }
                setSubscriber(res.data);
            } else {
                const res = await callUpdateSubscriber({
                    id: subscriber.id,
                    skills: arr
                });
                if (!res.data) {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                    return;
                }
                setSubscriber(res.data);
            }

            message.success("Đã lưu kỹ năng quan tâm");
            await sendJobEmail();
        } finally {
            setLoading(false);
        }
    }

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onUnsubscribe = async () => {
        setUnsubLoading(true);
        try {
            const res = await callUnsubscribeJobEmail();
            if (res?.data) {
                setSubscriber(prev => (prev ? { ...prev, subscribed: false } : prev));
                notification.success({ message: res.data.message ?? 'Đã hủy nhận email job' });
            }
        } finally {
            setUnsubLoading(false);
        }
    };

    return (
        <>
            <p style={{ marginBottom: 16, color: '#666' }}>
                Chọn kỹ năng quan tâm. Email chỉ gồm <strong>job mới</strong> kể từ lần gửi trước.
                Hệ thống tự gửi lúc <strong>8:00 sáng</strong> (giờ VN) mỗi ngày tới <strong>{user.email}</strong>.
            </p>
            {isUnsubscribed && (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Bạn đã hủy nhận email job. Bấm Cập nhật & gửi email để đăng ký lại."
                />
            )}
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder="Tìm theo kỹ năng..."
                                options={optionsSkills}
                            />
                        </Form.Item>
                    </Col>
                    {selectedSkillLabels.length > 0 && (
                        <Col span={24}>
                            <div style={{ marginBottom: 8, color: '#666' }}>Kỹ năng đã chọn:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {selectedSkillLabels.map((label: string) => (
                                    <Tag key={label} color="blue">{label}</Tag>
                                ))}
                            </div>
                        </Col>
                    )}
                    <Col span={24}>
                        <Button type="primary" loading={loading} onClick={() => form.submit()}>
                            Cập nhật & gửi email
                        </Button>
                        {subscriber?.id && subscriber.subscribed !== false && (
                            <Button
                                danger
                                style={{ marginLeft: 12 }}
                                loading={unsubLoading}
                                onClick={onUnsubscribe}
                            >
                                Hủy nhận email
                            </Button>
                        )}
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;
    const [activeTab, setActiveTab] = useState('user-resume');

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume active={open && activeTab === 'user-resume'} />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <UserChangePassword />,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={items}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;