import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Segmented } from 'antd';
import styles from './Heading.module.css';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { selectTab, setTab } from 'reducers/applications/slice';
import { AppPage, AppPageTitle, AppPageSubtitle } from 'models/enums/appPage';

interface HeadingProps {}

export const Heading: FC<HeadingProps> = ({}) => {
  const dispatch = useAppDispatch();
  const appPage = useSelector(selectPage);
  const applicationTab = useSelector(selectTab);

  const headingContent = useMemo(() => {
    switch (appPage) {
      case AppPage.APPS:
        return (
          <div>
            <Segmented<string>
              value={applicationTab}
              options={['Apps', 'Marketplace']}
              onChange={(value) => {
                dispatch(setTab(value as 'Apps' | 'Marketplace'));
              }}
            />
          </div>
        );
      case AppPage.AGENT_DETAIL:
      case AppPage.DATASOURCE:
      case AppPage.HOME:
      case AppPage.ONTOLOGY:
      case AppPage.PROJECT_DETAIL:
        return null;
      default:
        return (
          <>
            <h1>{AppPageTitle[appPage]}</h1>
            <p>{AppPageSubtitle[appPage]}</p>
          </>
        );
    }
  }, [appPage, applicationTab]);

  return headingContent ? (
    <div className={styles.heading}>{headingContent}</div>
  ) : null;
};
