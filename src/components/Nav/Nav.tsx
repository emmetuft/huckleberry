import { FC } from 'react';
import {
  Atom,
  Database,
  Lightning,
  TreeStructure,
  UserCircle,
} from 'phosphor-react';
import styles from './Nav.module.scss';
import { IconBtn } from 'components/IconBtn/IconBtn';
import { useSelector } from 'react-redux';
import { selectIdentity } from 'reducers/app/slice';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const identity = useSelector(selectIdentity);

  const sharedProps = {
    color: '#2c2b2a',
    size: 24,
  };

  const avatar =
    identity !== undefined
      ? `https://${identity.host}/api/content/v1/avatar/USER/${identity.userId}?size=100`
      : undefined;

  return (
    <div className={styles.Nav}>
      <div className={styles.logo}>
        <img src="/static/logo.svg" width="100%" />
      </div>
      <div className={styles.buttons}>
        <IconBtn icon={<Database {...sharedProps} />} />
        <IconBtn icon={<TreeStructure {...sharedProps} />} />
        <IconBtn icon={<Lightning {...sharedProps} />} />
        <IconBtn icon={<Atom {...sharedProps} />} />
      </div>
      <div className={styles.divider} />
      <div className={`${styles.buttons} ${styles.bottom}`}>
        <IconBtn
          icon={
            avatar ? (
              <img
                src={avatar}
                alt="User Avatar"
                className={styles.avatar}
                // height='30px'
                // width='30px'
              />
            ) : (
              <UserCircle {...sharedProps} />
            )
          }
        />
      </div>
    </div>
  );
};
