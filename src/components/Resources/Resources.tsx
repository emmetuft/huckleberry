import { FC, useState } from 'react';
import { MagnifyingGlass } from 'phosphor-react';
import styles from './Resources.module.scss';
import { ResourceList } from './ResourceList/ResourceList';
import { IconBtn } from 'components/IconBtn/IconBtn';

interface ResourcesProps {}

export const Resources: FC<ResourcesProps> = ({}) => {
  const [selectedTab, setSelectedTab] = useState<'templates' | 'agents'>(
    'templates',
  );

  return (
    <div className={styles.Resources}>
      <div className={styles.subHeader}>
        <div className={styles.subTabs}>
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
        <div>
          <IconBtn icon={<MagnifyingGlass />} />
        </div>
      </div>
      <ResourceList tab={selectedTab} />
    </div>
  );
};
