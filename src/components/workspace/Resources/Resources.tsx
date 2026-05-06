import { FC, useState } from 'react';
// import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import styles from './Resources.module.css';
import { ResourceList } from './ResourceList/ResourceList';
// import { IconBtn } from 'components/shared/IconBtn/IconBtn';
import { formatCurrentDate } from 'utils/datetime';

interface ResourcesProps {}

export const Resources: FC<ResourcesProps> = ({}) => {
  const [selectedTab, setSelectedTab] = useState<'templates' | 'agents'>(
    'templates',
  );

  return (
    <div className={styles.Resources}>
      <div className={styles.subHeader}>
        <div className={styles.currentDate}>{formatCurrentDate()}</div>
        <h4>For you</h4>
        {/* <div className={styles.subTabs}>
          <button
            style={selectedTab !== 'templates' ? { opacity: 0.3 } : {}}
            onClick={() => setSelectedTab('templates')}
          >
            Templates
          </button>
          <button
            style={selectedTab === 'templates' ? { opacity: 0.3 } : {}}
            onClick={() => setSelectedTab('agents')}
          >
            Agents
          </button>
        </div>
        <IconBtn icon={<MagnifyingGlassIcon />} /> */}
      </div>
      <ResourceList tab={selectedTab} />
    </div>
  );
};
