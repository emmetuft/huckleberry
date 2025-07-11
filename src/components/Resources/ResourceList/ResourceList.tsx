import { FC, useMemo } from 'react';
import styles from './ResourceList.module.scss';
import { motion } from 'framer-motion';
import { DEFAULT_AGENTS, DEFAULT_TEMPLATES } from 'constants/templates';

interface ResourceListProps {
  tab: string;
}

export const ResourceList: FC<ResourceListProps> = ({ tab }) => {
  const resources = useMemo(
    () => (tab === 'templates' ? DEFAULT_TEMPLATES : DEFAULT_AGENTS),
    [tab],
  );

  return (
    <div className={styles.TemplateList}>
      {resources.map((resource) => (
        <motion.div
          key={resource.id}
          className={styles.template}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.preview} />
          <h4>{resource.name}</h4>
          <p>{resource.description}</p>
        </motion.div>
      ))}
    </div>
  );
};
