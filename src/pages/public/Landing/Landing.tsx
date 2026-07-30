import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Segmented } from 'antd';
import { CalendarDotsIcon } from '@phosphor-icons/react';
import styles from './Landing.module.css';
import { PublicPage, publicRoutePaths } from 'models/enums/appPage';
import { Background } from 'components/layouts/PlatformLayout/Background/Background';
import UseCasesCarousel from './UseCases/UseCases';
import { QuestionMarquee } from './QuestionMarquee/QuestionMarquee';
import { useIsMobile } from 'hooks/useIsMobile';

export enum UseCase {
  HR = 'HR',
  Finance = 'Finance',
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
  const isMobile = useIsMobile();

  return (
    <div className={styles.landing}>
      <Background />
      <div className={styles.hero}>
        <h1 className={styles.title}>Huckleberry</h1>
        <p className={styles.subtitle}>
          Every important decision deserves more than a chat window
        </p>
        <div className={styles.btnWrapper}>
          <Link to={`${publicRoutePaths[PublicPage.LOGIN]}?mode=signup`}>
            <Button
              type="primary"
              shape="round"
              size={isMobile ? 'small' : 'large'}
            >
              Get started for free
            </Button>
          </Link>
          <Button
            shape="round"
            size={isMobile ? 'small' : 'large'}
            icon={<CalendarDotsIcon size={20} />}
          >
            Book a demo
          </Button>
        </div>
        <Segmented
          size={isMobile ? 'small' : 'medium'}
          options={isMobile ? useCaseOptions.slice(0, 6) : useCaseOptions}
          value={useCaseOptions[selectedIndex]}
          onChange={(value) =>
            setSelectedIndex(useCaseOptions.indexOf(value as UseCase))
          }
        />
        <UseCasesCarousel
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Layers of context + memories</h2>
          <p className={styles.sectionSubtitle}>
            Build on accumulated knowledge instead of starting from scratch
            every time. Memory transforms isolated interactions into lasting
            organizational intelligence.
          </p>
        </div>
      </div>
      <div>
        <div className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
              The graph joins fragmented decisions
            </h2>
            <p className={styles.sectionSubtitle}>
              Companies can no longer get by on manager intuition, scattered
              systems, and memory. Every week, leaders face high-context
              judgment calls like these:
            </p>
          </div>
        </div>
        <QuestionMarquee />
      </div>
    </div>
  );
};
