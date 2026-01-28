import { FC, useMemo } from 'react';
import styles from './ResourceList.module.scss';
import { motion } from 'framer-motion';
import { DEFAULT_AGENTS, DEFAULT_TEMPLATES } from 'constants/templates';
import { defaultMotionProps } from 'constants/styles';

interface ResourceListProps {
  tab: string;
}

export const ResourceList: FC<ResourceListProps> = ({ tab }) => {
  const resources: {
    id: string;
    name: string;
    description: string;
    image?: string;
  }[] = useMemo(
    () =>
      tab === 'templates'
        ? DEFAULT_TEMPLATES
        : tab === 'agents'
          ? DEFAULT_AGENTS
          : [],
    [tab],
  );

  const onClickResource = (resource: {
    id: string;
    name: string;
    description: string;
  }) => {
    console.log('Clicked resource:', resource);
  };

  return (
    <div className={styles.TemplateList}>
      {resources.map((resource) => (
        <motion.div
          {...defaultMotionProps}
          key={resource.id}
          className={styles.template}
          onClick={() => onClickResource(resource)}
        >
          {resource.image ? (
            <img src={resource.image} />
          ) : (
            <div className={styles.preview} />
          )}
          {/* <h4>{resource.name}</h4> */}
          <p>{resource.description}</p>
        </motion.div>
      ))}
    </div>
  );
};
