import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  Atom,
  Database,
  Lightning,
  TreeStructure,
  UserCircle,
} from 'phosphor-react';
import styles from './Nav.module.scss';
import { sharedIconProps } from 'constants/styles';
import { selectIdentity } from 'reducers/app/slice';
import { IconBtn } from 'components/IconBtn/IconBtn';

interface NavProps {}

export const Nav: FC<NavProps> = ({}) => {
  const identity = useSelector(selectIdentity);

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
        <IconBtn icon={<Database {...sharedIconProps} />} />
        <IconBtn icon={<TreeStructure {...sharedIconProps} />} />
        <IconBtn icon={<Lightning {...sharedIconProps} />} />
        <IconBtn icon={<Atom {...sharedIconProps} />} />
      </div>
      <div className={styles.divider} />
      <div className={`${styles.buttons} ${styles.bottom}`}>
        <IconBtn
          icon={
            avatar ? (
              <img src={avatar} alt="User Avatar" className={styles.avatar} />
            ) : (
              <UserCircle {...sharedIconProps} />
            )
          }
        />
      </div>
    </div>
  );
};
