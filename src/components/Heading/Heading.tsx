import { FC, useMemo } from 'react';

import styles from './Heading.module.scss';
import { useSelector } from 'react-redux';
import { selectPage } from 'reducers/app/slice';
import { AppPage } from 'models/enums/appPage';

interface HeadingProps {}

export const Heading: FC<HeadingProps> = ({}) => {
  const appPage = useSelector(selectPage);

  const pageTitle = useMemo(() => {
    switch (appPage) {
      case AppPage.ONTOLOGY:
        return 'Business Ontology';
      case AppPage.DATA_HEALTH:
        return 'Data Health';
      default:
        return null;
    }
  }, [appPage]);

  return pageTitle ? <div className={styles.Heading}>{pageTitle}</div> : null;
};
