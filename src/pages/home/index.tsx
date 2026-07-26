import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const HomePage = () => {
    return (
        <div className={styles["home-section"]}>
            <div className={styles["search-content"]}>
                <div className={styles["container"]}>
                    <SearchClient />
                </div>
            </div>
            <div className={`${styles["container"]} ${styles["home-body"]}`}>
                <Divider />
                <CompanyCard />
                <div style={{ margin: 50 }}></div>
                <Divider />
                <JobCard />
            </div>
        </div>
    )
}

export default HomePage;