import { FC, useMemo } from 'react';
import styles from './ResourceList.module.scss';
import { motion } from 'framer-motion';
import { useAppDispatch } from 'reducers';
import { setPage } from 'reducers/app/slice';
import {
  DEFAULT_AGENTS,
  DEFAULT_TEMPLATES,
  DEFAULT_WORKFLOW_STARTS,
} from 'constants/templates';
import { defaultMotionProps } from 'constants/styles';
import { AppPage } from 'models/enums/appPage';

interface ResourceListProps {
  tab: string;
}

export const ResourceList: FC<ResourceListProps> = ({ tab }) => {
  const dispatch = useAppDispatch();

  const resources = useMemo(
    () =>
      tab === 'templates'
        ? DEFAULT_TEMPLATES
        : tab === 'agents'
          ? DEFAULT_AGENTS
          : tab === 'startSteps'
            ? DEFAULT_WORKFLOW_STARTS
            : [],
    [tab],
  );

  const onClickResource = (resource: {
    id: string;
    name: string;
    description: string;
  }) => {
    dispatch(setPage(AppPage.WORKFLOW));
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
          <div className={styles.preview} />
          <h4>{resource.name}</h4>
          <p>{resource.description}</p>
        </motion.div>
      ))}
    </div>
  );
};
