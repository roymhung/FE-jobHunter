import { Button, Col, Form, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, SearchOutlined } from '@ant-design/icons';
import styles from '@/styles/client.module.scss';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills")
            if (queryLocation) {
                form.setFieldValue("location", queryLocation.split(","))
            }
            if (querySkills) {
                form.setFieldValue("skills", querySkills.split(","))
            }
        }
    }, [location.search])

    useEffect(() => {
        fetchSkill();
    }, [])

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

    const onFinish = async (values: any) => {
        let query = "";
        if (values?.location?.length) {
            query = `location=${values?.location?.join(",")}`;
        }
        if (values?.skills?.length) {
            query = values.location?.length ? query + `&skills=${values?.skills?.join(",")}`
                :
                `skills=${values?.skills?.join(",")}`;
        }

        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn tiêu chí để search"
            });
            return;
        }
        navigate(`/job?${query}`);
    }

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={
                {
                    render: () => <></>
                }
            }
        >
            <div className={styles['search-hero-text']}>
                <p className={styles['search-hero-badge']}>Job Hunter IT</p>
                <h1>Việc Làm IT Cho Developer &quot;Chất&quot;</h1>
                <p className={styles['search-hero-subtitle']}>
                    Khám phá hàng nghìn cơ hội từ các công ty công nghệ hàng đầu — lọc theo kỹ năng và địa điểm bạn muốn.
                </p>
            </div>
            <div className={styles['search-form-card']}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={14} lg={15}>
                        <ProForm.Item name="skills" noStyle>
                            <Select
                                mode="multiple"
                                allowClear
                                size="large"
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined className={styles['search-select-icon']} /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={5}>
                        <ProForm.Item name="location" noStyle>
                            <Select
                                mode="multiple"
                                allowClear
                                size="large"
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <EnvironmentOutlined className={styles['search-select-icon']} /> Địa điểm...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsLocations}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4} lg={4}>
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<SearchOutlined />}
                            className={styles['search-submit-btn']}
                            onClick={() => form.submit()}
                        >
                            Tìm việc
                        </Button>
                    </Col>
                </Row>
            </div>
        </ProForm>
    )
}
export default SearchClient;