import styles from './Loader.module.scss';

export default function LoadingAnimation() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.glowOrb}>
        <div className={styles.innerOrb}></div>
      </div>

      {/* <p className={styles.loadingText}>Loading...</p> */}
    </div>
  );
}
