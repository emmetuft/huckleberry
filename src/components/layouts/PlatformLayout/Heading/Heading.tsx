import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Segmented } from 'antd';
import styles from './Heading.module.css';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { selectTab, setTab } from 'reducers/applications/slice';
import { AppPage, AppPageLabel } from 'models/enums/appPage';

interface HeadingProps {}

export const Heading: FC<HeadingProps> = ({}) => {
  const dispatch = useAppDispatch();
  const appPage = useSelector(selectPage);
  const applicationTab = useSelector(selectTab);

  const pageTitle = useMemo(() => {
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
      case AppPage.AGENTS:
      case AppPage.DATASOURCE:
      case AppPage.HOME:
      case AppPage.ONTOLOGY:
        return null;
      default:
        return AppPageLabel[appPage];
    }
  }, [appPage, applicationTab]);

  return pageTitle ? <div className={styles.heading}>{pageTitle}</div> : null;
};
