import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styles from './Heading.module.css';
import { selectPage } from 'reducers/app/slice';
import { AppPage, AppPageTitle, AppPageSubtitle } from 'models/enums/appPage';

interface HeadingProps {}

export const Heading: FC<HeadingProps> = ({}) => {
  const appPage = useSelector(selectPage);

  const headingContent = useMemo(() => {
    switch (appPage) {
      case AppPage.AGENT_CHAT:
      case AppPage.AGENT_DETAIL:
      case AppPage.DATASOURCE:
      case AppPage.HOME:
      case AppPage.ONTOLOGY:
      case AppPage.PROJECT_DETAIL:
      case AppPage.WORKFLOW_DETAIL:
        return null;
      default:
        return (
          <>
            <h1>{AppPageTitle[appPage]}</h1>
            <p>{AppPageSubtitle[appPage]}</p>
          </>
        );
    }
  }, [appPage]);

  return headingContent ? (
    <div className={styles.heading}>{headingContent}</div>
  ) : null;
};
