import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Tag } from 'antd';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import styles from './DataSourceDetail.module.css';
import { useAppDispatch } from 'reducers';
import { fetchDataSource } from 'reducers/datasource/actions';
import { clearDataSource, selectDataSource } from 'reducers/datasource/slice';
import { AppPage, platformRoutePaths } from 'models/enums/appPage';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { DataTab } from './DataTab/DataTab';
import { AIReadinessTab } from './AIReadinessTab/AIReadinessTab';

type DetailTab = 'data' | 'ai-readiness';

export const DataSourceDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const dataSource = useSelector(selectDataSource);
  const fetchedIdRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('data');

  useEffect(() => {
    if (!id || fetchedIdRef.current === id) return;
    fetchedIdRef.current = id;
    dispatch(fetchDataSource(id));
    return () => {
      dispatch(clearDataSource());
    };
  }, [id]);

  if (!dataSource) return null;

  return (
    <div className={`platformPage ${styles.datasourceDetail}`}>
      <div className={styles.header}>
        <IconBtn
          icon={<ArrowLeftIcon size={24} />}
          onClick={() => navigate(platformRoutePaths[AppPage.DATA_HUB])}
        />
        <h1 className={styles.name}>{dataSource.name}</h1>
        <Tag color={dataSource.status === 'SUCCESS' ? 'green' : 'default'}>
          {dataSource.status}
        </Tag>
      </div>
      <div className={styles.tabButtons}>
        <Button
          shape="round"
          type={activeTab === 'data' ? 'primary' : 'default'}
          onClick={() => setActiveTab('data')}
        >
          Data
        </Button>
        <Button
          shape="round"
          type={activeTab === 'ai-readiness' ? 'primary' : 'default'}
          onClick={() => setActiveTab('ai-readiness')}
        >
          AI Readiness
        </Button>
      </div>
      {activeTab === 'data' && <DataTab />}
      {activeTab === 'ai-readiness' && <AIReadinessTab />}
    </div>
  );
};
