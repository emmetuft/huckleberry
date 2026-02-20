import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './Login.module.scss';

export const Login: FC = () => {
  return (
    <div className={styles.Login}>
      <div className={styles.card}>
        <h1>Login</h1>
        <p>Sign in to your account</p>
        <form className={styles.form}>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
        <p className={styles.link}>
          Don't have an account?{' '}
          <Link to={publicRoutePaths[PublicPage.SIGNUP]}>Sign up</Link>
        </p>
        <p className={styles.link}>
          <Link to={publicRoutePaths[PublicPage.RESET_PASSWORD]}>
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
};
