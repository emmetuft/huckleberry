import { FC } from 'react';
import { Link } from 'react-router-dom';
import { publicRoutePaths, PublicPage } from 'models/enums/appPage';
import styles from './Signup.module.scss';

export const Signup: FC = () => {
  return (
    <div className={styles.Signup}>
      <div className={styles.card}>
        <h1>Sign Up</h1>
        <p>Create your account</p>
        <form className={styles.form}>
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign Up</button>
        </form>
        <p className={styles.link}>
          Already have an account?{' '}
          <Link to={publicRoutePaths[PublicPage.LOGIN]}>Login</Link>
        </p>
      </div>
    </div>
  );
};
