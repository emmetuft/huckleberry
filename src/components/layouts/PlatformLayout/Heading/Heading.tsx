import { FC } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import styles from './Heading.module.css';
import { selectPage } from 'reducers/app/slice';
import {
  staggerChildrenMotionProps,
  staggeredChildMotionProps,
} from 'constants/styles';
import { AppPage, AppPageTitle, AppPageSubtitle } from 'models/enums/appPage';

const hiddenPages = [
  AppPage.AGENT_CHAT,
  AppPage.AGENT_DETAIL,
  AppPage.AGENT_EDIT,
  AppPage.DATASOURCE,
  AppPage.HOME,
  AppPage.ONTOLOGY,
  AppPage.PROJECT_DETAIL,
  AppPage.SESSION,
  AppPage.WORKFLOW_DETAIL,
  AppPage.WORKSPACE_DETAIL,
  AppPage.WORKSPACE_CANVAS,
];

interface HeadingProps {}

export const Heading: FC<HeadingProps> = ({}) => {
  const appPage = useSelector(selectPage);
  const visible = !hiddenPages.includes(appPage);

  if (!visible) return null;

  return (
    <motion.div
      key={appPage}
      className={styles.heading}
      {...staggerChildrenMotionProps}
    >
      <motion.h1 {...staggeredChildMotionProps}>
        {AppPageTitle[appPage]}
      </motion.h1>
      <motion.p {...staggeredChildMotionProps}>
        {AppPageSubtitle[appPage]}
      </motion.p>
    </motion.div>
  );
};
