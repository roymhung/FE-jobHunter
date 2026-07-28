import { Button, Form, Input, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { name, email, password, age, gender, address } = values;
        setIsSubmit(true);
        const res = await callRegister(name, email, password as string, +age, gender, address);
        setIsSubmit(false);

        if (res?.data?.id) {
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
            return;
        }
        notification.error({
            message: 'Đăng ký thất bại',
            description:
                res.message && Array.isArray(res.message) ? res.message[0] : res.message,
        });
    };

    return (
        <div className={styles['login-page']}>
            <div className={`${styles['login-shell']} ${styles['login-shell--wide']}`}>
              
                <div className={styles['login-card']}>
                    <header className={styles['login-header']}>
                        <h1 className={styles['login-title']}>Đăng ký tài khoản</h1>
                        <p className={styles['login-desc']}>Điền thông tin để bắt đầu tìm việc và ứng tuyển</p>
                    </header>

                    <Form<IUser>
                        layout="vertical"
                        requiredMark={false}
                        onFinish={onFinish}
                        autoComplete="off"
                        className={styles['login-form']}
                    >
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[{ required: true, message: 'Nhập họ tên' }]}
                        >
                            <Input size="large" placeholder="Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input size="large" placeholder="name@email.com" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                { required: true, message: 'Nhập mật khẩu' },
                                { min: 6, message: 'Ít nhất 6 ký tự' },
                            ]}
                        >
                            <Input.Password size="large" placeholder="Tối thiểu 6 ký tự" />
                        </Form.Item>

                        <div className={styles['login-form-row']}>
                            <Form.Item
                                label="Tuổi"
                                name="age"
                                rules={[{ required: true, message: 'Nhập tuổi' }]}
                            >
                                <Input size="large" type="number" min={16} max={80} placeholder="22" />
                            </Form.Item>

                            <Form.Item
                                label="Giới tính"
                                name="gender"
                                rules={[{ required: true, message: 'Chọn giới tính' }]}
                            >
                                <Select size="large" placeholder="Chọn" allowClear>
                                    <Select.Option value="MALE">Nam</Select.Option>
                                    <Select.Option value="FEMALE">Nữ</Select.Option>
                                    <Select.Option value="OTHER">Khác</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Nhập địa chỉ' }]}
                        >
                            <Input size="large" placeholder="Quận, thành phố..." />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmit}
                            block
                            size="large"
                            className={styles['login-submit']}
                        >
                            Tạo tài khoản
                        </Button>
                    </Form>

                    <p className={styles['login-footer']}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
