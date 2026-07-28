import { useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Button, Col, ConfigProvider, Divider, Modal, Row, Upload, message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { FilePdfOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { callCreateResume, callUploadSingleFile } from "@/config/api";
import { useEffect, useState } from 'react';

const MAX_CV_SIZE_MB = 5;
const MAX_CV_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    jobDetail: IJob | null;
}

const ApplyModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [urlCV, setUrlCV] = useState<string>("");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isModalOpen) {
            setUrlCV("");
            setUploadedFileName("");
            setSubmitting(false);
        }
    }, [isModalOpen]);

    const validatePdfFile = (file: File) => {
        const isPdf =
            file.type === 'application/pdf' ||
            file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            message.error('Chỉ chấp nhận file CV định dạng PDF (.pdf)');
            return false;
        }
        if (file.size > MAX_CV_BYTES) {
            message.error(`File CV không được vượt quá ${MAX_CV_SIZE_MB}MB`);
            return false;
        }
        return true;
    };

    const handleOkButton = async () => {
        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`);
            return;
        }

        if (!urlCV) {
            message.error("Vui lòng upload CV (PDF)!");
            return;
        }

        if (!jobDetail?.id) {
            return;
        }

        setSubmitting(true);
        const res = await callCreateResume(urlCV, jobDetail.id, user.email, user.id);
        setSubmitting(false);

        if (res.data) {
            message.success("Rải CV thành công! Xem trạng thái tại Quản lý tài khoản → Rải CV.");
            setIsModalOpen(false);
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };

    const propsUpload: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: ".pdf,application/pdf",
        beforeUpload: (file) => {
            if (!validatePdfFile(file as File)) {
                return Upload.LIST_IGNORE;
            }
            return true;
        },
        async customRequest({ file, onSuccess, onError }: any) {
            const res = await callUploadSingleFile(file, "resume");
            if (res && res.data) {
                setUrlCV(res.data.fileName);
                setUploadedFileName((file as File).name);
                if (onSuccess) onSuccess('ok');
            } else {
                setUrlCV("");
                setUploadedFileName("");
                if (onError) {
                    const error = new Error(
                        Array.isArray(res.message) ? res.message[0] : (res.message as string)
                    );
                    onError({ event: error });
                }
            }
        },
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`Đã tải lên: ${info.file.name}`);
            } else if (info.file.status === 'error') {
                message.error(info?.file?.error?.event?.message ?? "Upload thất bại.");
            }
            if (info.file.status === 'removed') {
                setUrlCV("");
                setUploadedFileName("");
            }
        },
    };

    return (
        <Modal
            title="Ứng tuyển job"
            open={isModalOpen}
            onOk={() => handleOkButton()}
            onCancel={() => setIsModalOpen(false)}
            maskClosable={false}
            confirmLoading={submitting}
            okText={isAuthenticated ? "Gửi CV" : "Đăng nhập"}
            cancelText="Hủy"
            destroyOnClose
        >
            <Divider style={{ margin: '12px 0' }} />
            {isAuthenticated ? (
                <ConfigProvider locale={enUS}>
                    <ProForm submitter={{ render: () => null }}>
                        <Row gutter={[10, 10]}>
                            <Col span={24}>
                                <p style={{ margin: 0 }}>
                                    Ứng tuyển <b>{jobDetail?.name}</b> tại <b>{jobDetail?.company?.name}</b>
                                </p>
                                <p style={{ margin: '8px 0 0', color: '#888', fontSize: 13 }}>
                                    CV mặc định ở trạng thái <b>PENDING</b> — HR duyệt xong bạn xem tại tab Rải CV.
                                </p>
                            </Col>
                            <Col span={24}>
                                <ProFormText
                                    fieldProps={{ type: "email" }}
                                    label="Email"
                                    name="email"
                                    disabled
                                    initialValue={user?.email}
                                />
                            </Col>
                            <Col span={24}>
                                <ProForm.Item
                                    label="Upload CV (PDF)"
                                    required
                                    extra={`Chỉ file .pdf, tối đa ${MAX_CV_SIZE_MB}MB`}
                                >
                                    <Upload {...propsUpload}>
                                        <Button icon={<UploadOutlined />}>Chọn file PDF</Button>
                                    </Upload>
                                    {uploadedFileName && (
                                        <div style={{ marginTop: 8, color: '#1677ff' }}>
                                            <FilePdfOutlined /> {uploadedFileName}
                                        </div>
                                    )}
                                </ProForm.Item>
                            </Col>
                        </Row>
                    </ProForm>
                </ConfigProvider>
            ) : (
                <p>Bạn chưa đăng nhập. Vui lòng đăng nhập để nộp CV.</p>
            )}
        </Modal>
    );
};

export default ApplyModal;
