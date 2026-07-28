import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Divider, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
    /** Số công ty mỗi trang (trang /company) */
    pageSize?: number;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false, pageSize: pageSizeProp } = props;

    const initialPageSize = showPagination ? (pageSizeProp ?? 8) : 4;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    useEffect(() => {
        if (showPagination && gridRef.current) {
            gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [current, showPagination]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }


    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`)
        }
    }

    const list = displayCompany ?? [];
    const gridItems: (ICompany | null)[] =
        showPagination && list.length > 0
            ? Array.from({ length: pageSize }, (_, i) => list[i] ?? null)
            : list;

    const renderCompanyCard = (item: ICompany) => (
        <Card
            onClick={() => handleViewDetailJob(item)}
            className={styles['company-card-item']}
            hoverable
            cover={
                <div className={styles['card-customize']}>
                    <img
                        alt=""
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                    />
                </div>
            }
        >
            <Divider />
            <h3 className={styles['company-card-name']}>{item.name}</h3>
        </Card>
    );

    return (
        <div className={`${styles['company-section']} ${showPagination ? styles['company-section-paginated'] : ''}`}>
            <div className={styles['company-content']} ref={gridRef}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row
                        gutter={[20, 20]}
                        className={showPagination ? styles['company-grid-paginated'] : undefined}
                    >
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>Nhà Tuyển Dụng Hàng Đầu</span>
                                {!showPagination &&
                                    <Link to="company">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {gridItems.map((item, index) => (
                            <Col span={24} md={6} key={item?.id ?? `company-slot-${current}-${index}`}>
                                {item ? (
                                    renderCompanyCard(item)
                                ) : showPagination ? (
                                    <div className={styles['company-card-placeholder']} aria-hidden />
                                ) : null}
                            </Col>
                        ))}

                        {(!displayCompany || displayCompany.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                showSizeChanger={false}
                                onChange={(p: number) => handleOnchangePage({ current: p, pageSize })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default CompanyCard;