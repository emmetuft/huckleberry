import { FC, useMemo, useState } from 'react';
import { Segmented } from 'antd';
import styles from './Landing.module.scss';
import UseCasesCarousel from './UseCases/UseCases';

export enum UseCase {
  Finance = 'Finance',
  HR = 'HR',
  IT = 'IT',
  Legal = 'Legal',
  Marketing = 'Marketing',
  Manufacturing = 'Manufacturing',
  Operations = 'Operations',
  Retail = 'Retail',
  Sales = 'Sales',
  More = 'More',
}

export const Landing: FC = () => {
  const useCaseOptions = useMemo(() => Object.values(UseCase), []);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <div className={styles.Landing}>
      <div className={styles.hero}>
        <h1>Huckleberry</h1>
        <p>
          No matter the team, and no matter the task, Huckleberry elevates your
          teams to focus on the work that moves your business forward.
        </p>
        <Segmented
          options={useCaseOptions}
          value={useCaseOptions[selectedIndex]}
          onChange={(value) =>
            setSelectedIndex(useCaseOptions.indexOf(value as UseCase))
          }
        />
      </div>
      <div>
        <UseCasesCarousel
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </div>
    </div>
  );
};
