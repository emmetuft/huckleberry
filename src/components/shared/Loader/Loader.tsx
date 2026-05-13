import { Spin, SpinProps } from 'antd';
import styles from './Loader.module.css';

export default function LoadingAnimation() {
  const stylesObject: SpinProps['styles'] = {
    indicator: {
      color: 'var(--purple)',
    },
  };

  return (
    <div className={styles.loaderContainer}>
      <Spin size="large" styles={stylesObject} />
    </div>
  );
}
