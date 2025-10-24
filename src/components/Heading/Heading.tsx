import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Segmented } from 'antd';
import styles from './Heading.module.scss';
import { useAppDispatch } from 'reducers';
import { selectPage } from 'reducers/app/slice';
import { selectTab, setTab } from 'reducers/applications/slice';
import { AppPage } from 'models/enums/appPage';

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
                dispatch(setTab(value));
              }}
            />
          </div>
        );
      case AppPage.AUTOMATION:
        return 'Automation Rules';
      case AppPage.DATA_HEALTH:
        return 'Data Health';
      case AppPage.DATA_HUB:
        return 'Data Hub';
      case AppPage.ONTOLOGY:
        return 'Business Ontology';
      default:
        return null;
    }
  }, [appPage, applicationTab]);

  return pageTitle ? <div className={styles.Heading}>{pageTitle}</div> : null;
};
