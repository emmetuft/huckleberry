import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './ResetPassword.module.css';

export const ResetPassword: FC = () => {
  return (
    <div className={styles.resetPassword}>
      <div className={styles.card}>
        <h1>Reset Password</h1>
        <p>Enter your email to receive a reset link</p>
        <form className={styles.form}>
          <input type="email" placeholder="Email" />
          <button type="submit">Send Reset Link</button>
        </form>
        <p className={styles.link}>
          Remember your password?{' '}
          <Link to={publicRoutePaths[PublicPage.LOGIN]}>Login</Link>
        </p>
      </div>
    </div>
  );
};
